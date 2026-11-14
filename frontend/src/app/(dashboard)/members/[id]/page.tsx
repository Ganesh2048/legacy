'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Award, BookOpen, Briefcase, Heart, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MemberProfilePage() {
  const params = useParams();
  const memberId = params.id as string;

  const { data: member, isLoading } = useQuery({
    queryKey: ['memberProfile', memberId],
    queryFn: () => fetchApi(`/members/${memberId}`),
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-3 font-serif">
          <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          <p className="text-xs text-stone-400">Loading member profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center space-y-4">
          <p className="font-serif text-lg text-stone-600 dark:text-stone-400">
            Member profile not found.
          </p>
          <Link href="/tree">
            <Button variant="outline">Back to Family Tree</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link href="/tree" className="inline-flex items-center text-xs text-stone-500 hover:text-amber-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Family Tree</span>
        </Link>

        {/* Header Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg">
          <div className="h-48 w-full bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 relative">
            {member.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-50" />
            )}
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between -mt-16 gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <Avatar
                src={member.avatarUrl}
                alt={`${member.firstName} ${member.lastName}`}
                size="xl"
                className="w-32 h-32 border-4 border-white dark:border-stone-900 shadow-2xl"
              />
              <div className="space-y-1">
                <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {member.firstName} {member.lastName}
                </h1>
                {member.maidenName && (
                  <p className="text-sm text-amber-800 dark:text-amber-400 italic">
                    née {member.maidenName}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="amber">{member.occupation || 'Family Member'}</Badge>
                  {member.isDeceased && <Badge variant="secondary">🕊️ Deceased</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs & Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio & Achievements */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <span>Life Story & Biography</span>
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-serif whitespace-pre-line">
                  {member.bio || 'No biography recorded yet.'}
                </p>
              </CardContent>
            </Card>

            {member.achievements && (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    <span>Achievements & Honors</span>
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                    {member.achievements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Personal Timeline Milestones */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <span>Life Event Timeline</span>
                </h2>

                {member.timelineEvents?.length > 0 ? (
                  <div className="space-y-4 border-l-2 border-amber-600/30 pl-4">
                    {member.timelineEvents.map((evt: any) => (
                      <div key={evt.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-600" />
                        <span className="font-mono text-xs text-amber-800 dark:text-amber-400 font-semibold">
                          {new Date(evt.eventDate).toLocaleDateString()}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {evt.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          {evt.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">No timeline events recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Key Details & Relationships */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4 text-xs">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Key Details
                </h3>

                {member.birthDate && (
                  <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Birth: {new Date(member.birthDate).toLocaleDateString()}</span>
                  </div>
                )}

                {member.birthPlace && (
                  <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Born in {member.birthPlace}</span>
                  </div>
                )}

                {member.education && (
                  <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Education: {member.education}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relationships Web Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Family Relationships
                </h3>

                <div className="space-y-2 text-xs">
                  {member.relationshipsFrom?.map((rel: any) => (
                    <div key={rel.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-100 dark:bg-stone-800">
                      <div className="flex items-center space-x-2">
                        <Avatar src={rel.toMember?.avatarUrl} size="sm" />
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {rel.toMember?.firstName} {rel.toMember?.lastName}
                        </span>
                      </div>
                      <Badge variant="amber">{rel.relationType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
