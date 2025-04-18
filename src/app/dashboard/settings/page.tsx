'use client';

import UserProfileSettings from '@/components/profile/UserProfileSettings';
import NotificationSettings from '@/components/notifications/NotificationSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <UserProfileSettings />
      <NotificationSettings />
      
      <p className="text-muted-foreground mt-4">
        Application preferences and customization options will appear here.
      </p>
    </div>
  );
}