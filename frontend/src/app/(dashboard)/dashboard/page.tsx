'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Users,
  Image as ImageIcon,
  Clock,
  Sparkles,
  GitFork,
  PlusCircle,
  Cake,
  Heart,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';

export default function DashboardPage() {
  const { user, currentFamily } = useAuth();

  const { data: familyDetails, isLoading } = useQuery({
    queryKey: ['family', currentFamily?.id],
    queryFn: () => fetchApi(`/families/${currentFamily?.id}`),
    enabled: !!currentFamily?.id,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Banner */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 overflow-hidden shadow-2xl border border-stone-800">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentFamily?.name || 'Sterling Heritage Workspace'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Good day, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-serif">
              Four generations of history preserved. Explore recent memories, upcoming family milestones, and generational timelines.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/tree">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-stone-950 font-semibold shadow-md">
                  <GitFork className="w-4 h-4 mr-1.5" />
                  <span>Open Family Tree</span>
                </Button>
              </Link>
              <Link href="/memories">
                <Button size="sm" variant="outline" className="border-stone-700 text-stone-200 hover:bg-stone-800">
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  <span>Upload Memory</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {familyDetails?._count?.members || 8}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Family Members</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {familyDetails?._count?.memories || 12}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Preserved Memories</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {familyDetails?._count?.timelineEvents || 15}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Life Milestones</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  4 Generations
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Lineage Depth</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section: Memories & Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Recently Added Memories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                  Recently Added Memories
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Stories and photos shared across generations
                </p>
              </div>
              <Link href="/memories">
                <Button size="sm" variant="ghost">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {familyDetails?.memories?.map((mem: any) => (
                <Card key={mem.id} className="overflow-hidden group">
                  {mem.mediaFiles?.[0]?.fileUrl && (
                    <div className="h-44 w-full overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mem.mediaFiles[0].fileUrl}
                        alt={mem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge variant="amber" className="absolute top-3 left-3 shadow-md">
                        {mem.location || 'Cape Cod, MA'}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {mem.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {mem.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <span>2</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                          <span>1</span>
                        </span>
                      </div>
                      <span className="font-mono text-[10px]">Jul 1988</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Col: Birthdays & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Birthdays Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Cake className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Upcoming Birthdays</span>
                  </CardTitle>
                  <Badge variant="emerald">2 Coming Up</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/50">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
                      alt="Robert Sterling"
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        Robert Sterling
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Turning 68 • June 22</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Send Wish
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/50">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
                      alt="Clara Sterling"
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        Clara Sterling
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Turning 32 • Sept 8</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Send Wish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Family Invite Card */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-900/10 border-amber-500/30">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-stone-950 flex items-center justify-center font-bold">
                  ✨
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Invite Relatives to Legacy
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Share your family code with relatives to let them contribute stories and view the tree.
                </p>
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 font-mono text-center font-bold text-sm tracking-wider text-amber-800 dark:text-amber-300">
                  {currentFamily?.inviteCode || 'STERLING2026'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
