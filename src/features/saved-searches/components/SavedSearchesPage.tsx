"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Bookmark } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSavedSearches } from "@/features/saved-searches/hooks/useSavedSearches";
import type { SavedSearchItem } from "@/features/saved-searches/savedSearchesSlice";
import { SavedSearchList } from "@/features/saved-searches/components/SavedSearchList";
import type { SavedSearch } from "@/features/saved-searches/types";

export function SavedSearchesPage() {
  const toCamelCase = (value: string): string => {
    const parts = value
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean);
    if (parts.length === 0) return "";
    return parts
      .map((part, index) => {
        if (index === 0) return part.charAt(0).toLowerCase() + part.slice(1);
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join("");
  };

  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const isRtl = locale === "ar";
  const t = useTranslations("savedSearches");
  const authUser = useAppSelector(selectCurrentUser);
  const { items, rename, update, remove, runUrl, load } = useSavedSearches();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRename, setPendingRename] = useState<{ id: string; name: string } | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    kind: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const pendingDeleteItem =
    pendingDeleteId != null ? items.find((item) => item.id === pendingDeleteId) : null;

  useEffect(() => {
    if (!authUser) return;
    let active = true;
    void (async () => {
      setIsLoading(true);
      const result = await load();
      if (!active) return;
      if (!result.ok && result.message) {
        setToast({ kind: "error", message: result.message });
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [authUser, load]);

  const startEdit = useCallback((item: SavedSearchItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const nextName = editName.trim();
    if (!nextName) return;
    setPendingRename({ id: editingId, name: nextName });
  }, [editingId, editName]);

  const confirmRename = useCallback(async () => {
    if (!pendingRename) return;
    const result = await rename(pendingRename.id, pendingRename.name);
    if (!result.ok) {
      setToast({
        kind: "error",
        message: result.message || "Could not update saved search name.",
      });
      setPendingRename(null);
      return;
    }
    setToast({ kind: "success", message: "Saved search name updated." });
    setPendingRename(null);
    setEditingId(null);
    setEditName("");
  }, [pendingRename, rename]);

  const handleDelete = useCallback(
    (id: string) => {
      setPendingDeleteId(id);
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    const result = await remove(pendingDeleteId);
    if (!result.ok) {
      setToast({
        kind: "error",
        message: result.message || "Could not delete saved search.",
      });
      setPendingDeleteId(null);
      return;
    }
    setToast({ kind: "success", message: "Saved search deleted." });
    setPendingDeleteId(null);
  }, [pendingDeleteId, remove]);

  const runSearch = useCallback(
    async (item: SavedSearch) => {
      setRunningId(item.id);
      const result = await update({
        id: item.id,
        name: item.name,
        queryString: item.queryString,
        searchCriteria: item.searchCriteria,
        notificationEnabled: item.notificationEnabled ?? true,
      });
      if (!result.ok) {
        setToast({
          kind: "error",
          message: result.message || "Could not update saved search.",
        });
        setRunningId(null);
        return;
      }

      const params = new URLSearchParams(item.queryString);
      params.set("source", "saved-search");
      params.set("savedSearchId", item.id);
      params.set("savedSearchName", toCamelCase(item.name));
      const query = params.toString();
      const url = runUrl({ locale, queryString: query });
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
        setRunningId(null);
        return;
      }
      setRunningId(null);
      router.push(url);
    },
    [locale, router, runUrl, update],
  );

  const renderSkeletonState = () => (
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
        {t("title")}
      </h1>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`saved-search-skeleton-${index}`}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-white p-4"
          >
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!authUser) {
    return renderSkeletonState();
  }

  if (isLoading) {
    return renderSkeletonState();
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
        runningId={runningId}
        labels={{
          runSearch: t("runSearch"),
          updatingSearch: t("runSearch"),
          edit: t("edit"),
          delete: t("delete"),
          save: "Save",
          cancel: "Cancel",
        }}
      />
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete Saved Search"
        description={
          pendingDeleteItem
            ? `Are you sure you want to delete "${pendingDeleteItem.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this saved search? This action cannot be undone."
        }
        confirmLabel="Delete"
        loadingConfirmLabel="Deleting..."
        confirmButtonClassName="bg-rose-700 text-white hover:bg-rose-800"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        open={pendingRename !== null}
        title="Update Saved Search Name"
        description={
          pendingRename
            ? `Are you sure you want to rename this saved search to "${pendingRename.name}"?`
            : "Are you sure you want to update this saved search name?"
        }
        confirmLabel="Update"
        loadingConfirmLabel="Updating..."
        confirmButtonClassName="bg-[var(--brand-secondary)] text-white hover:opacity-95"
        onCancel={() => setPendingRename(null)}
        onConfirm={confirmRename}
      />
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}

