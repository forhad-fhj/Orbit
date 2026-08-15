'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Home,
  User,
  Search,
  Settings,
  MessageSquare,
  Bell,
  Bookmark,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  const navItems = [
    { icon: Home, label: 'Home', href: '/feed', active: pathname === '/feed' },
    { icon: Search, label: 'Explore', href: '/explore', active: pathname === '/explore' },
    { icon: MessageSquare, label: 'Messages', href: '/messages', active: pathname === '/messages' },
    { icon: Bell, label: 'Notifications', href: '/notifications', active: pathname === '/notifications' },
    { icon: Bookmark, label: 'Saved', href: '/saved', active: pathname === '/saved' },
    { icon: User, label: 'Profile', href: `/profile/${user.id}`, active: pathname?.startsWith('/profile') },
    { icon: Settings, label: 'Settings', href: '/settings', active: pathname === '/settings' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r bg-background">
      <div className="p-6 border-b flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Orbit</h1>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/60 transition-colors">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-foreground">
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}

