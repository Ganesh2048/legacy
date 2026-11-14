'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, HardDrive, Bell, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user, currentFamily } = useAuth();
  const { theme, setTheme } = useTheme();

  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Workspace & Account Settings
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage your personal profile, family permissions, and theme preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Personal Account Profile</span>
            </CardTitle>
            <CardDescription>Update your personal information and avatar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center space-x-4 pb-2">
                <Avatar src={user?.avatarUrl} size="lg" />
                <div>
                  <Button type="button" variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Email Address
                  </label>
                  <Input value={user?.email || ''} disabled className="opacity-70" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Settings saved successfully!
                  </span>
                )}
                <Button type="submit" className="ml-auto">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Family Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Shield className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Family Permissions & Invites</span>
            </CardTitle>
            <CardDescription>Current workspace role and invite credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-800">
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {currentFamily?.name || 'Sterling Heritage Workspace'}
                </p>
                <p className="text-stone-500">Workspace ID: {currentFamily?.id}</p>
              </div>
              <Badge variant="amber">Role: {currentFamily?.myRole || 'OWNER'}</Badge>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-stone-700 dark:text-stone-300">
                Shareable Invitation Code
              </label>
              <div className="flex space-x-2">
                <Input value={currentFamily?.inviteCode || 'STERLING2026'} readOnly className="font-mono" />
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(currentFamily?.inviteCode || 'STERLING2026')}>
                  Copy Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Sun className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Appearance & Theme</span>
            </CardTitle>
            <CardDescription>Choose how Legacy looks on your devices</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-4 rounded-2xl border text-center transition-all ${
                theme === 'light'
                  ? 'border-amber-600 bg-amber-500/10 font-bold text-amber-900'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <Sun className="w-5 h-5 mx-auto mb-2 text-amber-600" />
              <span className="text-xs">Light Heritage Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-4 rounded-2xl border text-center transition-all ${
                theme === 'dark'
                  ? 'border-amber-600 bg-amber-500/10 font-bold text-amber-300'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <Moon className="w-5 h-5 mx-auto mb-2 text-amber-400" />
              <span className="text-xs">Dark Vault Mode</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
