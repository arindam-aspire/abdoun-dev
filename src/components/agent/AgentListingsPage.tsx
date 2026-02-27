"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft, Building2, Pencil, Trash2, Upload } from "lucide-react";
import {
  deleteListing,
  getListings,
  publishDraft,
  updateListing,
} from "@/services/agentDashboardMockService";
import type { AgentListing } from "@/types/agent";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui";

function statusClass(status: string): string {
  if (status === "active") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-JO", { style: "decimal" }).format(n) + " JOD";
}

export function AgentListingsPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AgentListing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getListings().then((list) => {
      setListings(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (listing: AgentListing) => {
    setEditing(listing);
    setEditTitle(listing.title);
    setEditPrice(String(listing.price));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle("");
    setEditPrice("");
  };

  const handleSave = async () => {
    if (!editing) return;
    const price = Number(editPrice);
    if (Number.isNaN(price) || price < 0) return;
    setSaving(true);
    try {
      await updateListing(editing.id, { title: editTitle.trim(), price });
      load();
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    await publishDraft(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await deleteListing(id);
    load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingListings")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/agent-dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          {t("manageListingsTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("manageListingsSubtitle")}
        </p>
      </div>

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                <th className="px-4 py-3 font-medium">{t("tableTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("tableLastUpdated")}</th>
                <th className="px-4 py-3 font-medium">{t("tablePrice")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-subtle/70 text-sm last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">{row.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${statusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80">{formatDate(row.lastUpdated)}</td>
                  <td className="px-4 py-3 text-charcoal">{formatPrice(row.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t("edit")}
                      </button>
                      {row.status === "draft" ? (
                        <button
                          type="button"
                          onClick={() => handlePublish(row.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {t("publish")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-charcoal/40" />
            <p className="mt-2 text-sm text-charcoal/70">{t("noListings")}</p>
          </div>
        ) : null}
      </article>

      <DialogRoot open={!!editing} onClose={closeEdit}>
        <DialogTitle>{t("editListing")}</DialogTitle>
        <DialogDescription>
          {t("editListingDescription")}
        </DialogDescription>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-listing-title">{t("tableTitle")}</Label>
            <Input
              id="edit-listing-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Listing title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-listing-price">Price (JOD)</Label>
            <Input
              id="edit-listing-price"
              type="number"
              min={0}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeEdit}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}
