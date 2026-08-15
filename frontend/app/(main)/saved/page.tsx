'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark } from 'lucide-react'

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved</h1>
        <p className="text-muted-foreground">Your saved posts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No saved posts yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
