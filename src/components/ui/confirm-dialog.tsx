"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, LoadingButton } from "@/components/ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  /** When true, show a close (X) icon in the top-right corner. Defaults to true. */
  showCloseIcon?: boolean;
  /** Dialog max-width size. Defaults to "md". */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Optional custom content; when provided, it is rendered below the description. */
  children?: ReactNode;
  /** When false, hides the default footer (Cancel / Confirm buttons). Defaults to true. */
  showFooter?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmButtonClassName,
  cancelButtonClassName,
  showCloseIcon = true,
  size = "md",
  children,
  showFooter = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const sizeClass =
    size === "xs"
      ? "max-w-xs"
      : size === "sm"
        ? "max-w-sm"
        : size === "lg"
          ? "max-w-lg"
          : size === "xl"
            ? "max-w-xl"
            : "max-w-md";

  return (
    <DialogRoot
      open={open}
      onClose={onCancel}
      className={`relative ${sizeClass}`}
    >
      {showCloseIcon ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close dialog"
          className="absolute right-4 top-4 h-8 w-8 rounded-full p-0 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}

      <DialogTitle>{title}</DialogTitle>
      {description ? <DialogDescription>{description}</DialogDescription> : null}
      {children}
      {showFooter ? (
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className={cancelButtonClassName}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <LoadingButton
            type="button"
            loading={loading}
            className={confirmButtonClassName}
            onClick={async () => {
              try {
                setLoading(true);
                await Promise.resolve(onConfirm());
              } finally {
                setLoading(false);
              }
            }}
          >
            {confirmLabel}
          </LoadingButton>
        </DialogFooter>
      ) : null}
    </DialogRoot>
  );
}

