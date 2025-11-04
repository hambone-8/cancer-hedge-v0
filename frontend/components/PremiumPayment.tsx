'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI, USDC_ABI } from '@/lib/contracts'
import { formatUSDC } from '@/lib/utils'

export function PremiumPayment() {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  // Read monthly premium
  const { data: monthlyPremium } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'monthlyPremium',
  })

  // Read enrollment info
  const { data: enrollmentInfo, refetch: refetchEnrollment } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getEnrollmentInfo',
    args: address ? [address] : undefined,
  })

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.usdc as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.usdc as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.riskPool as `0x${string}`] : undefined,
  })

  const { writeContractAsync: approveUSDC } = useWriteContract()
  const { writeContractAsync: payPremium } = useWriteContract()

  const isEnrolled = enrollmentInfo?.[2] // isActive

  if (!isEnrolled) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Not Enrolled
        </h3>
        <p className="text-yellow-700">
          You need to enroll first before you can pay premiums.
        </p>
      </div>
    )
  }

  const hasAllowance = allowance && monthlyPremium && allowance >= monthlyPremium
  const hasSufficientBalance = usdcBalance && monthlyPremium && usdcBalance >= monthlyPremium

  const handleApprove = async () => {
    if (!monthlyPremium) return
    setIsApproving(true)
    try {
      await approveUSDC({
        address: CONTRACTS.usdc as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.riskPool as `0x${string}`, monthlyPremium * 12n], // Approve for 12 months
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refetchAllowance()
      alert('USDC approved successfully!')
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Approval failed. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handlePayPremium = async () => {
    setIsPaying(true)
    try {
      await payPremium({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'payPremium',
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refetchEnrollment()
      await refetchAllowance()
      alert('Premium paid successfully!')
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Pay Monthly Premium</h3>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Premium:</span>
          <span className="font-semibold">{monthlyPremium ? formatUSDC(monthlyPremium) : '...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Your USDC Balance:</span>
          <span className="font-semibold">{usdcBalance ? formatUSDC(usdcBalance) : '...'}</span>
        </div>
        {!hasSufficientBalance && (
          <p className="text-sm text-red-600">
            Insufficient USDC balance. Please acquire more USDC to pay your premium.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {!hasAllowance && (
          <button
            onClick={handleApprove}
            disabled={isApproving || !monthlyPremium}
            className="btn-primary w-full"
          >
            {isApproving ? 'Approving...' : 'Approve USDC'}
          </button>
        )}

        <button
          onClick={handlePayPremium}
          disabled={!hasAllowance || isPaying || !hasSufficientBalance}
          className="btn-primary w-full"
        >
          {isPaying ? 'Processing...' : 'Pay Premium'}
        </button>
      </div>

      {!hasAllowance && (
        <p className="text-xs text-gray-500 mt-4">
          Note: Approve USDC spending first (one-time for 12 months), then pay your monthly premium.
        </p>
      )}
    </div>
  )
}

