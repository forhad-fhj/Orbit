'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => apiRequest<{ users: any[] }>(`/api/users/search/${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length > 0,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground">Discover new people and content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchQuery && (
            <div className="mt-4">
              {isLoading ? (
                <p className="text-muted-foreground">Searching...</p>
              ) : searchResults?.users && searchResults.users.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-sm font-medium">{user.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
