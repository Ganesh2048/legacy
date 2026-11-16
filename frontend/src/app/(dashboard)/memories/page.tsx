'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PlusCircle, Image as ImageIcon, Heart, MessageSquare, MapPin, Calendar, X, Sparkles, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';

export default function MemoriesPage() {
  const { currentFamily, user } = useAuth();
  const queryClient = useQueryClient();

  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentText, setCommentText] = useState('');

  const { data: albums } = useQuery({
    queryKey: ['albums', currentFamily?.id],
    queryFn: () => fetchApi(`/families/${currentFamily?.id}/albums`),
    enabled: !!currentFamily?.id,
  });

  const { data: memoriesResponse, isLoading } = useQuery({
    queryKey: ['memories', currentFamily?.id, activeAlbumId, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeAlbumId) params.append('albumId', activeAlbumId);
      params.append('page', String(page));
      params.append('limit', String(limit));
      return fetchApi(`/families/${currentFamily?.id}/memories?${params.toString()}`);
    },
    enabled: !!currentFamily?.id,
  });

  const memories = memoriesResponse?.data || [];
  const total = memoriesResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const createMemoryMutation = useMutation({
    mutationFn: (newMemory: any) =>
      fetchApi(`/families/${currentFamily?.id}/memories`, {
        method: 'POST',
        body: JSON.stringify(newMemory),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', currentFamily?.id] });
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setImageUrl('');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ memoryId, content }: { memoryId: string; content: string }) =>
      fetchApi(`/memories/${memoryId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', currentFamily?.id] });
      setCommentText('');
    },
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    createMemoryMutation.mutate({
      title,
      description,
      location,
      memoryDate: memoryDate || undefined,
      albumId: activeAlbumId || undefined,
      mediaFiles: imageUrl
        ? [
            {
              fileUrl: imageUrl,
              fileKey: `media-${Date.now()}`,
              fileType: 'PHOTO',
              fileName: 'uploaded_memory.jpg',
              fileSize: 2048000,
              mimeType: 'image/jpeg',
            },
          ]
        : undefined,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemory || !commentText.trim()) return;
    addCommentMutation.mutate({
      memoryId: selectedMemory.id,
      content: commentText,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Memories & Media Archive
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Organized photos, letters, certificates, and story recordings
            </p>
          </div>

          <Button onClick={() => setShowUploadModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Upload Memory</span>
          </Button>
        </div>

        {/* Albums Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setActiveAlbumId(null);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeAlbumId === null
                ? 'bg-amber-800 text-amber-50 dark:bg-amber-600 dark:text-stone-950'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            All Memories
          </button>
          {albums?.map((album: any) => (
            <button
              key={album.id}
              onClick={() => {
                setActiveAlbumId(album.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                activeAlbumId === album.id
                  ? 'bg-amber-800 text-amber-50 dark:bg-amber-600 dark:text-stone-950'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {album.title} ({album._count?.memories || 0})
            </button>
          ))}
        </div>

        {/* Memories Gallery Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-stone-400 animate-pulse font-serif">
            Loading preserved family memories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories?.map((mem: any) => (
              <Card
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="overflow-hidden group cursor-pointer"
              >
                {mem.mediaFiles?.[0]?.fileUrl && (
                  <div className="h-56 w-full overflow-hidden relative bg-stone-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mem.mediaFiles[0].fileUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {mem.location && (
                      <Badge variant="amber" className="absolute top-3 left-3 shadow-md">
                        {mem.location}
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {mem.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {mem.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span>{mem.reactions?.length || 2}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                        <span>{mem.comments?.length || 1}</span>
                      </span>
                    </div>
                    {mem.memoryDate && (
                      <span className="font-mono text-[11px]">
                        {new Date(mem.memoryDate).getFullYear()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400">
              Showing {memories.length} of {total} memories (Page {page} of {totalPages})
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Lightbox Detail Modal */}
        {selectedMemory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 grid grid-cols-1 md:grid-cols-2 max-h-[85vh]">
              {/* Media Preview */}
              <div className="bg-stone-950 flex items-center justify-center p-4 relative min-h-[300px]">
                {selectedMemory.mediaFiles?.[0]?.fileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMemory.mediaFiles[0].fileUrl}
                    alt={selectedMemory.title}
                    className="max-h-[75vh] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-stone-500 font-serif text-sm">
                    No image attached
                  </div>
                )}
              </div>

              {/* Comments & Information */}
              <div className="p-6 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div>
                      <h2 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                        {selectedMemory.title}
                      </h2>
                      <p className="text-xs text-stone-500">{selectedMemory.location}</p>
                    </div>
                    <button onClick={() => setSelectedMemory(null)} className="text-stone-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                    {selectedMemory.description}
                  </p>

                  {/* Comments Feed */}
                  <div className="space-y-2 pt-2">
                    <span className="font-serif text-xs font-bold text-stone-900 dark:text-stone-100">
                      Family Reactions & Memories
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedMemory.comments?.map((c: any) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs">
                          <p className="text-stone-800 dark:text-stone-200">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex space-x-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment or memory..."
                    className="h-10 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-10 px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Upload Memory Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Upload Family Memory
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMemory} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Title
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Regatta at Chatham Light"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Story / Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the memory..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Photo URL (Unsplash or S3)
                  </label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cape Cod, MA"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMemoryMutation.isPending}>
                    {createMemoryMutation.isPending ? 'Saving...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
