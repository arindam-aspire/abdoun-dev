"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Bookmark } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSavedSearches } from "@/features/saved-searches/hooks/useSavedSearches";
import type { SavedSearchItem } from "@/features/saved-searches/savedSearchesSlice";
import { SavedSearchList } from "@/features/saved-searches/components/SavedSearchList";

export function SavedSearchesPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const isRtl = locale === "ar";
  const t = useTranslations("savedSearches");
  const authUser = useAppSelector(selectCurrentUser);
  const { items, rename, remove, runUrl } = useSavedSearches();

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
      rename(editingId, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  }, [editingId, editName, rename]);

  const handleDelete = useCallback(
    (id: string) => {
      if (typeof window !== "undefined" && window.confirm(t("delete") + "?")) {
        remove(id);
      }
    },
    [remove, t],
  );

  const runSearch = useCallback(
    (queryString: string) => {
      router.push(runUrl({ locale, queryString }));
    },
    [locale, router, runUrl],
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

      <SavedSearchList
        items={items}
        isRtl={isRtl}
        listLabel={t("listLabel")}
        editingId={editingId}
        editName={editName}
        onEditNameChange={setEditName}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
        onDelete={handleDelete}
        onRun={runSearch}
        labels={{
          runSearch: t("runSearch"),
          edit: t("edit"),
          delete: t("delete"),
          save: "Save",
          cancel: "Cancel",
        }}
      />
    </div>
  );
}

