'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI, USDC_ABI } from '@/lib/contracts'
import { formatUSDC, parseUSDC } from '@/lib/utils'

export function EnrollmentCard() {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

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

  // Read USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.usdc as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.riskPool as `0x${string}`] : undefined,
  })

  const { writeContractAsync: approveUSDC } = useWriteContract()
  const { writeContractAsync: enroll } = useWriteContract()

  const isEnrolled = enrollmentInfo?.[2] // isActive

  const handleApprove = async () => {
    if (!monthlyPremium) return
    setIsApproving(true)
    try {
      const tx = await approveUSDC({
        address: CONTRACTS.usdc as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.riskPool as `0x${string}`, monthlyPremium],
      })
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refetchAllowance()
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Approval failed. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      const tx = await enroll({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'enroll',
      })
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      await refetchEnrollment()
      alert('Successfully enrolled! Welcome to Hedgely.')
    } catch (error) {
      console.error('Enrollment failed:', error)
      alert('Enrollment failed. Please try again.')
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isEnrolled) {
    return (
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          ✓ You're Enrolled!
        </h3>
        <p className="text-green-700">
          You are successfully enrolled in Hedgely. Visit your dashboard to manage your coverage.
        </p>
      </div>
    )
  }

  const hasAllowance = allowance && monthlyPremium && allowance >= monthlyPremium
  const needsApproval = !hasAllowance

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Enroll in Hedgely</h3>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Monthly Premium: <span className="font-semibold">{monthlyPremium ? formatUSDC(monthlyPremium) : '...'}</span>
        </p>
        <p className="text-sm text-gray-500">
          By enrolling, you agree to pay the monthly premium and accept a 6-month waiting period before claims are eligible.
        </p>
      </div>

      <div className="space-y-3">
        {needsApproval && (
          <button
            onClick={handleApprove}
            disabled={isApproving || !monthlyPremium}
            className="btn-primary w-full"
          >
            {isApproving ? 'Approving...' : '1. Approve USDC'}
          </button>
        )}
        
        <button
          onClick={handleEnroll}
          disabled={needsApproval || isEnrolling}
          className="btn-primary w-full"
        >
          {isEnrolling ? 'Enrolling...' : needsApproval ? '2. Enroll (Approve First)' : 'Enroll Now'}
        </button>
      </div>

      {needsApproval && (
        <p className="text-xs text-gray-500 mt-4">
          Note: You need to approve USDC spending first, then complete enrollment.
        </p>
      )}
    </div>
  )
}

