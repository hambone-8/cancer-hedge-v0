'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { formatUSDC } from '@/lib/utils'

export function AdminStats() {
  // Read protocol stats
  const { data: totalPremiums } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'totalPremiumsCollected',
  })

  const { data: totalPayouts } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'totalPayoutsIssued',
  })

  const { data: reserveBalance } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getReserveBalance',
  })

  const { data: enrolledCount } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getEnrolledUsersCount',
  })

  const { data: pendingClaimsCount } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getPendingClaimsCount',
  })

  const { data: isPaused } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'paused',
  })

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Total Premiums Collected</p>
        <p className="text-2xl font-bold">{totalPremiums ? formatUSDC(totalPremiums) : '...'}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Total Payouts Issued</p>
        <p className="text-2xl font-bold">{totalPayouts ? formatUSDC(totalPayouts) : '...'}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Current Reserve</p>
        <p className="text-2xl font-bold">{reserveBalance ? formatUSDC(reserveBalance) : '...'}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Enrolled Users</p>
        <p className="text-2xl font-bold">{enrolledCount?.toString() || '0'}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Pending Claims</p>
        <p className="text-2xl font-bold">{pendingClaimsCount?.toString() || '0'}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 mb-1">Protocol Status</p>
        <p className="text-2xl font-bold">
          {isPaused ? (
            <span className="badge-red">Paused</span>
          ) : (
            <span className="badge-green">Active</span>
          )}
        </p>
      </div>
    </div>
  )
}

