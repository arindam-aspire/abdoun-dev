"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import {
  addInquiryResponse,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
} from "@/services/agentDashboardMockService";
import type { AgentInquiry, InquiryStatus } from "@/types/agent";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Label } from "@/components/ui";

function statusClass(status: string): string {
  if (status === "new") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "responded") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(s: string, t: (k: string) => string): string {
  if (s === "new") return t("filterNew");
  if (s === "responded") return t("filterResponded");
  if (s === "closed") return t("filterClosed");
  return s;
}

export function AgentInquiriesPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [inquiries, setInquiries] = useState<AgentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AgentInquiry | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");

  const load = useCallback(() => {
    setLoading(true);
    getInquiries().then((list) => {
      setInquiries(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    getInquiryById(selectedId).then(setSelected);
  }, [selectedId]);

  const openInquiry = (id: string) => {
    setSelectedId(id);
    setResponseText("");
  };

  const closeModal = () => {
    setSelectedId(null);
    setSelected(null);
    setResponseText("");
  };

  const handleSendResponse = async () => {
    if (!selectedId || !responseText.trim()) return;
    setSending(true);
    try {
      await addInquiryResponse(selectedId, responseText.trim());
      load();
      setResponseText("");
      getInquiryById(selectedId).then(setSelected);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: InquiryStatus) => {
    await updateInquiryStatus(id, status);
    load();
    if (selectedId === id) {
      getInquiryById(id).then(setSelected);
    }
  };

  const filtered = inquiries.filter(
    (iq) => statusFilter === "all" || iq.status === statusFilter
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingInquiries")}</p>
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
          {t("inquiryInboxTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("inquiryInboxSubtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-charcoal/70">{t("filter")}:</span>
        {(["all", "new", "responded", "closed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              statusFilter === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-subtle bg-surface text-charcoal/80 hover:bg-primary/5"
            }`}
          >
            {s === "all" ? t("filterAll") : statusLabel(s, t)}
          </button>
        ))}
      </div>

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                <th className="px-4 py-3 font-medium">{t("tablePropertyName")}</th>
                <th className="px-4 py-3 font-medium">{t("tableDateReceived")}</th>
                <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-subtle/70 text-sm last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">{row.propertyName}</td>
                  <td className="px-4 py-3 text-charcoal/80">{formatDate(row.dateReceived)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(row.status)}`}
                    >
                      {statusLabel(row.status, t)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openInquiry(row.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t("open")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-10 w-10 text-charcoal/40" />
            <p className="mt-2 text-sm text-charcoal/70">{t("noInquiries")}</p>
          </div>
        ) : null}
      </article>

      <DialogRoot open={!!selectedId} onClose={closeModal}>
        <DialogTitle>{t("inquiry")}</DialogTitle>
        <DialogDescription>
          {selected ? selected.propertyName : t("loading")}
        </DialogDescription>
        <div className="space-y-4 py-2">
          {selected ? (
            <>
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("received")}</p>
                <p className="text-sm text-charcoal">{formatDate(selected.dateReceived)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("message")}</p>
                <p className="text-sm text-charcoal mt-1">{selected.message}</p>
              </div>
              {selected.response ? (
                <div>
                  <p className="text-xs font-medium text-charcoal/65">{t("yourResponse")}</p>
                  <p className="text-sm text-charcoal mt-1">{selected.response}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="inquiry-response">{t("reply")}</Label>
                <textarea
                  id="inquiry-response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full rounded-lg border border-subtle bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-charcoal/65">{t("status")}:</span>
                {(["new", "responded", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectedId && handleUpdateStatus(selectedId, s)}
                    className={`rounded-full border px-2 py-1 text-[11px] font-medium ${
                      selected.status === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-subtle bg-surface text-charcoal/80"
                    }`}
                  >
                    {statusLabel(s, t)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal/70">{t("loading")}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeModal}>
            {t("close")}
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleSendResponse}
            disabled={sending || !responseText.trim()}
          >
            {sending ? t("sending") : t("sendResponse")}
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}
