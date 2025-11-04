'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { formatUSDC } from '@/lib/utils'

export function ReserveStats() {
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

  // Calculate reserve ratio (simple: balance / (premiums - payouts))
  let reserveRatio = 0
  if (totalPremiums && totalPayouts && totalPremiums > 0n) {
    const netPremiums = totalPremiums - totalPayouts
    if (netPremiums > 0n && reserveBalance) {
      reserveRatio = Number(reserveBalance) / Number(netPremiums)
    }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card bg-primary-50 border-primary-200">
        <p className="text-sm text-primary-600 mb-1">Total Premiums Collected</p>
        <p className="text-3xl font-bold text-primary-800">
          {totalPremiums ? formatUSDC(totalPremiums) : '$0.00'}
        </p>
      </div>

      <div className="card bg-red-50 border-red-200">
        <p className="text-sm text-red-600 mb-1">Total Payouts Issued</p>
        <p className="text-3xl font-bold text-red-800">
          {totalPayouts ? formatUSDC(totalPayouts) : '$0.00'}
        </p>
      </div>

      <div className="card bg-green-50 border-green-200">
        <p className="text-sm text-green-600 mb-1">Current Reserve Balance</p>
        <p className="text-3xl font-bold text-green-800">
          {reserveBalance ? formatUSDC(reserveBalance) : '$0.00'}
        </p>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-600 mb-1">Enrolled Members</p>
        <p className="text-3xl font-bold text-blue-800">
          {enrolledCount?.toString() || '0'}
        </p>
      </div>
    </div>
  )
}

