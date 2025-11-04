import { formatUnits, parseUnits } from 'ethers'

/**
 * Format USDC amount (6 decimals) to readable string
 */
export function formatUSDC(amount: bigint | string): string {
  const formatted = formatUnits(amount, 6)
  return `$${Number(formatted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Parse USDC amount from string to BigInt
 */
export function parseUSDC(amount: string | number): bigint {
  return parseUnits(amount.toString(), 6)
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Calculate time remaining until a future timestamp
 */
export function timeUntil(futureTimestamp: bigint | number): string {
  const future = new Date(Number(futureTimestamp) * 1000)
  const now = new Date()
  const diffMs = future.getTime() - now.getTime()

  if (diffMs <= 0) return 'Completed'

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} days`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Calculate waiting period end date
 */
export function getWaitingPeriodEnd(enrollmentTimestamp: bigint | number): Date {
  const enrollment = new Date(Number(enrollmentTimestamp) * 1000)
  const waitingPeriodEnd = new Date(enrollment)
  waitingPeriodEnd.setDate(enrollment.getDate() + 180) // 6 months = 180 days
  return waitingPeriodEnd
}

