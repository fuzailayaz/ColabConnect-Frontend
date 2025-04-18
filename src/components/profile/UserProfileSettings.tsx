'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserProfileSettings() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    bio: '',
    skills: '',
    interests: '',
    emailNotifications: true,
    pushNotifications: true,
  });

  const { toast } = useToast();


  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfile({
          fullName: profile.full_name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          skills: profile.skills?.join(', ') || '',
          interests: profile.interests?.join(', ') || '',
          emailNotifications: profile.email_notifications ?? true,
          pushNotifications: profile.push_notifications ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData = {
        full_name: profile.fullName,
        bio: profile.bio,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: profile.interests.split(',').map(s => s.trim()).filter(Boolean),
        email_notifications: profile.emailNotifications,
        push_notifications: profile.pushNotifications,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('fullName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={profile.email}
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            value={profile.skills}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('skills', e.target.value)}
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interests (comma-separated)</Label>
          <Input
            id="interests"
            value={profile.interests}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('interests', e.target.value)}
            placeholder="Web Development, AI, Cloud Computing"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <div className="text-sm text-muted-foreground">
              Receive notifications via email
            </div>
          </div>
          <Switch
            id="emailNotifications"
            checked={profile.emailNotifications}
            onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <div className="text-sm text-muted-foreground">
              Receive push notifications
            </div>
          </div>
          <Switch
            id="pushNotifications"
            checked={profile.pushNotifications}
            onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}