'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/gastos', label: 'Gastos', icon: '💰' },
    { href: '/clientes', label: 'Clientes', icon: '👥' },
    { href: '/directos', label: 'Directos', icon: '🎯' }
  ]

  return (
    <div className="flex items-center gap-6">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo-101grados.png"
          alt="101 Grados Marketing Relacional"
          width={120}
          height={40}
          className="h-10 w-auto"
          priority
        />
      </div>
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl px-1 py-1 shadow-lg">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-600/20 blur-xl -z-10" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}