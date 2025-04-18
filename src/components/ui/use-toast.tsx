'use client';

import * as React from "react";
import { ToastList } from "./toast-list";
import { Toast as ToastType } from "./toast";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newToast: ToastType = { id, ...props };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = React.useMemo(
    () => ({
      toast,
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastList toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

