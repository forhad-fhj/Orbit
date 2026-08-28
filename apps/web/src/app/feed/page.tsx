'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useState } from 'react';
import { PostCard, PostProps } from '@/components/feed/PostCard';
import { StoryTray } from '@/components/stories/StoryTray';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { apiUrl } from '@/lib/api';

const fetchFeed = async ({ pageParam = 0 }) => {
  const res = await fetch(apiUrl(`/api/feed?cursor=${pageParam}`));
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function FeedPage() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ? parseInt(lastPage.nextCursor) : undefined,
  });

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  if (status === 'pending') return <div className="p-8 text-center">Loading feed...</div>;
  if (status === 'error') return <div className="p-8 text-center text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <StoryTray onSelectStory={setSelectedStory} />
      
      {selectedStory && (
        <StoryViewer 
          userStoryGroup={selectedStory} 
          onClose={() => setSelectedStory(null)} 
        />
      )}

      {data.pages.map((page, i) => (
        <div key={i}>
          {page.data.map((post: PostProps) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      <div ref={observerTarget} className="h-10 w-full flex items-center justify-center">
        {isFetchingNextPage && <div className="text-gray-500">Loading more...</div>}
        {!hasNextPage && data.pages[0].data.length > 0 && <div className="text-gray-500 text-sm py-4">You've caught up!</div>}
      </div>
    </div>
  );
}
