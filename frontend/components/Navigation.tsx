'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export function Navigation() {
  const pathname = usePathname()
  const { address } = useAccount()

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Claims', path: '/claims' },
    { name: 'Transparency', path: '/transparency' },
    { name: 'Admin', path: '/admin', adminOnly: true },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Hedgely
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                if (item.adminOnly && !address) return null
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.path
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}

