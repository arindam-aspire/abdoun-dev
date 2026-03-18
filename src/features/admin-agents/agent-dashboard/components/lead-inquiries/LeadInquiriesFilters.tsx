"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Dropdown } from "@/components/ui/dropdown";
import type { LeadInquirySource, LeadStatus } from "@/types/leadInquiry";

const STATUS_OPTIONS: readonly (LeadStatus | "all")[] = [
  "all",
  "new",
  "contacted",
  "closed",
];
const PERIOD_OPTIONS = ["all", "weekly", "monthly", "yearly"] as const;
const SOURCE_OPTIONS: readonly (LeadInquirySource | "all")[] = [
  "all",
  "contact_form",
  "email",
  "phone",
  "whatsapp",
];

export type PeriodFilter = (typeof PERIOD_OPTIONS)[number];

export interface LeadInquiriesFiltersProps {
  status: LeadStatus | "all";
  period: PeriodFilter;
  source: LeadInquirySource | "all";
  onStatusChange: (value: LeadStatus | "all") => void;
  onPeriodChange: (value: PeriodFilter) => void;
  onSourceChange: (value: LeadInquirySource | "all") => void;
}

export function LeadInquiriesFilters({
  status,
  period,
  source,
  onStatusChange,
  onPeriodChange,
  onSourceChange,
}: LeadInquiriesFiltersProps) {
  const t = useTranslations("leadInquiries");

  const statusLabel = (s: LeadStatus | "all") => {
    if (s === "all") return t("filterAllStatus");
    if (s === "new") return t("filterNew");
    if (s === "contacted") return t("filterContacted");
    if (s === "closed") return t("filterClosed");
    return s;
  };
  const statusOptions = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: statusLabel(s),
  }));

  const periodOptions = PERIOD_OPTIONS.map((p) => ({
    value: p,
    label:
      p === "all"
        ? t("filterAllTime")
        : p === "weekly"
          ? t("filterWeekly")
          : p === "monthly"
            ? t("filterMonthly")
            : t("filterYearly"),
  }));

  const sourceOptions = SOURCE_OPTIONS.map((s) => ({
    value: s,
    label:
      s === "all"
        ? t("filterAllSource")
        : s === "contact_form"
          ? t("sourceContactForm")
          : s === "email"
            ? t("sourceEmail")
            : s === "phone"
              ? t("sourcePhone")
              : t("sourceWhatsapp"),
  }));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
        <Filter className="h-4 w-4" aria-hidden />
        {t("filter")}
      </div>
      <div className="hidden h-4 w-px bg-subtle sm:block" />
      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
        <Dropdown
          buttonId="lead-status-filter"
          label={t("filterStatus")}
          value={status}
          onChange={(val) => onStatusChange(val as LeadStatus | "all")}
          options={statusOptions}
          align="left"
        />
        <Dropdown
          buttonId="lead-period-filter"
          label={t("filterPeriod")}
          value={period}
          onChange={(val) => onPeriodChange(val as PeriodFilter)}
          options={periodOptions}
          align="left"
        />
        <Dropdown
          buttonId="lead-source-filter"
          label={t("filterSource")}
          value={source}
          onChange={(val) => onSourceChange(val as LeadInquirySource | "all")}
          options={sourceOptions}
          align="left"
        />
      </div>
    </div>
  );
}

