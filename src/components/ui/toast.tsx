import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastProps extends Toast {
  onClose: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose }, ref) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <motion.div
        ref={ref}
        key={id}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "default" && "border-border bg-card text-foreground",
          variant === "destructive" && "destructive border-destructive bg-destructive text-destructive-foreground"
        )}
      >
        <div className="flex flex-col gap-1">
          {title && <p className="text-sm font-semibold">{title}</p>}
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className={cn(
            "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-background/80 group-hover:opacity-100",
            variant === "destructive" && "hover:bg-destructive-foreground/20"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </motion.div>
    );
  }
);

Toast.displayName = "Toast";