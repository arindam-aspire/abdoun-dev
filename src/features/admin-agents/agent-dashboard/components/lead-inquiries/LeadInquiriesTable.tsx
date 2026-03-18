"use client";

import { Mail, MessageSquare } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Pagination } from "@/components/ui/Pagination";
import type { LeadInquiry, LeadInquirySource } from "@/types/leadInquiry";

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

function statusClass(status: string): string {
  if (status === "new") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "contacted") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "closed") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

const MESSAGE_PREVIEW_LEN = 48;
function messagePreview(msg: string): string {
  if (!msg) return "—";
  const t = msg.trim();
  return t.length <= MESSAGE_PREVIEW_LEN ? t : t.slice(0, MESSAGE_PREVIEW_LEN) + "…";
}

function leadDisplay(lead: LeadInquiry): string {
  if (lead.contactName && lead.contactEmail) return `${lead.contactName} (${lead.contactEmail})`;
  if (lead.contactName) return lead.contactName;
  if (lead.contactEmail) return lead.contactEmail;
  if (lead.contactPhone) return lead.contactPhone;
  return "—";
}

function sourceLabel(source: LeadInquirySource, t: (k: string) => string): string {
  if (source === "contact_form") return t("sourceContactForm");
  if (source === "email") return t("sourceEmail");
  if (source === "phone") return t("sourcePhone");
  if (source === "whatsapp") return t("sourceWhatsapp");
  return source;
}

function statusLabel(status: string, t: (k: string) => string): string {
  if (status === "new") return t("filterNew");
  if (status === "contacted") return t("filterContacted");
  if (status === "closed") return t("filterClosed");
  return status;
}

export interface LeadInquiriesTableProps {
  leads: LeadInquiry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  basePath: string;
  onOpenLead: (id: string) => void;
  paginationTranslations: {
    previous: string;
    next: string;
    page: string;
    of: string;
    showing: string;
    to: string;
    results: string;
  };
}

export function LeadInquiriesTable({
  leads,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  basePath,
  onOpenLead,
  paginationTranslations,
}: LeadInquiriesTableProps) {
  const t = useTranslations("leadInquiries");

  return (
    <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
              <th className="px-4 py-3 font-medium">{t("tableProperty")}</th>
              <th className="px-4 py-3 font-medium">{t("tableSource")}</th>
              <th className="px-4 py-3 font-medium">{t("tableLeadContact")}</th>
              <th className="px-4 py-3 font-medium">{t("tableDateReceived")}</th>
              <th className="px-4 py-3 font-medium">{t("tableMessage")}</th>
              <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
              <th className="px-4 py-3 font-medium">{t("tableLastActivity")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((row) => (
              <tr
                key={row.id}
                className="border-b border-subtle/70 text-sm last:border-b-0 hover:bg-surface/50"
              >
                <td className="px-4 py-3 font-medium text-charcoal">{row.propertyName}</td>
                <td className="px-4 py-3 text-charcoal/80">
                  <span className="inline-flex rounded-full border border-subtle bg-surface px-2 py-1 text-[11px] font-medium">
                    {sourceLabel(row.source, t)}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-charcoal/80 max-w-[180px] truncate"
                  title={leadDisplay(row)}
                >
                  {leadDisplay(row)}
                </td>
                <td className="px-4 py-3 text-charcoal/80 whitespace-nowrap">
                  {formatDate(row.dateReceived)}
                </td>
                <td className="px-4 py-3 text-charcoal/80 max-w-[200px] truncate" title={row.message}>
                  {messagePreview(row.message)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(
                      row.status,
                    )}`}
                  >
                    {statusLabel(row.status, t)}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal/80 whitespace-nowrap">
                  {formatDate(row.lastActivityAt ?? row.respondedAt ?? row.dateReceived)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenLead(row.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                    {t("open")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Mail className="h-10 w-10 text-charcoal/40" aria-hidden />
          <p className="mt-2 text-sm text-charcoal/70">{t("noLeads")}</p>
        </div>
      ) : (
        <div className="border-t border-subtle px-4 py-4 md:px-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            basePath={basePath}
            translations={paginationTranslations}
          />
        </div>
      )}
    </article>
  );
}

