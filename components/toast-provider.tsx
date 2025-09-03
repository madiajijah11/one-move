"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number; // ms
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { duration: 3500, ...t, id };
    setToasts((prev) => [...prev, item]);
    timers.current[id] = setTimeout(() => {
      setToasts((p) => p.filter((x) => x.id !== id));
      delete timers.current[id];
    }, item.duration);
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed z-[100] bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[min(380px,90vw)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-md border px-4 py-3 text-sm shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 animate-in fade-in slide-in-from-bottom-2",
              t.variant === "destructive" &&
                "border-destructive text-destructive",
              t.variant === "success" &&
                "border-green-500 text-green-700 dark:text-green-400"
            )}
            role="status"
          >
            {t.title && (
              <p className="font-medium mb-0.5 leading-none">{t.title}</p>
            )}
            {t.description && (
              <p className="text-xs text-muted-foreground leading-snug">
                {t.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
