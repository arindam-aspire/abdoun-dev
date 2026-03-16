import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui";

export type ToastKind = "info" | "error" | "success";

export interface ToastProps {
  kind?: ToastKind;
  message: string;
  onClose?: () => void;
  /** Auto-hide duration in ms (default: 4000). */
  duration?: number;
}

export function Toast({
  kind = "info",
  message,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [onClose, duration]);

  const variant =
    kind === "error" ? "destructive" : kind === "success" ? "success" : "info";

  const content = (
    <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex justify-end px-4 sm:px-6">
      <div className="pointer-events-auto w-full max-w-sm">
        <Alert
          variant={variant}
          className="shadow-lg border bg-white/95 backdrop-blur-sm dark:bg-zinc-900/95"
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}

