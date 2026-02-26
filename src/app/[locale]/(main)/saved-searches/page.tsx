"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, Pencil, Trash2, Bookmark } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { updateSavedSearch, removeSavedSearch } from "@/features/savedSearches/savedSearchesSlice";
import type { SavedSearchItem } from "@/features/savedSearches/savedSearchesSlice";
import { useTranslations } from "@/hooks/useTranslations";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

export default function SavedSearchesPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const isRtl = locale === "ar";
  const t = useTranslations("savedSearches");
  const authUser = useAppSelector((state) => state.auth.user);
  const items = useAppSelector((state) => state.savedSearches.items);
  const dispatch = useAppDispatch();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = useCallback((item: SavedSearchItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editName.trim()) {
      dispatch(updateSavedSearch({ id: editingId, name: editName.trim() }));
      setEditingId(null);
      setEditName("");
    }
  }, [editingId, editName, dispatch]);

  const handleDelete = useCallback(
    (id: string) => {
      if (typeof window !== "undefined" && window.confirm(t("delete") + "?")) {
        dispatch(removeSavedSearch(id));
      }
    },
    [dispatch, t],
  );

  const runSearch = useCallback(
    (queryString: string) => {
      router.push(`/${locale}/search-result${queryString ? `?${queryString}` : ""}`);
    },
    [locale, router],
  );

  if (!authUser) {
    return (
      <div className="mx-auto container w-full px-4 py-10 md:px-8">
        <p className="text-[var(--color-charcoal)]/80">
          Please sign in to view your saved searches.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="mx-auto container w-full px-4 py-10 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {t("title")}
        </h1>
        <EmptyState
          icon={<Bookmark className="h-8 w-8" strokeWidth={1.5} />}
          title={t("emptyTitle")}
          subtitle={t("emptySubtitle")}
          actionLabel={t("searchButton")}
          actionHref="/search-result"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
        {t("title")}
      </h1>

      <ul className="space-y-3" aria-label={t("listLabel")}>
        {[...items].sort((a, b) => b.createdAt - a.createdAt).map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border-2 border-[var(--border-subtle)] px-3 py-2 text-sm focus:border-[var(--brand-secondary)] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="rounded-lg bg-[var(--brand-secondary)] px-3 py-2 text-sm font-medium text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-medium"
                  >
                    Cancel
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
                    onClick={() => runSearch(item.queryString)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-secondary)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {t("runSearch")}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
                    aria-label={t("edit")}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {t("delete")}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
