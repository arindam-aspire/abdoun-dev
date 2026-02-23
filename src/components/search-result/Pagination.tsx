"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  /** Current 1-based page */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items (optional, for "Showing X–Y of Z") */
  totalItems?: number;
  /** Items per page (optional, for "Showing X–Y of Z") */
  pageSize?: number;
  /** Base path (no query). Defaults to pathname; page param is appended as ?page=N */
  basePath?: string;
  /** Name of the page query param. Default "page" */
  pageParam?: string;
  /** Max page numbers to show around current (e.g. 2 => 1 ... 4 5 6 ... 10). Default 2 */
  siblingCount?: number;
  /** Optional translations */
  translations?: {
    previous?: string;
    next?: string;
    page?: string;
    of?: string;
    showing?: string;
    to?: string;
    results?: string;
  };
  /** Optional class for the nav */
  className?: string;
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * Returns an array of page numbers to display, with possible ellipsis.
 * e.g. [1, '...', 4, 5, 6, '...', 10]
 */
function getPageNumbers(
  current: number,
  total: number,
  siblingCount: number,
): (number | "ellipsis")[] {
  if (total <= 1) return [1];
  const totalVisible = siblingCount * 2 + 3; // current + left + right + first + last
  if (total <= totalVisible) return range(1, total);

  const left = Math.max(1, current - siblingCount);
  const right = Math.min(total, current + siblingCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, right + 1), "ellipsis", total];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(left - 1, total)];
  }
  if (showLeftEllipsis && showRightEllipsis) {
    return [1, "ellipsis", ...range(left, right), "ellipsis", total];
  }
  return [1, "ellipsis", ...range(left, right), "ellipsis", total];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  basePath,
  pageParam = "page",
  siblingCount = 2,
  translations = {},
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const base = basePath ?? pathname ?? "";
  const t = {
    previous: translations.previous ?? "Previous",
    next: translations.next ?? "Next",
    page: translations.page ?? "Page",
    of: translations.of ?? "of",
    showing: translations.showing ?? "Showing",
    to: translations.to ?? "to",
    results: translations.results ?? "results",
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (page <= 1) params.delete(pageParam);
    else params.set(pageParam, String(page));
    const query = params.toString();
    router.push(query ? `${base}?${query}` : base);
  };

  const startItem = totalItems != null ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems != null ? Math.min(currentPage * pageSize, totalItems) : null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1 && !totalItems) return null;

  return (
    <nav
      className={cn("flex flex-col items-center gap-4 sm:flex-row sm:justify-between", className)}
      aria-label="Pagination"
    >
      {totalItems != null && startItem != null && endItem != null && (
        <p className="order-2 text-sm text-[var(--color-charcoal)]/70 sm:order-1">
          {t.showing} <span className="font-medium">{startItem}</span> {t.to}{" "}
          <span className="font-medium">{endItem}</span> {t.of}{" "}
          <span className="font-medium">{totalItems}</span> {t.results}
        </p>
      )}

      <div className="order-1 flex items-center gap-1 sm:order-2">
        <span className="mr-2 hidden text-sm text-[var(--color-charcoal)]/70 sm:inline">
          {t.page} {currentPage} {t.of} {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={!hasPrev}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-white text-[var(--color-charcoal)] transition",
            hasPrev
              ? "hover:bg-[var(--surface)] hover:border-[var(--brand-primary)]/30 hover:text-[var(--brand-primary)]"
              : "cursor-not-allowed opacity-50",
          )}
          aria-label={t.previous}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex items-center gap-0.5">
          {pages.map((page, i) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-10 w-10 items-center justify-center text-sm text-[var(--color-charcoal)]/50"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => setPage(page)}
                className={cn(
                  "flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border text-sm font-medium transition",
                  page === currentPage
                    ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white"
                    : "border-[var(--border-subtle)] bg-white text-[var(--color-charcoal)] hover:border-[var(--brand-primary)]/30 hover:bg-[var(--surface)] hover:text-[var(--brand-primary)]",
                )}
                aria-label={`${t.page} ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={!hasNext}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-white text-[var(--color-charcoal)] transition",
            hasNext
              ? "hover:bg-[var(--surface)] hover:border-[var(--brand-primary)]/30 hover:text-[var(--brand-primary)]"
              : "cursor-not-allowed opacity-50",
          )}
          aria-label={t.next}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
