'use client'

import { useAccount } from 'wagmi'
import { EnrollmentCard } from '@/components/EnrollmentCard'
import { UserStatus } from '@/components/UserStatus'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Hedgely
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          A Decentralized, Transparent Cancer Support Protocol
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          Simple, fair, and transparent financial support for individuals facing breast cancer.
          No bureaucracy. No profit-seeking intermediaries. Just peace of mind when you need it most.
        </p>
      </section>

      {/* Value Proposition */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Transparent</h3>
          <p className="text-gray-600 text-sm">
            All funds and transactions are publicly visible on the blockchain. No hidden fees or surprise deductions.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold mb-2">Simple</h3>
          <p className="text-gray-600 text-sm">
            One-time lump-sum payment upon verified diagnosis. No paperwork, no denials, no waiting.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="text-lg font-semibold mb-2">Fair</h3>
          <p className="text-gray-600 text-sm">
            Community-governed with no profit motive. Coverage based on need, not pre-existing conditions.
          </p>
        </div>
      </section>

      {/* Coverage Details */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Coverage Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Monthly Premium</h3>
            <p className="text-gray-600">$20 USDC per month (locked for 5-year terms)</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Payouts by Stage</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="badge-blue mr-3">Stage II</span>
                <span>$25,000 one-time payment</span>
              </li>
              <li className="flex items-center">
                <span className="badge-yellow mr-3">Stage III</span>
                <span>$50,000 one-time payment</span>
              </li>
              <li className="flex items-center">
                <span className="badge-red mr-3">Stage IV</span>
                <span>$75,000 one-time payment</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Eligibility</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Diagnosis by U.S.-licensed medical doctor</li>
              <li>6-month waiting period after enrollment</li>
              <li>No evaluation of pre-existing conditions</li>
              <li>One-time payout per enrollment</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Enrollment / Status Section */}
      <section>
        {isConnected ? (
          <>
            <UserStatus />
            <div className="mt-6">
              <EnrollmentCard />
            </div>
          </>
        ) : (
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to enroll in Hedgely and secure your coverage today.
            </p>
            <p className="text-sm text-gray-500">
              Click "Connect Wallet" in the top right corner to begin.
            </p>
          </div>
        )}
      </section>

      {/* Philosophy */}
      <section className="card bg-primary-50 border-primary-200">
        <blockquote className="text-center">
          <p className="text-lg italic text-gray-700 mb-2">
            "Elegance is not the abundance of simplicity. It is the absence of complexity."
          </p>
          <cite className="text-sm text-gray-600">— Vitalik Buterin</cite>
        </blockquote>
      </section>
    </div>
  )
}

