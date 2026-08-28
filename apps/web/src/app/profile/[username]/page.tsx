'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Grid, Video, Tag } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function ProfilePage() {
  const { username } = useParams();
  const [tab, setTab] = useState<'posts' | 'reels' | 'tagged'>('posts');

  const { data, status } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/users/${username}`));
      if (!res.ok) throw new Error('Error fetching profile');
      return res.json();
    }
  });

  const handleFollow = async () => {
    // Optimistic or real API call
    await fetch(apiUrl(`/api/follow/${data?.data?.id}`), { method: 'POST' });
    // Invalidate query in a real app
  };

  if (status === 'pending') return <div className="p-8 text-center">Loading profile...</div>;
  if (!data?.success) return <div className="p-8 text-center text-red-500">Profile not found.</div>;

  const user = data.data;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen border-x">
      {/* Facebook style header */}
      <div className="relative h-64 bg-gray-200">
        {user.coverPhotoUrl && (
          <img src={user.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className="px-8 pb-4 relative">
        <div className="flex justify-between items-end -mt-16 mb-4">
          <Avatar className="w-32 h-32 border-4 border-white">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-4xl">{user.username[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex space-x-2">
            {user.isFollowing ? (
              <Button variant="secondary">Following</Button>
            ) : user.isPending ? (
              <Button variant="secondary">Requested</Button>
            ) : (
              <Button onClick={handleFollow}>Follow</Button>
            )}
            <Button variant="outline">Message</Button>
          </div>
        </div>

        <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <p className="mt-2 text-sm">{user.bio}</p>
        
        <div className="flex space-x-6 mt-4 text-sm">
          <div><span className="font-semibold">{user._count?.posts || 0}</span> posts</div>
          <div><span className="font-semibold">{user._count?.followers || 0}</span> followers</div>
          <div><span className="font-semibold">{user._count?.following || 0}</span> following</div>
        </div>
      </div>

      <hr />

      {/* Instagram style grid tabs */}
      <div className="flex justify-center space-x-12 border-b">
        <button 
          className={`flex items-center space-x-2 py-4 text-sm font-semibold border-b-2 ${tab === 'posts' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setTab('posts')}
        >
          <Grid className="w-4 h-4" /> <span>POSTS</span>
        </button>
        <button 
          className={`flex items-center space-x-2 py-4 text-sm font-semibold border-b-2 ${tab === 'reels' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setTab('reels')}
        >
          <Video className="w-4 h-4" /> <span>REELS</span>
        </button>
        <button 
          className={`flex items-center space-x-2 py-4 text-sm font-semibold border-b-2 ${tab === 'tagged' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
          onClick={() => setTab('tagged')}
        >
          <Tag className="w-4 h-4" /> <span>TAGGED</span>
        </button>
      </div>

      {/* Grid Content Placeholder */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {/* Render posts based on tab */}
        {tab === 'posts' && (
          <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400">No posts yet</div>
        )}
      </div>
    </div>
  );
}
