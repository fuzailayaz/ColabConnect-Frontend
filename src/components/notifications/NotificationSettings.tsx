'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

class WebSocketService {
  private socket: WebSocket | null = null;

  connect(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => console.log('WebSocket Connected');
    return this.socket;
  }

  onMessage(callback: (event: MessageEvent) => void) {
    if (this.socket) {
      this.socket.onmessage = callback;
    }
  }

  onError(callback: (event: Event) => void) {
    if (this.socket) {
      this.socket.onerror = callback;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

const wsService = new WebSocketService();

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mentionAlerts: true,
    taskUpdates: true,
    projectUpdates: true,
    teamMessages: true,
  });

  const { toast } = useToast();


  useEffect(() => {
    loadNotificationSettings();
    setupWebSocket();
    return () => {
      wsService.disconnect();
    };
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (userSettings) {
        setSettings({
          emailNotifications: userSettings.email_notifications ?? true,
          pushNotifications: userSettings.push_notifications ?? true,
          mentionAlerts: userSettings.mention_alerts ?? true,
          taskUpdates: userSettings.task_updates ?? true,
          projectUpdates: userSettings.project_updates ?? true,
          teamMessages: userSettings.team_messages ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive',
      });
    }
  };

  const setupWebSocket = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    wsService.connect(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?token=${token}`);

    wsService.onMessage((event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          toast({
            title: data.title,
            description: data.message,
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    wsService.onError((error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to establish real-time connection',
        variant: 'destructive',
      });
    });
  };

  const handleToggle = async (field: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setSettings(prev => ({ ...prev, [field]: value }));

      const updateData = {
        [`${field.toLowerCase()}`]: value,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification settings updated',
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive important updates via email
              </div>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive real-time notifications in browser
              </div>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentionAlerts">Mention Alerts</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when someone mentions you
              </div>
            </div>
            <Switch
              id="mentionAlerts"
              checked={settings.mentionAlerts}
              onCheckedChange={(checked) => handleToggle('mentionAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskUpdates">Task Updates</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications about task changes
              </div>
            </div>
            <Switch
              id="taskUpdates"
              checked={settings.taskUpdates}
              onCheckedChange={(checked) => handleToggle('taskUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="projectUpdates">Project Updates</Label>
              <div className="text-sm text-muted-foreground">
                Get notified about project milestones
              </div>
            </div>
            <Switch
              id="projectUpdates"
              checked={settings.projectUpdates}
              onCheckedChange={(checked) => handleToggle('projectUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamMessages">Team Messages</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications about team communications
              </div>
            </div>
            <Switch
              id="teamMessages"
              checked={settings.teamMessages}
              onCheckedChange={(checked) => handleToggle('teamMessages', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}