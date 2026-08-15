'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Home, User, Search, MessageSquare, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function MobileNav() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  const navItems = [
    { icon: Home, label: 'Home', href: '/feed', active: pathname === '/feed' },
    { icon: Search, label: 'Explore', href: '/explore', active: pathname === '/explore' },
    { icon: MessageSquare, label: 'Messages', href: '/messages', active: pathname === '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications', active: pathname === '/notifications' },
    { icon: User, label: 'Profile', href: `/profile/${user.id}`, active: pathname?.startsWith('/profile') },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant={item.active ? 'default' : 'ghost'}
                className="w-full h-full flex-col gap-1"
                size="sm"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
        <div className="px-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

