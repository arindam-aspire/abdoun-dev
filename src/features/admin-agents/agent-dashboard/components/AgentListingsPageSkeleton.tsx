"use client";

import { Building2, ChevronDown, Filter, Plus } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

const DRAFT_SKELETON_COUNT = 4;

/** Matches `Dropdown` trigger: white pill, border, chevron (loading placeholder inside). */
function DropdownTriggerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-subtle bg-white px-4 py-2 text-xs font-medium text-charcoal shadow-sm sm:w-44",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="h-3.5 flex-1 max-w-[6.5rem] bg-zinc-200/90 dark:bg-zinc-600/45" />
      <ChevronDown className="h-4 w-4 shrink-0 text-charcoal/30" aria-hidden />
    </div>
  );
}

/** Soft grey bars (match listing empty / draft placeholders in the design). */
function Bar({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-zinc-200/90 dark:bg-zinc-600/45", className)} />;
}

export function AgentListingsPageSkeleton() {
  const t = useTranslations("agentDashboard");

  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-live="polite"
      aria-label={t("loadingListings")}
    >
      {/* Same chrome as loaded page: title + subtitle + primary CTA */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="min-w-0">
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {t("manageListingsTitle")}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">{t("manageListingsSubtitle")}</p>
        </div>
        <div
          className="pointer-events-none inline-flex shrink-0 select-none items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm animate-pulse"
          aria-hidden
        >
          <Plus className="h-4 w-4 shrink-0 opacity-95" />
          {t("addNewProperty")}
        </div>
      </div>

      {/* Filter row — matches AgentListingsPage */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4 shrink-0" aria-hidden />
          {t("filter")}
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
          <DropdownTriggerSkeleton />
          <DropdownTriggerSkeleton />
        </div>
      </div>

      {/* “Your draft listings” — same shell as loaded page; rows are skeleton */}
      <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 md:p-5">
        <h2 className="text-size-sm fw-semibold text-charcoal">
          {t("draftSubmissionsHeading", { count: DRAFT_SKELETON_COUNT })}
        </h2>
        <p className="mt-1 text-size-sm text-charcoal/70">{t("draftSubmissionsHint")}</p>
        <ul className="mt-3 space-y-2">
          {Array.from({ length: DRAFT_SKELETON_COUNT }, (_, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-subtle bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-4 w-[min(100%,12rem)] max-w-full" />
                <Bar className="h-3 w-[min(100%,18rem)] max-w-full" />
              </div>
              <Bar className="h-9 w-[5.5rem] shrink-0 rounded-lg border border-primary/25 bg-primary/15 sm:self-center" />
            </li>
          ))}
        </ul>
      </section>

      {/* Main table — same card + header as loaded page */}
      <article className="overflow-hidden rounded-2xl border border-subtle bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                <th className="px-4 py-3 font-medium">{t("tableTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("tableType")}</th>
                <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("tableLastUpdated")}</th>
                <th className="px-4 py-3 font-medium">{t("tablePrice")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>{null}</tbody>
          </table>
        </div>
        {/* Same empty zone as loaded page (icon + line); text line is skeleton until data arrives */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-10 w-10 text-charcoal/40" aria-hidden />
          <div className="mt-3 flex flex-col items-center gap-2">
            <Bar className="h-4 w-44 max-w-[min(100%,12rem)]" />
            <Bar className="h-3.5 w-36 max-w-full opacity-80" />
          </div>
        </div>
      </article>
    </div>
  );
}
