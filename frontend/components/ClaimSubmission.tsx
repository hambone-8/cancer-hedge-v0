'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI, VERIFICATION_ABI } from '@/lib/contracts'

export function ClaimSubmission() {
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Read diagnosis info
  const { data: diagnosisInfo } = useReadContract({
    address: CONTRACTS.verification as `0x${string}`,
    abi: VERIFICATION_ABI,
    functionName: 'getDiagnosis',
    args: address ? [address] : undefined,
  })

  // Read claim info
  const { data: claimInfo } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getClaimInfo',
    args: address ? [address] : undefined,
  })

  const { writeContractAsync: submitClaim } = useWriteContract()

  const isEnrolled = enrollmentInfo?.[2] // isActive
  const hasClaimed = enrollmentInfo?.[3] // hasClaimed
  const hasDiagnosis = diagnosisInfo?.[3] // exists
  const hasActiveClaim = claimInfo && claimInfo[1] > 0n // timestamp > 0

  const canSubmitClaim = isEnrolled && hasPassedWaiting && hasDiagnosis && !hasClaimed && !hasActiveClaim

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitClaim({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'submitClaim',
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Claim submitted successfully! It will be reviewed by administrators.')
    } catch (error) {
      console.error('Claim submission failed:', error)
      alert('Claim submission failed. Please ensure you meet all requirements and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasActiveClaim) {
    return null // Claim status component will show the active claim
  }

  if (hasClaimed) {
    return (
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Claim Already Processed
        </h3>
        <p className="text-green-700">
          You have already claimed and received your payout. Only one claim is allowed per enrollment.
        </p>
      </div>
    )
  }

  if (!isEnrolled) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Not Enrolled
        </h3>
        <p className="text-yellow-700">
          You must be enrolled in Hedgely to submit a claim. Please enroll first.
        </p>
      </div>
    )
  }

  if (!hasPassedWaiting) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Waiting Period Not Complete
        </h3>
        <p className="text-yellow-700">
          You must complete the 6-month waiting period before submitting a claim. 
          Check your dashboard to see when your waiting period ends.
        </p>
      </div>
    )
  }

  if (!hasDiagnosis) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          No Diagnosis on Record
        </h3>
        <p className="text-yellow-700 mb-4">
          A verified diagnosis from a whitelisted doctor must be submitted before you can claim.
          Please have your doctor submit your diagnosis through the protocol.
        </p>
        <p className="text-yellow-700 text-sm">
          Note: Only doctors whitelisted by protocol administrators can submit diagnoses.
          This is a security measure for v0 that will be enhanced in future versions.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Submit Claim</h3>

      <p className="text-gray-600 mb-6">
        You are eligible to submit a claim. Once submitted, it will be reviewed by protocol administrators
        and, if approved, your payout will be sent to your wallet.
      </p>

      <button
        onClick={handleSubmit}
        disabled={!canSubmitClaim || isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
      </button>
    </div>
  )
}

