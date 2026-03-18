"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSavedSearches } from "@/features/saved-searches/hooks/useSavedSearches";
import { cn } from "@/lib/cn";

export interface SaveSearchModalProps {
  open: boolean;
  onClose: () => void;
  queryString: string;
  isRtl?: boolean;
}

export function SaveSearchModal({
  open,
  onClose,
  queryString,
  isRtl = false,
}: SaveSearchModalProps) {
  const t = useTranslations("savedSearches");
  const { add } = useSavedSearches();
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed || !queryString) return;
      add({ name: trimmed, queryString });
      setName("");
      onClose();
    },
    [name, queryString, add, onClose],
  );

  const handleClose = useCallback(() => {
    setName("");
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-search-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-xl",
          isRtl && "text-right",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between">
          <h2
            id="save-search-modal-title"
            className="text-lg font-semibold text-[var(--color-charcoal)]"
          >
            {t("saveSearchModalTitle")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-charcoal)]/70 hover:bg-[var(--surface)] hover:text-[var(--color-charcoal)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="save-search-name"
              className="block text-sm font-medium text-[var(--color-charcoal)]"
            >
              {t("saveSearchNameLabel")}
            </label>
            <input
              id="save-search-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("saveSearchNamePlaceholder")}
              className="mt-1.5 w-full rounded-xl border-2 border-[var(--border-subtle)] bg-white px-4 py-2.5 text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal)]/50 focus:border-[var(--brand-secondary)] focus:outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border-2 border-[var(--border-subtle)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("saveSearchSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
