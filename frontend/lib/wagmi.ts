'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat, sepolia, polygonMumbai } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Hedgely',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [hardhat, sepolia, polygonMumbai],
  ssr: true,
})

