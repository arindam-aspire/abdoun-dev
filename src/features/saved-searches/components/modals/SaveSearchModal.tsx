"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSavedSearches } from "@/features/saved-searches/hooks/useSavedSearches";
import { cn } from "@/lib/cn";
import { DialogRoot, DialogTitle } from "@/components/ui/dialog";

export interface SaveSearchModalProps {
  open: boolean;
  onClose: () => void;
  queryString: string;
  updateId?: string;
  initialName?: string;
  isRtl?: boolean;
  onToast?: (toast: { kind: "success" | "error" | "info"; message: string }) => void;
}

export function SaveSearchModal({
  open,
  onClose,
  queryString,
  updateId,
  initialName,
  isRtl = false,
  onToast,
}: SaveSearchModalProps) {
  const t = useTranslations("savedSearches");
  const { add, update } = useSavedSearches();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const didPrefillOnOpenRef = useRef(false);

  const suggestedName = useMemo(() => {
    if (!queryString) return "";
    const params = new URLSearchParams(queryString);
    const toTitleCase = (value: string) =>
      value
        .replace(/-/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    const toCompactNumber = (value: string) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return value;
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
      if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
      return `${Math.round(n)}`;
    };

    const status = params.get("status");
    const intentLabel =
      status === "buy" ? "Sale" : status === "rent" ? "Rent" : "";

    const type = params.get("type");
    const propertyType = type ? toTitleCase(type) : "";

    const city = params.get("city");
    const locations = params.get("locations");
    const neighborhood = locations
      ? locations.split(",").map((p) => p.trim()).find(Boolean) ?? ""
      : "";
    const area = neighborhood || city || "";
    const budgetMin = params.get("budgetMin");
    const budgetMax = params.get("budgetMax");
    const bedrooms = params.get("bedrooms");
    const bathrooms = params.get("bathrooms");

    if (!propertyType || !intentLabel || !area) return "Saved Search";
    const baseTitle = `${propertyType} for ${intentLabel} in ${toTitleCase(area)}`;

    // Include only one key filter. Prefer price if present.
    if (budgetMax) {
      return `${baseTitle} Under JD ${toCompactNumber(budgetMax)}`;
    }
    if (budgetMin) {
      return `${baseTitle} Up to JD ${toCompactNumber(budgetMin)}`;
    }

    // Bedrooms/Bathrooms only when exactly one of them is explicitly set.
    const hasBedrooms = Boolean(bedrooms);
    const hasBathrooms = Boolean(bathrooms);
    if (hasBedrooms !== hasBathrooms) {
      if (hasBedrooms) return `${baseTitle} ${bedrooms} Bedrooms`;
      return `${baseTitle} ${bathrooms} Bathrooms`;
    }

    return baseTitle;
  }, [queryString]);

  useEffect(() => {
    if (!open) {
      didPrefillOnOpenRef.current = false;
      return;
    }
    if (!didPrefillOnOpenRef.current && !name.trim()) {
      setName(initialName?.trim() || suggestedName);
      didPrefillOnOpenRef.current = true;
    }
  }, [open, suggestedName, initialName, name]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed || !queryString || isSubmitting) return;
      setIsSubmitting(true);
      const result = updateId
        ? await update({
            id: updateId,
            name: trimmed,
            queryString,
            notificationEnabled: true,
          })
        : await add({ name: trimmed, queryString });
      setIsSubmitting(false);
      if (!result.ok) {
        onToast?.({
          kind: "error",
          message: result.message || "Could not update search. Please try again.",
        });
        return;
      }
      onToast?.({
        kind: "success",
        message: updateId ? "Search updated successfully." : "Search saved successfully.",
      });
      setName("");
      onClose();
    },
    [name, queryString, add, update, updateId, isSubmitting, onClose, onToast],
  );

  const handleClose = useCallback(() => {
    setName("");
    onClose();
  }, [onClose]);

  return (
    <DialogRoot
      open={open}
      onClose={handleClose}
      containerClassName="p-4"
      className={cn(
        "w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-xl",
        isRtl && "text-right",
      )}
    >
      <div dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-[var(--color-charcoal)]">
            {t("saveSearchModalTitle")}
          </DialogTitle>
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
              disabled={isSubmitting}
              className="flex-1 rounded-xl border-2 border-[var(--border-subtle)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              aria-busy={isSubmitting}
              className="flex-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? updateId
                  ? "Updating..."
                  : "Saving..."
                : updateId
                  ? "Update Search"
                  : t("saveSearchSubmit")}
            </button>
          </div>
        </form>
      </div>
    </DialogRoot>
  );
}
