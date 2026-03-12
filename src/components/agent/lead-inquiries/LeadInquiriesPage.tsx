"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import {
  addLeadResponse,
  addLeadNote,
  getLeadInquiries,
  getLeadInquiryById,
  getLeadNotes,
  updateLeadStatus,
} from "@/services/leadInquiriesMockService";
import type { LeadInquiry, LeadInquiryNote, LeadInquirySource, LeadStatus } from "@/types/leadInquiry";
import { useTranslations } from "@/hooks/useTranslations";
import { LeadInquiriesFilters, type PeriodFilter } from "./LeadInquiriesFilters";
import { LeadInquiriesTable } from "./LeadInquiriesTable";
import { LeadInquiryDetailModal } from "./LeadInquiryDetailModal";

const PAGE_SIZE = 10;

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function LeadInquiriesPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("leadInquiries");
  const tSearch = useTranslations("searchResult");

  const statusParam = searchParams.get("status");
  const periodParam = searchParams.get("period");
  const sourceParam = searchParams.get("source");
  const pageParam = Number(searchParams.get("page") ?? "1");

  const statusFilter: LeadStatus | "all" =
    statusParam === "new" || statusParam === "contacted" || statusParam === "closed"
      ? statusParam
      : "all";
  const periodFilter: PeriodFilter =
    periodParam === "weekly" || periodParam === "monthly" || periodParam === "yearly"
      ? periodParam
      : "all";
  const sourceFilter: LeadInquirySource | "all" =
    sourceParam === "contact_form" || sourceParam === "email" || sourceParam === "phone" || sourceParam === "whatsapp"
      ? sourceParam
      : "all";

  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<LeadInquiry | null>(null);
  const [notes, setNotes] = useState<LeadInquiryNote[]>([]);
  const [responseText, setResponseText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const load = useCallback(() => {
    setLoading(true);
    getLeadInquiries().then((list) => {
      setLeads(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setNotes([]);
      return;
    }
    getLeadInquiryById(selectedId).then(setSelected);
    getLeadNotes(selectedId).then(setNotes);
  }, [selectedId]);

  const openLead = (id: string) => {
    setSelectedId(id);
    setResponseText("");
    setNoteText("");
  };

  const closeModal = () => {
    setSelectedId(null);
    setSelected(null);
    setNotes([]);
    setResponseText("");
    setNoteText("");
  };

  const handleSendResponse = async () => {
    if (!selectedId || !responseText.trim()) return;
    setSending(true);
    try {
      await addLeadResponse(selectedId, responseText.trim());
      load();
      setResponseText("");
      getLeadInquiryById(selectedId).then(setSelected);
    } finally {
      setSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedId || !noteText.trim()) return;
    setAddingNote(true);
    try {
      const added = await addLeadNote(selectedId, noteText.trim());
      if (added) {
        setNotes((prev) => [added, ...prev]);
        setNoteText("");
        load();
        getLeadInquiryById(selectedId).then(setSelected);
      }
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!selectedId) return;
    await updateLeadStatus(selectedId, status);
    load();
    getLeadInquiryById(selectedId).then(setSelected);
  };

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (periodFilter === "weekly") return isWithinDays(lead.dateReceived, 7);
      if (periodFilter === "monthly") return isWithinDays(lead.dateReceived, 30);
      if (periodFilter === "yearly") return isWithinDays(lead.dateReceived, 365);
      return true;
    });
  }, [leads, statusFilter, sourceFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedLeads = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingLeads")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/agent-dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("backToDashboard")}
        </Link>
      </div>
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("subtitle")}
        </p>
      </div>

      <LeadInquiriesFilters
        status={statusFilter}
        period={periodFilter}
        source={sourceFilter}
        onStatusChange={(val) => updateQueryParams({ status: val })}
        onPeriodChange={(val) => updateQueryParams({ period: val })}
        onSourceChange={(val) => updateQueryParams({ source: val })}
      />

      <LeadInquiriesTable
        leads={paginatedLeads}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        basePath={pathname}
        onOpenLead={openLead}
        paginationTranslations={{
          previous: tSearch("paginationPrevious"),
          next: tSearch("paginationNext"),
          page: tSearch("paginationPage"),
          of: tSearch("paginationOf"),
          showing: tSearch("paginationShowing"),
          to: tSearch("paginationTo"),
          results: tSearch("paginationResults"),
        }}
      />

      <LeadInquiryDetailModal
        open={!!selectedId}
        lead={selected}
        notes={notes}
        responseText={responseText}
        noteText={noteText}
        sending={sending}
        addingNote={addingNote}
        onClose={closeModal}
        onResponseChange={setResponseText}
        onNoteChange={setNoteText}
        onSendResponse={handleSendResponse}
        onAddNote={handleAddNote}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
