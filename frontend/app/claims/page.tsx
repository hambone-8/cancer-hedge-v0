'use client'

import { useAccount } from 'wagmi'
import { ClaimSubmission } from '@/components/ClaimSubmission'
import { ClaimStatus } from '@/components/ClaimStatus'

export default function Claims() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Claims</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view and submit claims.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Claims</h1>

      {/* Claim Status */}
      <ClaimStatus />

      {/* Claim Submission */}
      <ClaimSubmission />

      {/* Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">
          How Claims Work
        </h3>
        <ul className="space-y-2 text-blue-700 text-sm">
          <li>• You must have completed the 6-month waiting period</li>
          <li>• A verified diagnosis from a whitelisted doctor is required</li>
          <li>• Claims are reviewed and approved by protocol administrators</li>
          <li>• Payouts are made directly to your wallet upon approval</li>
          <li>• You can only claim once per enrollment</li>
        </ul>
      </div>
    </div>
  )
}

