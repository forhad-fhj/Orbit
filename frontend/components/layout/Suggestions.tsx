'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

interface User {
  id: string
  username: string
  avatarUrl?: string | null
  bio?: string | null
  _count?: {
    followers: number
    following: number
    posts: number
  }
}

export function Suggestions() {
  const currentUser = useAuthStore((state) => state.user)

  // Fetch suggested users (users with most followers)
  const { data: suggestedUsers } = useQuery<{ users: User[] }>({
    queryKey: ['suggested-users'],
    queryFn: async () => {
      // For now, get all users and sort by follower count
      // In production, implement a proper suggestions algorithm
      const users = await apiRequest<{ users: User[] }>('/api/users/search/a')
      return {
        users: users.users
          .filter((u) => u.id !== currentUser?.id)
          .slice(0, 5),
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleFollow = async (userId: string) => {
    try {
      await apiRequest(`/api/follows/${userId}`, { method: 'POST' })
      // Optionally refetch suggestions
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  return (
    <aside className="hidden xl:block w-80 h-screen sticky top-0 space-y-6 py-6">
      {/* Trending Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-2 hover:bg-accent/60 rounded cursor-pointer transition-colors">
              <p className="font-semibold text-sm">#technology</p>
              <p className="text-xs text-muted-foreground">1.2k posts</p>
            </div>
            <div className="p-2 hover:bg-accent/60 rounded cursor-pointer transition-colors">
              <p className="font-semibold text-sm">#webdev</p>
              <p className="text-xs text-muted-foreground">856 posts</p>
            </div>
            <div className="p-2 hover:bg-accent/60 rounded cursor-pointer transition-colors">
              <p className="font-semibold text-sm">#react</p>
              <p className="text-xs text-muted-foreground">642 posts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who to Follow</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedUsers?.users && suggestedUsers.users.length > 0 ? (
            <div className="space-y-4">
              {suggestedUsers.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                      )}
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 flex-shrink-0"
                    onClick={() => handleFollow(user.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No suggestions available</p>
          )}
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:underline">
            Help
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
        <p>© 2024 Orbit</p>
      </div>
    </aside>
  )
}

