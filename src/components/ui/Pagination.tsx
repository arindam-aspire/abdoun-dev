"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Dropdown } from "@/components/ui";

export const PAGINATION_PAGE_SIZES = [10, 15, 20] as const;
export type PaginationPageSize = (typeof PAGINATION_PAGE_SIZES)[number];
export const DEFAULT_PAGINATION_PAGE_SIZE: PaginationPageSize =
  PAGINATION_PAGE_SIZES[0];

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
  /** Name of the page size query param. Default "pageSize" */
  pageSizeParam?: string;
  /** Optional callback fired when page changes (after URL update). */
  onPageChange?: (page: number) => void;
  /** Optional callback fired when page size changes (after URL update). */
  onPageSizeChange?: (pageSize: number) => void;
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
  /** Show "Page X of Y" status text (hidden by default). */
  showPageStatus?: boolean;
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
  pageSize = DEFAULT_PAGINATION_PAGE_SIZE,
  basePath,
  pageParam = "page",
  pageSizeParam: pageSizeParamProp,
  onPageChange,
  onPageSizeChange,
  siblingCount = 2,
  translations = {},
  className,
  showPageStatus = false,
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

  const pageSizeKey = pageSizeParamProp ?? "pageSize";
  const pageSizeOptions = PAGINATION_PAGE_SIZES.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const pageSizeValue = pageSizeOptions.some(
    (o) => o.value === String(pageSize),
  )
    ? String(pageSize)
    : String(DEFAULT_PAGINATION_PAGE_SIZE);

  const setPage = (page: number) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (page <= 1) params.delete(pageParam);
    else params.set(pageParam, String(page));
    const query = params.toString();
    router.push(query ? `${base}?${query}` : base);
    onPageChange?.(page);
  };

  const setPageSize = (nextPageSize: string) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    params.set(pageSizeKey, nextPageSize);
    params.delete(pageParam); // reset to page 1
    const query = params.toString();
    router.push(query ? `${base}?${query}` : base);
    const n = Number.parseInt(nextPageSize, 10);
    if (Number.isFinite(n)) onPageSizeChange?.(n);
  };

  const startItem =
    totalItems != null ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems != null ? Math.min(currentPage * pageSize, totalItems) : null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1 && !totalItems) return null;

  return (
    <nav
      className={cn(
        "w-full flex flex-col items-center gap-4 sm:flex-row sm:justify-between",
        className,
      )}
      aria-label="Pagination"
    >
      {totalItems != null && startItem != null && endItem != null && (
        <p className="order-2 text-size-sm text-charcoal/70 sm:order-1">
          {t.showing} <span className="fw-medium">{startItem}</span> {t.to}{" "}
          <span className="fw-medium">{endItem}</span> {t.of}{" "}
          <span className="fw-medium">{totalItems}</span> {t.results}
        </p>
      )}

      <div className="order-1 flex items-center gap-1 sm:order-2">
        {showPageStatus && (
          <span className="mr-2 hidden text-size-sm text-charcoal/70 sm:inline">
            {t.page} {currentPage} {t.of} {totalPages}
          </span>
        )}

        <div className="mr-2 hidden items-center gap-2 sm:flex">
          <span className="text-size-sm text-charcoal/70">Per page</span>
          <Dropdown
            label="Per page"
            value={pageSizeValue}
            onChange={setPageSize}
            menuStyle={{ width: "80px" }}
            align="left"
            options={pageSizeOptions.map((o) => ({
              value: o.value,
              label: <span className="fw-medium">{o.label}</span>,
            }))}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setPage(currentPage - 1)}
          disabled={!hasPrev}
          className={cn(
            "h-10 w-10 rounded-lg border-subtle bg-white text-charcoal p-0",
            "hover:bg-surface hover:border-primary/30 hover:text-primary",
          )}
          aria-label={t.previous}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Button>

        <div className="flex items-center gap-0.5">
          {pages.map((page, i) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-10 w-10 items-center justify-center text-size-sm text-charcoal/50"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                type="button"
                variant={page === currentPage ? "primary" : "outline"}
                size="md"
                onClick={() => setPage(page)}
                className={cn(
                  "h-10 min-w-[2.5rem] rounded-lg text-size-sm fw-medium px-3 text-white",
                  page !== currentPage &&
                    "border-subtle bg-white text-charcoal hover:border-primary/30 hover:bg-surface hover:text-primary",
                )}
                aria-label={`${t.page} ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setPage(currentPage + 1)}
          disabled={!hasNext}
          className={cn(
            "h-10 w-10 rounded-lg border-subtle bg-white text-charcoal p-0",
            "hover:bg-surface hover:border-primary/30 hover:text-primary",
          )}
          aria-label={t.next}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
