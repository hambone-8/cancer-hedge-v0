'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI, STAGE_NAMES, CancerStage } from '@/lib/contracts'
import { formatUSDC, formatDate, shortenAddress } from '@/lib/utils'

export function ClaimReview() {
  const [pendingClaims, setPendingClaims] = useState<string[]>([])
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: pendingCount } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getPendingClaimsCount',
  })

  const { writeContractAsync: approveClaim } = useWriteContract()
  const { writeContractAsync: rejectClaim } = useWriteContract()
  const { writeContractAsync: executePayout } = useWriteContract()

  // Fetch pending claims (simplified for v0)
  // In production, you'd use event indexing or a subgraph
  useEffect(() => {
    const fetchPendingClaims = async () => {
      if (!pendingCount || pendingCount === 0n) {
        setPendingClaims([])
        return
      }

      // For v0, we'll need to manually track or the admin can input addresses
      // In v1, we'd use events or a subgraph
      setPendingClaims([])
    }

    fetchPendingClaims()
  }, [pendingCount])

  const handleApprove = async (patientAddress: string) => {
    try {
      await approveClaim({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'approveClaim',
        args: [patientAddress as `0x${string}`],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Claim approved successfully!')
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Approval failed. Please try again.')
    }
  }

  const handleReject = async (patientAddress: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      await rejectClaim({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'rejectClaim',
        args: [patientAddress as `0x${string}`, rejectReason],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Claim rejected.')
      setRejectReason('')
      setSelectedClaim(null)
    } catch (error) {
      console.error('Rejection failed:', error)
      alert('Rejection failed. Please try again.')
    }
  }

  const handleExecutePayout = async (patientAddress: string) => {
    try {
      await executePayout({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'executePayout',
        args: [patientAddress as `0x${string}`],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Payout executed successfully!')
    } catch (error) {
      console.error('Payout execution failed:', error)
      alert('Payout execution failed. Please try again.')
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Claim Review</h3>

      <div className="mb-4">
        <p className="text-gray-600">
          Pending Claims: <span className="font-semibold">{pendingCount?.toString() || '0'}</span>
        </p>
      </div>

      {/* Manual Claim Review Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Address (to review claim)
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="input-field"
            onChange={(e) => setSelectedClaim(e.target.value)}
          />
        </div>

        {selectedClaim && (
          <ClaimDetails
            patientAddress={selectedClaim}
            onApprove={handleApprove}
            onReject={() => {}}
            onExecutePayout={handleExecutePayout}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
          />
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> For v0, you need to manually enter patient addresses to review claims.
          Future versions will include automatic claim listing and event indexing.
        </p>
      </div>
    </div>
  )
}

function ClaimDetails({
  patientAddress,
  onApprove,
  onReject,
  onExecutePayout,
  rejectReason,
  setRejectReason,
}: {
  patientAddress: string
  onApprove: (address: string) => void
  onReject: (address: string) => void
  onExecutePayout: (address: string) => void
  rejectReason: string
  setRejectReason: (reason: string) => void
}) {
  const [showRejectForm, setShowRejectForm] = useState(false)

  const { data: claimInfo } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getClaimInfo',
    args: [patientAddress as `0x${string}`],
  })

  if (!claimInfo || claimInfo[1] === 0n) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No claim found for this address.</p>
      </div>
    )
  }

  const [stage, timestamp, approved, paid, amount] = claimInfo

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Patient</p>
          <p className="font-semibold">{shortenAddress(patientAddress)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Stage</p>
          <p className="font-semibold">{STAGE_NAMES[stage as CancerStage]}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold">{formatUSDC(amount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Submitted</p>
          <p className="font-semibold">{formatDate(timestamp)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          {paid ? (
            <span className="badge-green">Paid</span>
          ) : approved ? (
            <span className="badge-blue">Approved</span>
          ) : (
            <span className="badge-yellow">Pending</span>
          )}
        </div>
      </div>

      {!approved && !paid && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(patientAddress)}
            className="btn-primary flex-1"
          >
            Approve Claim
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="btn-danger flex-1"
          >
            Reject Claim
          </button>
        </div>
      )}

      {showRejectForm && !approved && !paid && (
        <div className="space-y-3">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            className="input-field"
          />
          <button
            onClick={() => {
              onReject(patientAddress)
              setShowRejectForm(false)
            }}
            className="btn-danger w-full"
          >
            Confirm Rejection
          </button>
        </div>
      )}

      {approved && !paid && (
        <button
          onClick={() => onExecutePayout(patientAddress)}
          className="btn-primary w-full"
        >
          Execute Payout
        </button>
      )}

      {paid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-sm">✓ Payout completed</p>
        </div>
      )}
    </div>
  )
}

