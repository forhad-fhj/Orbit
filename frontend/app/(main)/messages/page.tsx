'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiRequest<{ conversations: any[] }>('/api/messages/conversations'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Your conversations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading conversations...</p>
          ) : data?.conversations && data.conversations.length > 0 ? (
            <div className="space-y-2">
              {data.conversations.map((conv: any) => (
                <Link
                  key={conv.partner.id}
                  href={`/messages/${conv.partner.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {conv.partner.avatarUrl ? (
                      <img src={conv.partner.avatarUrl} alt={conv.partner.username} className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-sm font-medium">{conv.partner.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{conv.partner.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage.content}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
