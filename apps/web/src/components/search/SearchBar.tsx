'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Users, Hash, Layers } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        const data = await res.json();
        setResults(data.data);
        setIsOpen(true);
      } catch (e) {
        console.error(e);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results && (results.users?.length > 0 || results.hashtags?.length > 0 || results.groups?.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <input
          className="bg-transparent flex-1 text-sm focus:outline-none"
          placeholder="Search users, hashtags, groups..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 right-0 bg-white border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {!hasResults && (
            <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
          )}

          {results?.users?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Users className="w-3 h-3" /> People
              </div>
              {results.users.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { router.push(`/profile/${u.username}`); setIsOpen(false); }}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatarUrl} />
                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{u.displayName}</p>
                    <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results?.hashtags?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" /> Hashtags
              </div>
              {results.hashtags.map((h: any) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { router.push(`/hashtag/${h.tag.replace('#', '')}`); setIsOpen(false); }}
                >
                  <span className="text-sm text-blue-600 font-medium">{h.tag}</span>
                  <span className="text-xs text-gray-400">{h._count?.posts || 0} posts</span>
                </div>
              ))}
            </div>
          )}

          {results?.groups?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Layers className="w-3 h-3" /> Groups
              </div>
              {results.groups.map((g: any) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { router.push(`/groups/${g.id}`); setIsOpen(false); }}
                >
                  <span className="text-sm font-medium">{g.name}</span>
                  <span className="text-xs text-gray-400">{g._count?.members || 0} members</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
