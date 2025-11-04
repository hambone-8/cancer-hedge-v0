'use client'

import { useState } from 'react'
import { useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS, VERIFICATION_ABI } from '@/lib/contracts'
import { isAddress } from 'ethers'

export function DoctorManagement() {
  const [doctorAddress, setDoctorAddress] = useState('')
  const [checkAddress, setCheckAddress] = useState('')
  const [isWhitelisting, setIsWhitelisting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const { writeContractAsync: whitelistDoctor } = useWriteContract()
  const { writeContractAsync: removeDoctor } = useWriteContract()

  // Check if address is whitelisted
  const { data: isWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: CONTRACTS.verification as `0x${string}`,
    abi: VERIFICATION_ABI,
    functionName: 'isWhitelistedDoctor',
    args: checkAddress && isAddress(checkAddress) ? [checkAddress as `0x${string}`] : undefined,
  })

  const handleWhitelist = async () => {
    if (!isAddress(doctorAddress)) {
      alert('Invalid Ethereum address')
      return
    }

    setIsWhitelisting(true)
    try {
      await whitelistDoctor({
        address: CONTRACTS.verification as `0x${string}`,
        abi: VERIFICATION_ABI,
        functionName: 'whitelistDoctor',
        args: [doctorAddress as `0x${string}`],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Doctor whitelisted successfully!')
      setDoctorAddress('')
      if (checkAddress === doctorAddress) {
        refetchWhitelist()
      }
    } catch (error) {
      console.error('Whitelisting failed:', error)
      alert('Whitelisting failed. Please try again.')
    } finally {
      setIsWhitelisting(false)
    }
  }

  const handleRemove = async () => {
    if (!isAddress(doctorAddress)) {
      alert('Invalid Ethereum address')
      return
    }

    setIsRemoving(true)
    try {
      await removeDoctor({
        address: CONTRACTS.verification as `0x${string}`,
        abi: VERIFICATION_ABI,
        functionName: 'removeDoctor',
        args: [doctorAddress as `0x${string}`],
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Doctor removed successfully!')
      setDoctorAddress('')
      if (checkAddress === doctorAddress) {
        refetchWhitelist()
      }
    } catch (error) {
      console.error('Removal failed:', error)
      alert('Removal failed. Please try again.')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleCheck = () => {
    if (isAddress(doctorAddress)) {
      setCheckAddress(doctorAddress)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Doctor Management</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Doctor Wallet Address
          </label>
          <input
            type="text"
            value={doctorAddress}
            onChange={(e) => setDoctorAddress(e.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleWhitelist}
            disabled={!doctorAddress || isWhitelisting || isRemoving}
            className="btn-primary flex-1"
          >
            {isWhitelisting ? 'Whitelisting...' : 'Whitelist Doctor'}
          </button>
          <button
            onClick={handleRemove}
            disabled={!doctorAddress || isWhitelisting || isRemoving}
            className="btn-danger flex-1"
          >
            {isRemoving ? 'Removing...' : 'Remove Doctor'}
          </button>
          <button
            onClick={handleCheck}
            disabled={!doctorAddress}
            className="btn-secondary"
          >
            Check Status
          </button>
        </div>

        {checkAddress && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Status for: {checkAddress}</p>
            <p className="font-semibold">
              {isWhitelisted ? (
                <span className="badge-green">Whitelisted</span>
              ) : (
                <span className="badge-red">Not Whitelisted</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

