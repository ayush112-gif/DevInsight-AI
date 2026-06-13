import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "loading";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 3500) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (msg: string, duration?: number) => addToast(msg, "success", duration),
    [addToast]
  );

  const error = useCallback(
    (msg: string, duration?: number) => addToast(msg, "error", duration),
    [addToast]
  );

  const loading = useCallback(
    (msg: string) => addToast(msg, "loading"),
    [addToast]
  );

  return { toasts, success, error, loading, removeToast };
}