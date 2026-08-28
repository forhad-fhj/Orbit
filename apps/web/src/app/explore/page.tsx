'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const fetchExplore = async ({ pageParam = undefined }) => {
  const url = pageParam ? apiUrl(`/api/feed/explore?cursor=${pageParam}`) : apiUrl('/api/feed/explore');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function ExplorePage() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: fetchExplore,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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

  if (status === 'pending') return <div className="p-8 text-center">Loading explore...</div>;
  if (status === 'error') return <div className="p-8 text-center text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {data.pages.map((page, i) => (
          page.data.map((post: any) => (
            <div key={post.id} className="relative aspect-square bg-gray-200 group cursor-pointer overflow-hidden">
              {post.mediaUrls?.length > 0 ? (
                <img src={post.mediaUrls[0]} alt="Explore" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm p-4 text-center">
                  {post.content?.substring(0, 50)}...
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-semibold">
                <div className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post._count?.reactions || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>
          ))
        ))}
      </div>

      <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-8">
        {isFetchingNextPage && <div className="text-gray-500">Loading more...</div>}
      </div>
    </div>
  );
}
