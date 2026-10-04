"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toastItem) => toastItem.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const nextToast: ToastItem = { id, type, title, message, duration };
      setToasts((current) => [...current.slice(-3), nextToast]);
    },
    [],
  );

  const toast = useMemo(
    () => ({
      success: (title: string, message?: string, duration?: number) =>
        addToast("success", title, message, duration),
      error: (title: string, message?: string, duration?: number) =>
        addToast("error", title, message, duration),
      warning: (title: string, message?: string, duration?: number) =>
        addToast("warning", title, message, duration),
      info: (title: string, message?: string, duration?: number) =>
        addToast("info", title, message, duration),
    }),
    [addToast],
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, toast }),
    [toasts, addToast, removeToast, toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed right-4 bottom-4 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 sm:bottom-auto sm:top-28"
      role="region"
      aria-label="การแจ้งเตือน"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: (id: string) => void;
}) {
  const dismiss = useCallback(() => onClose(item.id), [item.id, onClose]);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(item.duration || 0);

  useEffect(() => {
    if (paused || !item.duration || item.duration <= 0) return;
    const started = performance.now();
    const timer = window.setTimeout(dismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (performance.now() - started),
      );
    };
  }, [dismiss, item.duration, paused]);

  const appearance = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
      border: "border-emerald-200",
      iconSurface: "bg-emerald-100 text-emerald-800",
      accent: "bg-emerald-600",
      title: "text-emerald-950",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" aria-hidden="true" />,
      border: "border-rose-200",
      iconSurface: "bg-rose-100 text-rose-800",
      accent: "bg-rose-600",
      title: "text-rose-950",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
      border: "border-amber-200",
      iconSurface: "bg-amber-100 text-amber-800",
      accent: "bg-amber-500",
      title: "text-amber-950",
    },
    info: {
      icon: <Info className="h-5 w-5" aria-hidden="true" />,
      border: "border-blue-200",
      iconSurface: "bg-blue-50 text-blue-700",
      accent: "bg-blue-600",
      title: "text-slate-900",
    },
  }[item.type];

  return (
    <div
      className={`toast-card relative overflow-hidden bg-white p-4 animate-slide-in-right ${appearance.border}`}
      role={item.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement))
          setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !event.currentTarget.matches(":hover")
        )
          setPaused(false);
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${appearance.iconSurface}`}
        >
          {appearance.icon}
        </span>
        <div className="min-w-0 flex-1 pr-1 pt-0.5">
          <p
            className={`text-sm font-semibold leading-snug ${appearance.title}`}
          >
            {item.title}
          </p>
          {item.message && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600 break-words">
              {item.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {item.duration && item.duration > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-slate-100"
          aria-hidden="true"
        >
          <div
            className={`toast-card__timer h-full ${appearance.accent}`}
            style={{
              animationDuration: `${item.duration}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}
