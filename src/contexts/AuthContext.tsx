"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase-client";

// Define a type alias for Profile to make the code cleaner
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  user: User | null;
  userProfile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncUserData = useCallback(async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
    
      // Ensure profile exists
      if (!profile) {
        // Create profile if doesn't exist
        const newProfileData: Partial<Profile> = {
          id: user.id,
          email: user.email || undefined,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          skills: [],
          updated_at: new Date().toISOString()
        };

        const { error: createError } = await supabase
          .from('profiles')
          .insert(newProfileData);

        if (createError) throw createError;
      
        // Fetch the newly created profile
        const { data: newProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) throw fetchError;
        if (newProfile) setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Profile sync error:", error);
      toast.error("Failed to load profile data");
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await syncUserData(session.user);
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [syncUserData]);

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await syncUserData(session.user);
          if (event === "SIGNED_IN") {
            router.refresh();
          }
        } else {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          if (event === "SIGNED_OUT") {
            router.push("/auth/login");
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [refreshSession, router, syncUserData]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      toast.success("Check your email to confirm your account");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setUserProfile(null);
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      isLoading,
      user,
      userProfile,
      login,
      register,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};