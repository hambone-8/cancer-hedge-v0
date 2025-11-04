'use client'

import { useState } from 'react'
import { useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { parseUSDC, formatUSDC } from '@/lib/utils'

export function ProtocolControls() {
  const [newPremium, setNewPremium] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPausing, setIsPausing] = useState(false)

  const { data: currentPremium } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'monthlyPremium',
  })

  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'paused',
  })

  const { writeContractAsync: updatePremium } = useWriteContract()
  const { writeContractAsync: pause } = useWriteContract()
  const { writeContractAsync: unpause } = useWriteContract()

  const handleUpdatePremium = async () => {
    const premiumValue = parseFloat(newPremium)
    if (isNaN(premiumValue) || premiumValue <= 0) {
      alert('Please enter a valid premium amount')
      return
    }

    setIsUpdating(true)
    try {
      await updatePremium({
        address: CONTRACTS.riskPool as `0x${string}`,
        abi: RISKPOOL_ABI,
        functionName: 'updatePremium',
        args: [parseUSDC(premiumValue)],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Premium updated successfully!')
      setNewPremium('')
    } catch (error) {
      console.error('Premium update failed:', error)
      alert('Premium update failed. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTogglePause = async () => {
    setIsPausing(true)
    try {
      if (isPaused) {
        await unpause({
          address: CONTRACTS.riskPool as `0x${string}`,
          abi: RISKPOOL_ABI,
          functionName: 'unpause',
        })
        alert('Protocol unpaused successfully!')
      } else {
        await pause({
          address: CONTRACTS.riskPool as `0x${string}`,
          abi: RISKPOOL_ABI,
          functionName: 'pause',
        })
        alert('Protocol paused successfully!')
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
      refetchPaused()
    } catch (error) {
      console.error('Pause/unpause failed:', error)
      alert('Operation failed. Please try again.')
    } finally {
      setIsPausing(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Protocol Controls</h3>

      <div className="space-y-6">
        {/* Premium Update */}
        <div>
          <h4 className="font-semibold mb-2">Update Monthly Premium</h4>
          <p className="text-sm text-gray-600 mb-3">
            Current: {currentPremium ? formatUSDC(currentPremium) : '...'}
          </p>
          <div className="flex gap-3">
            <input
              type="number"
              value={newPremium}
              onChange={(e) => setNewPremium(e.target.value)}
              placeholder="New premium amount (e.g., 25)"
              className="input-field flex-1"
            />
            <button
              onClick={handleUpdatePremium}
              disabled={!newPremium || isUpdating}
              className="btn-primary"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Pause/Unpause */}
        <div>
          <h4 className="font-semibold mb-2">Pause Protocol</h4>
          <p className="text-sm text-gray-600 mb-3">
            Status: {isPaused ? (
              <span className="badge-red">Paused</span>
            ) : (
              <span className="badge-green">Active</span>
            )}
          </p>
          <button
            onClick={handleTogglePause}
            disabled={isPausing}
            className={isPaused ? 'btn-primary' : 'btn-danger'}
          >
            {isPausing ? 'Processing...' : isPaused ? 'Unpause Protocol' : 'Pause Protocol'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Pausing prevents new enrollments and premium payments. Use in emergency situations only.
          </p>
        </div>
      </div>
    </div>
  )
}

