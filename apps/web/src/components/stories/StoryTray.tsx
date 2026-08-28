'use client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiUrl } from '@/lib/api';

const fetchStories = async () => {
  const res = await fetch(apiUrl('/api/stories/feed'));
  if (!res.ok) throw new Error('Error fetching stories');
  return res.json();
};

export function StoryTray({ onSelectStory }: { onSelectStory: (stories: any) => void }) {
  const { data, status } = useQuery({ queryKey: ['stories'], queryFn: fetchStories });

  if (status === 'pending') return <div className="h-24 w-full animate-pulse bg-gray-100 rounded-lg mb-6 max-w-lg mx-auto"></div>;
  if (!data?.data?.length) return null;

  return (
    <div className="flex space-x-4 p-4 overflow-x-auto bg-white border rounded-lg mb-6 max-w-lg mx-auto scrollbar-hide">
      {data.data.map((userStoryGroup: any) => (
        <div 
          key={userStoryGroup.author.id} 
          className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0"
          onClick={() => onSelectStory(userStoryGroup)}
        >
          <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
            <Avatar className="w-14 h-14 border-2 border-white">
              <AvatarImage src={userStoryGroup.author.avatarUrl || ''} />
              <AvatarFallback>{userStoryGroup.author.username[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs font-medium truncate w-16 text-center">
            {userStoryGroup.author.username}
          </span>
        </div>
      ))}
    </div>
  );
}
