'use client'

import { ReserveStats } from '@/components/ReserveStats'
import { ReserveChart } from '@/components/ReserveChart'

export default function Transparency() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reserve Dashboard</h1>
        <p className="text-gray-600">
          Complete transparency into the Hedgely protocol's financial health and operations.
        </p>
      </div>

      {/* Key Stats */}
      <ReserveStats />

      {/* Visual Chart */}
      <ReserveChart />

      {/* Protocol Information */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">About Reserve Transparency</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Total Transparency:</strong> All funds are held in smart contracts on the blockchain.
            Every transaction is publicly visible and verifiable.
          </p>
          <p>
            <strong>No Hidden Fees:</strong> 100% of premiums go into the reserve pool. There are no
            administrative fees, profit margins, or hidden deductions in v0.
          </p>
          <p>
            <strong>Reserve Ratio:</strong> The reserve ratio shows the relationship between assets
            (total premiums collected) and liabilities (total payouts made). A healthy ratio indicates
            sufficient funds to cover claims.
          </p>
          <p className="text-sm text-gray-500">
            Future versions will include individual verification via Merkle proofs, allowing each user
            to cryptographically verify their contributions and the protocol's solvency.
          </p>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="card bg-gray-50">
        <h3 className="text-xl font-bold mb-4">Contract Addresses</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">RiskPool Contract:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs">
              {process.env.NEXT_PUBLIC_RISKPOOL_ADDRESS || 'Not deployed'}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Verification Contract:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs">
              {process.env.NEXT_PUBLIC_VERIFICATION_ADDRESS || 'Not deployed'}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">USDC Token:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs">
              {process.env.NEXT_PUBLIC_USDC_ADDRESS || 'Not deployed'}
            </code>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Verify all contract code and transactions on a blockchain explorer.
        </p>
      </div>
    </div>
  )
}

