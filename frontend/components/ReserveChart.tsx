'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, RISKPOOL_ABI } from '@/lib/contracts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatUnits } from 'ethers'

export function ReserveChart() {
  const { data: totalPremiums } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'totalPremiumsCollected',
  })

  const { data: totalPayouts } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'totalPayoutsIssued',
  })

  const { data: reserveBalance } = useReadContract({
    address: CONTRACTS.riskPool as `0x${string}`,
    abi: RISKPOOL_ABI,
    functionName: 'getReserveBalance',
  })

  // Prepare data for bar chart
  const barData = [
    {
      name: 'Premiums',
      value: totalPremiums ? Number(formatUnits(totalPremiums, 6)) : 0,
      fill: '#0ea5e9'
    },
    {
      name: 'Payouts',
      value: totalPayouts ? Number(formatUnits(totalPayouts, 6)) : 0,
      fill: '#ef4444'
    },
    {
      name: 'Reserve',
      value: reserveBalance ? Number(formatUnits(reserveBalance, 6)) : 0,
      fill: '#10b981'
    },
  ]

  // Prepare data for pie chart (distribution)
  const pieData = [
    {
      name: 'Available Reserve',
      value: reserveBalance ? Number(formatUnits(reserveBalance, 6)) : 0,
      fill: '#10b981'
    },
    {
      name: 'Paid Out',
      value: totalPayouts ? Number(formatUnits(totalPayouts, 6)) : 0,
      fill: '#ef4444'
    },
  ]

  const COLORS = ['#10b981', '#ef4444']

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6">Financial Overview</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Protocol Finances (USDC)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Fund Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reserve Health Indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Reserve Health</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  reserveBalance && totalPremiums && totalPremiums > 0n
                    ? (Number(reserveBalance) / Number(totalPremiums)) * 100
                    : 0
                )}%`,
              }}
            />
          </div>
          <span className="text-sm font-semibold">
            {reserveBalance && totalPremiums && totalPremiums > 0n
              ? `${((Number(reserveBalance) / Number(totalPremiums)) * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Percentage of collected premiums currently held in reserve
        </p>
      </div>
    </div>
  )
}

