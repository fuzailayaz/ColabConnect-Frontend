"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LoadingState from "@/components/LoadingState";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    const refreshSession = async () => {
      await supabase.auth.refreshSession();
      checkAuthStatus();
    };
    refreshSession();
  }, []);

  const checkAuthStatus = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      setUser(null);
    } else {
      const supabaseUser = data.session.user;
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        first_name: "",
        last_name: "",
      });
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
  
    if (error) {
      throw new Error(error.message);
    }
  
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        first_name: '',
        last_name: ''
      });
      router.push('/dashboard/home'); // Specifically navigate to dashboard/home
    }
  };

  const register = async (userData: RegisterData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed. Please try again.");
    }

    // Send a verification email (Supabase automatically does this)
    alert("A confirmation email has been sent. Please verify your email before logging in.");
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    router.push("/auth/login");
  };

  const updateProfile = async (data: Partial<User>) => {
    console.log("Update profile with:", data);
    // TODO: Implement profile update logic with Django API.
  };

  useEffect(() => {
    const publicPaths = ["/auth/login", "/auth/register", "/"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isLoading) {
      if (!user && !isPublicPath) {
        router.push("/auth/login");
      } else if (user && isPublicPath) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
