'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PlusCircle, Clock, Calendar, MapPin, Sparkles, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';

export default function TimelinePage() {
  const { currentFamily } = useAuth();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [memberId, setMemberId] = useState('');

  const { data: members } = useQuery({
    queryKey: ['membersList', currentFamily?.id],
    queryFn: () => fetchApi(`/families/${currentFamily?.id}/tree`),
    enabled: !!currentFamily?.id,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['timeline', currentFamily?.id, activeCategory],
    queryFn: () =>
      fetchApi(
        `/families/${currentFamily?.id}/timeline${activeCategory ? `?category=${activeCategory}` : ''}`,
      ),
    enabled: !!currentFamily?.id,
  });

  const createEventMutation = useMutation({
    mutationFn: (newEvent: any) =>
      fetchApi(`/families/${currentFamily?.id}/timeline`, {
        method: 'POST',
        body: JSON.stringify(newEvent),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', currentFamily?.id] });
      setShowAddModal(false);
      setTitle('');
      setEventDate('');
      setLocation('');
      setDescription('');
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate({
      memberId: memberId || members?.nodes?.[0]?.id,
      title,
      eventDate,
      location,
      description,
    });
  };

  const categories = [
    { label: 'All Events', value: null },
    { label: 'Births', value: 'BIRTH' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Career', value: 'CAREER' },
    { label: 'Marriages', value: 'MARRIAGE' },
    { label: 'Awards', value: 'AWARD' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Generational Life Timeline
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Chronological records of major family milestones over the past century
            </p>
          </div>

          <Button onClick={() => setShowAddModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Add Life Event</span>
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                activeCategory === cat.value
                  ? 'bg-amber-800 text-amber-50 dark:bg-amber-600 dark:text-stone-950'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Timeline View */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-stone-400 animate-pulse font-serif">
            Loading timeline events...
          </div>
        ) : (
          <div className="relative border-l-2 border-amber-600/30 pl-6 ml-4 space-y-8 py-4">
            {events?.map((evt: any) => (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-700 dark:bg-amber-500 ring-4 ring-white dark:ring-stone-950 shadow-md" />

                <Card className="hover:border-amber-600/40 transition-all">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar src={evt.member?.avatarUrl} size="sm" />
                        <div>
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {evt.member?.firstName} {evt.member?.lastName}
                          </span>
                          <p className="text-[11px] text-stone-500">{evt.location}</p>
                        </div>
                      </div>
                      <Badge variant="amber">{evt.category}</Badge>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-xs text-amber-800 dark:text-amber-400 font-bold">
                        {new Date(evt.eventDate).toLocaleDateString()}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                        {evt.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Add Life Event
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Family Member
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 text-xs text-stone-900 dark:text-stone-100"
                  >
                    {members?.nodes?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Event Title
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Appointed Professor of History"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Harvard University, Cambridge, MA"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about the event..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? 'Saving...' : 'Save Event'}
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
