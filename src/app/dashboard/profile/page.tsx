'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader, Upload, FileText, Award, Activity } from 'lucide-react';
import UserProfileCard from '@/components/UserProfileCard';
import { Progress } from '@/components/ui/progress';
import ResumeUpload from '@/components/profile/ResumeUpload';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/types/database';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  tasks_completed: number | null;
  projects_completed: number | null;
  team_collaborations: number | null;
  email: string;
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  resume_url?: string | null;
  role: string | null;
  skills: string[];
  github_username: string | null;
  website: string | null;
  interests: string[];
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      loadUserProfile();
    }
  }, [authLoading, userProfile]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your profile",
          variant: "destructive",
        });
        return;
      }

      if (userProfile) {
        setProfile({
          id: user.id,
          full_name: userProfile.full_name || user.user_metadata?.full_name || 'User',
          email: user.email || '',
          role: userProfile.role || 'Team Member',
          avatar_url: userProfile.avatar_url || user.user_metadata?.avatar_url || '/avatar-placeholder.png',
          bio: userProfile.bio || 'No bio available',
          skills: userProfile.skills || [],
          location: null,
          projects_completed: null,
          tasks_completed: null,
          team_collaborations: null,
          github_url: userProfile.github_username || null,
          linkedin_url: userProfile.linkedin_url || null,
          twitter_url: userProfile.website || null,
          resume_url: null,
          github_username: userProfile.github_username || null,
          website: userProfile.website || null,
          interests: userProfile.interests || [],
          experience_level: userProfile.experience_level || null,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEditProfile = () => {
    router.push('/dashboard/settings');
  };

  const handleResumeUploadSuccess = (url: string) => {
    toast({
      title: "Success",
      description: "Resume uploaded successfully",
    });
    loadUserProfile();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-muted-foreground">
          We couldn't find your profile information. Please try signing in again.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <UserProfileCard 
            profile={{
              id: profile.id,
              name: profile.full_name,
              role: profile.role || 'Team Member',
              avatar: profile.avatar_url,
              email: profile.email,
              bio: profile.bio,
              skills: profile.skills,
              socialLinks: {
                github: profile.github_username || undefined,
                linkedin: profile.linkedin_url || undefined,
                twitter: profile.website || undefined
              },
              stats: {
                projectsCompleted: profile.projects_completed || 0,
                tasksCompleted: profile.tasks_completed || 0,
                teamCollaborations: profile.team_collaborations || 0
              }
            }}
            onEdit={() => handleEditProfile()}
          />
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span>Activity Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Your recent activity and contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Project Contributions</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Task Completion Rate</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Collaboration Score</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>Resume</span>
                  </CardTitle>
                  <CardDescription>
                    Upload or update your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-6">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border-gray-100 dark:border-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-500" />
                    <span>Skills Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    Your current skill levels and areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile?.skills?.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.floor(Math.random() * 40) + 60}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.floor(Math.random() * 40) + 60} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4" onClick={handleEditProfile}>
                      Update Skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}