'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Users, Calendar, Image as ImageIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import { Avatar } from './ui/avatar';
import Link from 'next/link';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentFamily } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    members: any[];
    events: any[];
    memories: any[];
    albums: any[];
  }>({ members: [], events: [], memories: [], albums: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !currentFamily) {
      setResults({ members: [], events: [], memories: [], albums: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const data = await fetchApi(`/families/${currentFamily.id}/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, currentFamily]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-stone-100 dark:border-stone-800">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ancestors, milestones, photos..."
            autoFocus
            className="w-full h-14 px-3 bg-transparent text-sm text-stone-900 dark:text-stone-100 focus:outline-none placeholder:text-stone-400 font-serif"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-stone-400 animate-pulse font-serif">
              Searching family records...
            </div>
          ) : query.trim() &&
            results.members.length === 0 &&
            results.events.length === 0 &&
            results.memories.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 font-serif">
              No matching records found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {/* Members */}
              {results.members.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Family Members ({results.members.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {results.members.map((member) => (
                      <Link
                        key={member.id}
                        href={`/members/${member.id}`}
                        onClick={onClose}
                        className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors"
                      >
                        <Avatar src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {member.occupation || 'Family Member'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Events */}
              {results.events.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Life Events ({results.events.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {results.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/timeline`}
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors block"
                      >
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {event.member?.firstName} {event.member?.lastName} • {event.location}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Memories */}
              {results.memories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Memories & Photos ({results.memories.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {results.memories.map((mem) => (
                      <Link
                        key={mem.id}
                        href={`/memories`}
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors block"
                      >
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {mem.title}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {mem.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
