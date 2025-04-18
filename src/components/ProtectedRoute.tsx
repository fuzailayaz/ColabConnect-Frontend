"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoadingState from "./LoadingState";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  return <>{children}</>;
}