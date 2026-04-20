"use client";

import type { SavedSearch } from "@/features/saved-searches/types";
import { Search, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SavedSearchListProps {
  items: SavedSearch[];
  isRtl: boolean;
  listLabel: string;
  editingId: string | null;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartEdit: (item: SavedSearch) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (id: string) => void;
  onRun: (item: SavedSearch) => void;
  runningId?: string | null;
  labels: {
    runSearch: string;
    updatingSearch?: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
  };
}

export function SavedSearchList({
  items,
  isRtl,
  listLabel,
  editingId,
  editName,
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRun,
  runningId,
  labels,
}: SavedSearchListProps) {
  return (
    <ul className="space-y-3" aria-label={listLabel}>
      {[...items]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border-2 border-[var(--border-subtle)] px-3 py-2 text-sm focus:border-[var(--brand-secondary)] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="rounded-lg bg-[var(--brand-secondary)] px-3 py-2 text-sm font-medium text-white"
                  >
                    {labels.save}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-medium"
                  >
                    {labels.cancel}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 font-medium text-[var(--color-charcoal)]">
                  {item.name}
                </span>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onRun(item)}
                    disabled={runningId === item.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-secondary)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {runningId === item.id
                      ? (labels.updatingSearch ?? "Updating...")
                      : labels.runSearch}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
                    aria-label={labels.edit}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    {labels.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    aria-label={labels.delete}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {labels.delete}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
    </ul>
  );
}

