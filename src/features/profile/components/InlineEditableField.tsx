"use client";

import { useState, useCallback, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export interface InlineEditableFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onSave: (value: string) => void | Promise<void>;
  /** When "select", renders a <select> in edit mode. Options: { value, label } */
  options?: { value: string; label: string }[];
  /** If true, field is read-only (no edit). */
  readOnly?: boolean;
  isRtl?: boolean;
  className?: string;
}

export function InlineEditableField({
  label,
  value,
  placeholder,
  onSave,
  options,
  readOnly = false,
  isRtl = false,
  className,
}: InlineEditableFieldProps) {
  const t = useTranslations("profile");
  const safeValue = value ?? "";
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(safeValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setEditValue(safeValue);
  }, [safeValue, editing]);

  const startEdit = useCallback(() => {
    if (readOnly) return;
    setEditValue(safeValue);
    setEditing(true);
  }, [readOnly, safeValue]);

  const cancelEdit = useCallback(() => {
    setEditValue(safeValue);
    setEditing(false);
  }, [safeValue]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (options) {
      if (!options.some((o) => o.value === trimmed)) {
        cancelEdit();
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(options ? editValue : trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [editValue, onSave, options, cancelEdit]);

  const displayValue = safeValue.trim() || null;
  const showPlaceholder = !displayValue && placeholder;

  return (
    <div className={cn("group flex flex-col gap-1", className)} dir={isRtl ? "rtl" : "ltr"}>
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {editing ? (
        <div className="flex items-center gap-2">
          {options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              autoFocus
              disabled={saving}
              aria-label={label}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              placeholder={placeholder}
              autoFocus
              disabled={saving}
              aria-label={label}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
                if (e.key === "Escape") cancelEdit();
              }}
            />
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || (options ? false : !editValue.trim())}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30"
            aria-label={t("save")}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "min-h-[2.25rem] flex-1 rounded-lg border border-transparent px-3 py-2 text-sm",
              showPlaceholder
                ? "text-zinc-400 dark:text-zinc-500"
                : "text-zinc-900 dark:text-zinc-100",
            )}
          >
            {displayValue ?? placeholder}
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={startEdit}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label={t("editField")}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

