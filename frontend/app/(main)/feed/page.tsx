'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  content: string
  mediaUrl?: string | null
  mediaType: 'IMAGE' | 'VIDEO' | 'NONE'
  createdAt: string
  author: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  _count: {
    likes: number
    comments: number
  }
  liked?: boolean
}

export default function FeedPage() {
  const { data, isLoading, error } = useQuery<{ posts: Post[]; pagination: any }>({
    queryKey: ['posts'],
    queryFn: () => apiRequest('/api/posts'),
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load posts</p>
      </div>
    )
  }

  if (!data?.posts || data.posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <h1 className="text-2xl font-bold">Feed</h1>
      
      <div className="space-y-6">
        {data.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Link href={`/profile/${post.author.id}`}>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {post.author.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <div>
                  <Link href={`/profile/${post.author.id}`}>
                    <p className="font-semibold hover:underline cursor-pointer">
                      {post.author.username}
                    </p>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.mediaUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  {post.mediaType === 'IMAGE' ? (
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full max-h-96 object-cover"
                    />
                  ) : post.mediaType === 'VIDEO' ? (
                    <video src={post.mediaUrl} controls className="w-full max-h-96" />
                  ) : null}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {post._count.likes}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {post._count.comments}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

