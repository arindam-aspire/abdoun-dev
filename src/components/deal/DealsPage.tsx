 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { BarChart3 } from "lucide-react";
import {
  addLeadResponse,
  addLeadNote,
  getLeadInquiries,
  getLeadInquiryById,
  getLeadNotes,
  updateLeadStatus,
} from "@/services/leadInquiriesMockService";
import type {
  LeadInquiry,
  LeadInquiryNote,
  LeadInquirySource,
  LeadStatus,
} from "@/types/leadInquiry";
import { useTranslations } from "@/hooks/useTranslations";
import { Dropdown } from "@/components/ui/dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui";
import { LeadInquiriesTable } from "@/features/admin-agents/agent-dashboard/components/lead-inquiries/LeadInquiriesTable";
import { LeadInquiryDetailModal } from "@/features/admin-agents/agent-dashboard/components/lead-inquiries/LeadInquiryDetailModal";

const PAGE_SIZE = 10;

type PeriodFilter = "all" | "weekly" | "monthly" | "yearly";

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function DealsPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("leadInquiries");
  const tSearch = useTranslations("searchResult");

  // Deals page is "closed" only (separate feature page).
  const statusFilter: LeadStatus = "closed";

  const periodParam = searchParams.get("period");
  const sourceParam = searchParams.get("source");
  const monthParam = searchParams.get("month");
  const queryParam = searchParams.get("q") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");

  const periodFilter: PeriodFilter =
    periodParam === "weekly" || periodParam === "monthly" || periodParam === "yearly"
      ? periodParam
      : "all";
  const sourceFilter: LeadInquirySource | "all" =
    sourceParam === "contact_form" ||
    sourceParam === "email" ||
    sourceParam === "phone" ||
    sourceParam === "whatsapp"
      ? sourceParam
      : "all";
  const monthFilter: string | "all" = monthParam && monthParam.length === 5 ? monthParam : "all";
  const query = queryParam.trim();

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
      const added = await addLeadNote(selectedId, noteText.trim(), "Admin");
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
      if (lead.status !== statusFilter) return false;
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (query) {
        const haystack = [
          lead.propertyName,
          lead.contactName,
          lead.contactEmail,
          lead.contactPhone,
          lead.message,
          lead.response,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      if (monthFilter !== "all") {
        const prefix = `20${monthFilter}`; // e.g. "26-03" -> "2026-03"
        if (!lead.dateReceived.startsWith(prefix)) return false;
      }
      if (periodFilter === "weekly") return isWithinDays(lead.dateReceived, 7);
      if (periodFilter === "monthly") return isWithinDays(lead.dateReceived, 30);
      if (periodFilter === "yearly") return isWithinDays(lead.dateReceived, 365);
      return true;
    });
  }, [leads, sourceFilter, periodFilter, monthFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedLeads = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const periodOptions = [
    { value: "all", label: t("filterAllTime") },
    { value: "weekly", label: t("filterWeekly") },
    { value: "monthly", label: t("filterMonthly") },
    { value: "yearly", label: t("filterYearly") },
  ];
  const sourceOptions = [
    { value: "all", label: t("filterAllSource") },
    { value: "contact_form", label: t("sourceContactForm") },
    { value: "email", label: t("sourceEmail") },
    { value: "phone", label: t("sourcePhone") },
    { value: "whatsapp", label: t("sourceWhatsapp") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Deals
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            Closed deals only. Review, add notes, and track outcomes.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">Deal list</CardTitle>
          </div>

          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={queryParam}
                  onChange={(event) => updateQueryParams({ q: event.target.value })}
                  placeholder="Search deals..."
                  className="h-10 w-full rounded-xl"
                />
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <Dropdown
                  buttonId="admin-deals-period-filter"
                  label={t("filterPeriod")}
                  value={periodFilter}
                  onChange={(val) => updateQueryParams({ period: val as string })}
                  options={periodOptions}
                  align="left"
                />
                <Dropdown
                  buttonId="admin-deals-source-filter"
                  label={t("filterSource")}
                  value={sourceFilter}
                  onChange={(val) => updateQueryParams({ source: val as string })}
                  options={sourceOptions}
                  align="left"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-size-sm text-charcoal/70">
              {t("loadingLeads")}
            </p>
          ) : (
            <LeadInquiriesTable
              leads={paginatedLeads}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              basePath={pathname}
              onOpenLead={openLead}
              variant="plain"
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
          )}
        </CardContent>
      </Card>

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

