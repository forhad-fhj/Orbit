'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export function StoryViewer({ 
  userStoryGroup, 
  onClose 
}: { 
  userStoryGroup: any; 
  onClose: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stories = userStoryGroup.stories;
  
  useEffect(() => {
    // Record view
    fetch(apiUrl(`/api/stories/${stories[currentIndex].id}/view`), { method: 'POST' }).catch(() => {});
    
    // Auto advance every 5s
    const timer = setTimeout(() => {
      handleNext();
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, stories]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  const currentStory = stories[currentIndex];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white p-2">
          <X className="w-8 h-8" />
        </button>

        <div className="relative w-full max-w-sm h-[80vh] bg-gray-900 rounded-xl overflow-hidden flex flex-col">
          {/* Progress Bars */}
          <div className="absolute top-0 inset-x-0 p-2 flex space-x-1 z-20">
            {stories.map((s: any, i: number) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: i < currentIndex ? '100%' : '0%' }}
                  animate={{ width: i === currentIndex ? '100%' : i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: i === currentIndex ? 5 : 0, ease: 'linear' }}
                />
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="absolute top-4 inset-x-0 p-4 flex items-center space-x-2 z-20">
             <img src={userStoryGroup.author.avatarUrl} className="w-8 h-8 rounded-full border border-white" alt="" />
             <span className="text-white font-semibold text-sm drop-shadow-md">{userStoryGroup.author.username}</span>
          </div>

          {/* Tap Zones */}
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Media */}
          {currentStory.mediaType === 'VIDEO' ? (
             <video src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
          ) : (
             <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="Story" />
          )}

          {/* Caption */}
          {currentStory.caption && (
             <div className="absolute bottom-8 inset-x-0 text-center z-20 pointer-events-none">
               <span className="bg-black/50 text-white px-4 py-2 rounded-lg text-lg font-medium">{currentStory.caption}</span>
             </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
