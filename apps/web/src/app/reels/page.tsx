'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const fetchReels = async ({ pageParam = undefined }) => {
  const url = pageParam ? apiUrl(`/api/reels/feed?cursor=${pageParam}`) : apiUrl('/api/reels/feed');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error fetching reels');
  return res.json();
};

function ReelVideo({ reel }: { reel: any }) {
  const { ref, inView } = useInView({ threshold: 0.7 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (inView) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [inView]);

  return (
    <div ref={ref} className="h-screen w-full snap-start relative bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={reel.mediaUrls[0]}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
      />
      
      {/* Sidebar Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition">
            <Heart className={`w-7 h-7 ${reel.myReaction ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold mt-1">{reel._count?.reactions || 0}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition">
             <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold mt-1">{reel._count?.comments || 0}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition">
             <Bookmark className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition">
             <Share2 className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-4 right-20 text-white">
        <div className="flex items-center space-x-2 mb-3">
          <img src={reel.author.avatarUrl || ''} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="" />
          <span className="font-semibold">{reel.author.username}</span>
          <button className="border border-white/50 px-3 py-1 rounded-md text-sm font-medium ml-2 hover:bg-white/20 transition">Follow</button>
        </div>
        <p className="text-sm line-clamp-2">{reel.content}</p>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['reels'],
    queryFn: fetchReels,
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
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  if (status === 'pending') return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Reels...</div>;

  return (
    <div className="h-screen w-full sm:w-[400px] mx-auto bg-black overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {data?.pages.map((page, i) => (
        page.data.map((reel: any) => (
          <ReelVideo key={reel.id} reel={reel} />
        ))
      ))}
      <div ref={observerTarget} className="h-10 snap-start flex items-center justify-center bg-black">
         {isFetchingNextPage && <div className="text-white/50 text-sm">Loading more...</div>}
      </div>
    </div>
  );
}
