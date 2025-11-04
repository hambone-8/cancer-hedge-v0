'use client'

import { useAccount } from 'wagmi'
import { UserStatus } from '@/components/UserStatus'
import { PremiumPayment } from '@/components/PremiumPayment'
import { PaymentHistory } from '@/components/PaymentHistory'
import Link from 'next/link'

export default function Dashboard() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* User Status */}
      <UserStatus />

      {/* Premium Payment */}
      <PremiumPayment />

      {/* Payment History */}
      <PaymentHistory />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/claims" className="btn-primary text-center">
            Submit a Claim
          </Link>
          <Link href="/transparency" className="btn-secondary text-center">
            View Reserve Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

