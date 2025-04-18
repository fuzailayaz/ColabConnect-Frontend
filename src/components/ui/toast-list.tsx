import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Toast as ToastType } from "./toast";
import { Toast } from "./toast";

interface ToastListProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastList({ toasts, onRemove }: ToastListProps) {
  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence mode="sync" initial={false}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}