'use client'

import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI, VERIFICATION_ABI, STAGE_NAMES, STAGE_PAYOUTS, CancerStage } from '@/lib/contracts'
import { formatUSDC, formatDate } from '@/lib/utils'

export function ClaimStatus() {
  const { address } = useAccount()

  // Read claim info
  const { data: claimInfo } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getClaimInfo',
    args: address ? [address] : undefined,
  })

  // Read diagnosis info
  const { data: diagnosisInfo } = useReadContract({
    address: CONTRACTS.verification as `0x${string}`,
    abi: VERIFICATION_ABI,
    functionName: 'getDiagnosis',
    args: address ? [address] : undefined,
  })

  const hasClaim = claimInfo && claimInfo[1] > 0n // timestamp > 0
  const hasDiagnosis = diagnosisInfo?.[3] // exists

  if (!hasClaim && !hasDiagnosis) {
    return null
  }

  if (hasDiagnosis && !hasClaim) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Diagnosis Recorded
        </h3>
        <div className="space-y-2 text-yellow-700">
          <p>
            <span className="font-semibold">Stage:</span> {STAGE_NAMES[diagnosisInfo[0] as CancerStage]}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {formatDate(diagnosisInfo[2])}
          </p>
          <p className="text-sm mt-4">
            You can submit a claim if you have passed the waiting period.
          </p>
        </div>
      </div>
    )
  }

  if (!hasClaim) {
    return null
  }

  const [stage, timestamp, approved, paid, amount] = claimInfo

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Your Claim</h3>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Stage</p>
            <p className="font-semibold">{STAGE_NAMES[stage as CancerStage]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Payout Amount</p>
            <p className="font-semibold">{formatUSDC(amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted</p>
            <p className="font-semibold">{formatDate(timestamp)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {paid ? (
              <span className="badge-green">Paid</span>
            ) : approved ? (
              <span className="badge-blue">Approved - Pending Payout</span>
            ) : (
              <span className="badge-yellow">Under Review</span>
            )}
          </div>
        </div>

        {approved && !paid && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold">
              ✓ Your claim has been approved!
            </p>
            <p className="text-blue-700 text-sm mt-1">
              The payout will be processed shortly and sent to your wallet.
            </p>
          </div>
        )}

        {paid && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ Payout completed!
            </p>
            <p className="text-green-700 text-sm mt-1">
              {formatUSDC(amount)} has been sent to your wallet.
            </p>
          </div>
        )}

        {!approved && !paid && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              Claim Under Review
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Your claim is being reviewed by protocol administrators. You will be notified once a decision is made.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

