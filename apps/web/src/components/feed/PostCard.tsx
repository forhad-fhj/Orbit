'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface PostProps {
  id: string;
  author: {
    username: string;
    avatarUrl: string | null;
  };
  content: string | null;
  mediaUrls: string[];
  location: string | null;
  createdAt: string;
  _count: {
    reactions: number;
    comments: number;
  };
  myReaction: any | null;
  isSaved: boolean;
}

export function PostCard({ post }: { post: PostProps }) {
  const [isLiked, setIsLiked] = useState(!!post.myReaction);
  const [likeCount, setLikeCount] = useState(post._count?.reactions || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved);

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(c => isLiked ? c - 1 : c + 1);

    try {
      await fetch(`http://localhost:5001/api/posts/${post.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Usually we let credentials handle cookies
        },
        body: JSON.stringify({ type: 'LIKE' })
      });
    } catch (e) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(c => isLiked ? c + 1 : c - 1);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      await fetch(`http://localhost:5001/api/posts/${post.id}/save`, { method });
    } catch (e) {
      setIsSaved(isSaved);
    }
  };

  // Process hashtags in content to be clickable spans
  const renderContent = (text: string | null) => {
    if (!text) return null;
    const words = text.split(' ');
    return words.map((word, i) => {
      if (word.startsWith('#')) {
        return <span key={i} className="text-blue-600 cursor-pointer hover:underline"> {word} </span>;
      }
      return word + ' ';
    });
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.author.avatarUrl || ''} />
            <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{post.author.username}</span>
            {post.location && <span className="text-xs text-gray-500">{post.location}</span>}
          </div>
        </div>
        <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5 text-gray-600" /></Button>
      </div>

      {/* Media (Simplified without full carousel for brevity, just first image) */}
      {post.mediaUrls.length > 0 && (
        <div className="w-full bg-black aspect-square flex items-center justify-center overflow-hidden">
          <img src={post.mediaUrls[0]} alt="Post media" className="object-cover w-full h-full" />
        </div>
      )}

      {/* Action Bar */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button onClick={handleLike} className="focus:outline-none transition-transform active:scale-90">
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
            </button>
            <button className="focus:outline-none hover:opacity-70 transition-opacity">
              <MessageCircle className="w-6 h-6 text-gray-800" />
            </button>
            <button className="focus:outline-none hover:opacity-70 transition-opacity">
              <Send className="w-6 h-6 text-gray-800" />
            </button>
          </div>
          <button onClick={handleSave} className="focus:outline-none hover:opacity-70 transition-opacity">
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-black text-black' : 'text-gray-800'}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-2">{likeCount} likes</div>

        {/* Content */}
        {post.content && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.author.username}</span>
            {renderContent(post.content)}
          </div>
        )}

        {/* Comments Preview */}
        {post._count?.comments > 0 && (
          <div className="text-sm text-gray-500 cursor-pointer mb-2">
            View all {post._count.comments} comments
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {formatDistanceToNow(new Date(post.createdAt))} ago
        </div>
      </div>
    </div>
  );
}
