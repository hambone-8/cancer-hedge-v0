'use client'

import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { formatUSDC, formatDate, getWaitingPeriodEnd } from '@/lib/utils'

export function UserStatus() {
  const { address } = useAccount()

  // Read enrollment info
  const { data: enrollmentInfo } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getEnrollmentInfo',
    args: address ? [address] : undefined,
  })

  // Read waiting period status
  const { data: hasPassedWaiting } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'hasPassedWaitingPeriod',
    args: address ? [address] : undefined,
  })

  if (!enrollmentInfo || !enrollmentInfo[2]) {
    // Not enrolled
    return null
  }

  const [enrollmentDate, lastPremiumPayment, isActive, hasClaimed, totalPremiumsPaid] = enrollmentInfo
  const waitingPeriodEnd = getWaitingPeriodEnd(enrollmentDate)
  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((waitingPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Your Coverage Status</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Enrollment Date</p>
          <p className="font-semibold">{formatDate(enrollmentDate)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          {hasClaimed ? (
            <span className="badge-green">Claimed</span>
          ) : hasPassedWaiting ? (
            <span className="badge-green">Active - Eligible</span>
          ) : (
            <span className="badge-yellow">Waiting Period</span>
          )}
        </div>

        {!hasPassedWaiting && !hasClaimed && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Waiting Period Ends</p>
            <p className="font-semibold">
              {formatDate(BigInt(Math.floor(waitingPeriodEnd.getTime() / 1000)))}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {daysRemaining} days remaining
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-1">Total Premiums Paid</p>
          <p className="font-semibold">{formatUSDC(totalPremiumsPaid)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Last Premium Payment</p>
          <p className="font-semibold">{formatDate(lastPremiumPayment)}</p>
        </div>
      </div>

      {hasPassedWaiting && !hasClaimed && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ You are eligible to submit claims!
          </p>
          <p className="text-green-700 text-sm mt-1">
            If you have received a diagnosis, you can submit a claim on the Claims page.
          </p>
        </div>
      )}
    </div>
  )
}

