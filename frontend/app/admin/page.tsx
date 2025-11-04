'use client'

import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { DoctorManagement } from '@/components/admin/DoctorManagement'
import { ClaimReview } from '@/components/admin/ClaimReview'
import { ProtocolControls } from '@/components/admin/ProtocolControls'
import { AdminStats } from '@/components/admin/AdminStats'

export default function Admin() {
  const { address, isConnected } = useAccount()

  // Check if user is admin
  const { data: adminAddress } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'admin',
  })

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the admin panel.
          </p>
        </div>
      </div>
    )
  }

  const isAdmin = address && adminAddress && address.toLowerCase() === adminAddress.toLowerCase()

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have administrator privileges.
          </p>
          <p className="text-sm text-gray-500">
            Admin address: {adminAddress as string}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Stats Overview */}
      <AdminStats />

      {/* Doctor Management */}
      <DoctorManagement />

      {/* Claim Review */}
      <ClaimReview />

      {/* Protocol Controls */}
      <ProtocolControls />
    </div>
  )
}

