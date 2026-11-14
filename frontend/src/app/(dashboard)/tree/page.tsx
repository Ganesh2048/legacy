'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FamilyTreeCanvas } from '@/components/tree/family-tree-canvas';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, Sparkles, User, X, ChevronRight, BookOpen, Calendar, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';

export default function FamilyTreePage() {
  const { currentFamily } = useAuth();
  const queryClient = useQueryClient();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [occupation, setOccupation] = useState('');

  const { data: treeData, isLoading } = useQuery({
    queryKey: ['tree', currentFamily?.id],
    queryFn: () => fetchApi(`/families/${currentFamily?.id}/tree`),
    enabled: !!currentFamily?.id,
  });

  const { data: memberProfile } = useQuery({
    queryKey: ['memberProfile', selectedMemberId],
    queryFn: () => fetchApi(`/members/${selectedMemberId}`),
    enabled: !!selectedMemberId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (newMember: any) =>
      fetchApi(`/families/${currentFamily?.id}/members`, {
        method: 'POST',
        body: JSON.stringify(newMember),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree', currentFamily?.id] });
      setShowAddModal(false);
      setFirstName('');
      setLastName('');
      setOccupation('');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate({
      firstName,
      lastName,
      occupation,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Interactive Family Tree
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Visualizing {currentFamily?.name || 'Family'} lineage across generations
            </p>
          </div>

          <Button onClick={() => setShowAddModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Add Family Member</span>
          </Button>
        </div>

        {/* Tree Canvas Component */}
        {isLoading ? (
          <div className="h-[75vh] rounded-3xl border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/50 flex flex-col items-center justify-center space-y-3 font-serif">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <p className="text-xs text-stone-400">Rendering family tree nodes...</p>
          </div>
        ) : (
          <FamilyTreeCanvas
            nodes={treeData?.nodes || []}
            links={treeData?.links || []}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {/* Member Profile Drawer */}
        {selectedMemberId && memberProfile && (
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Member Profile Quick View
              </span>
              <button
                onClick={() => setSelectedMemberId(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-stone-100 dark:border-stone-800">
              <Avatar
                src={memberProfile.avatarUrl}
                alt={`${memberProfile.firstName} ${memberProfile.lastName}`}
                size="xl"
              />
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {memberProfile.firstName} {memberProfile.lastName}
                </h2>
                {memberProfile.maidenName && (
                  <p className="text-xs text-amber-800 dark:text-amber-400 italic">
                    née {memberProfile.maidenName}
                  </p>
                )}
                <Badge variant="amber" className="mt-2">
                  {memberProfile.occupation || 'Family Member'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {memberProfile.birthDate && (
                <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    Born {new Date(memberProfile.birthDate).toLocaleDateString()}
                    {memberProfile.birthPlace ? ` in ${memberProfile.birthPlace}` : ''}
                  </span>
                </div>
              )}

              {memberProfile.bio && (
                <div className="space-y-1">
                  <span className="font-serif font-semibold text-stone-900 dark:text-stone-100">
                    Biography
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {memberProfile.bio}
                  </p>
                </div>
              )}
            </div>

            <Link href={`/members/${memberProfile.id}`}>
              <Button className="w-full h-11">
                <span>View Full Profile Page</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Add Family Member
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    First Name
                  </label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Arthur"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Last Name
                  </label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sterling"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Occupation / Title
                  </label>
                  <Input
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Captain & Historian"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMemberMutation.isPending}>
                    {addMemberMutation.isPending ? 'Saving...' : 'Add Member'}
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
