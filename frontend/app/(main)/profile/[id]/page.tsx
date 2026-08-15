'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Calendar, UserPlus, UserMinus, LogOut } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  email: string
  avatarUrl?: string | null
  bio?: string | null
  createdAt: string
  _count: {
    followers: number
    following: number
    posts: number
  }
  isFollowing?: boolean
  isOwnProfile?: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const currentUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      logout()
      router.replace('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const { data: profile, isLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ['user', userId],
    queryFn: () => apiRequest(`/api/users/${userId}`),
    enabled: !!userId,
  })

  const { data: isFollowing } = useQuery<{ following: boolean }>({
    queryKey: ['follow-check', userId],
    queryFn: () => apiRequest(`/api/follows/${userId}/check`),
    enabled: !!userId && !!currentUser && !profile?.user.isOwnProfile,
  })

  const handleFollow = async () => {
    try {
      if (isFollowing?.following) {
        await apiRequest(`/api/follows/${userId}`, { method: 'DELETE' })
      } else {
        await apiRequest(`/api/follows/${userId}`, { method: 'POST' })
      }
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const user = profile.user
  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl font-bold">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{user.username}</CardTitle>
              {user.bio && <p className="text-muted-foreground mb-4">{user.bio}</p>}
              <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-6 mb-4">
                <div>
                  <span className="font-semibold">{user._count.posts}</span>
                  <span className="text-muted-foreground ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold">{user._count.followers}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold">{user._count.following}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing?.following ? 'outline' : 'default'}
                  >
                    {isFollowing?.following ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/posts/user/${userId}`)}
        >
          View all posts
        </Button>
      </div>
    </div>
  )
}

