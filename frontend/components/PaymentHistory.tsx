'use client'

import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { formatUSDC, formatDate } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface PaymentEvent {
  user: string
  amount: bigint
  timestamp: bigint
}

export function PaymentHistory() {
  const { address } = useAccount()
  const [payments, setPayments] = useState<PaymentEvent[]>([])

  // Read enrollment info to get basic data
  const { data: enrollmentInfo } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getEnrollmentInfo',
    args: address ? [address] : undefined,
  })

  const isEnrolled = enrollmentInfo?.[2] // isActive

  if (!isEnrolled) {
    return null
  }

  // For v0, we'll show a simplified payment history based on enrollment data
  // In v1, we can add event indexing for full history
  const totalPremiumsPaid = enrollmentInfo?.[4] || 0n
  const lastPremiumPayment = enrollmentInfo?.[1] || 0n

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Payment Summary</h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Total Premiums Paid</p>
            <p className="text-2xl font-bold">{formatUSDC(totalPremiumsPaid)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Payment</p>
            <p className="font-semibold">{formatDate(lastPremiumPayment)}</p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Note: Full transaction history can be viewed on the blockchain explorer. 
            Future versions will include detailed payment history here.
          </p>
        </div>
      </div>
    </div>
  )
}

