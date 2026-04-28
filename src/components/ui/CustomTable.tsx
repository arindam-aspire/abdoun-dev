"use client";

import type { ReactNode, MouseEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Pagination, type PaginationProps } from "@/components/ui/Pagination";

export type SortDirection = "asc" | "desc";

export type SortRule = {
  id: string;
  direction: SortDirection;
};

/** Multi-column: earlier rules are higher priority. */
export type SortConfig = SortRule[];

/**
 * Next sort state after a header click. Single click: one primary column (asc, then toggles).
 * Shift+click: add or toggle a column in the multi-sort chain.
 */
export function getNextSortConfig(
  prev: SortConfig,
  columnId: string,
  sortable: boolean,
  shiftKey: boolean,
): SortConfig {
  if (!sortable) return prev;
  if (shiftKey) {
    const i = prev.findIndex((r) => r.id === columnId);
    if (i === -1) return [...prev, { id: columnId, direction: "asc" as const }];
    const next = [...prev];
    const cur = next[i]!;
    next[i] = { id: columnId, direction: cur.direction === "asc" ? "desc" : "asc" };
    return next;
  }
  if (prev.length === 1 && prev[0]!.id === columnId) {
    return [
      { id: columnId, direction: prev[0]!.direction === "asc" ? "desc" : "asc" },
    ];
  }
  return [{ id: columnId, direction: "asc" }];
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number" && !Number.isNaN(a) && !Number.isNaN(b)) {
    return a - b;
  }
  const aStr = String(a);
  const bStr = String(b);
  if (/^\d{4}-\d{2}-\d{2}/.test(aStr) && /^\d{4}-\d{2}-\d{2}/.test(bStr)) {
    const ta = Date.parse(aStr);
    const tb = Date.parse(bStr);
    if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb;
  }
  return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Client-side sort for current page rows only. Does not call APIs.
 */
export function sortRowsByConfig<T>(
  rows: T[],
  config: SortConfig,
  getValue: (row: T, columnId: string) => unknown,
): T[] {
  if (config.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const rule of config) {
      const va = getValue(a, rule.id);
      const vb = getValue(b, rule.id);
      const c = compareValues(va, vb);
      if (c !== 0) return rule.direction === "asc" ? c : -c;
    }
    return 0;
  });
}

export type CustomTableColumn<T> = {
  id: string;
  header: ReactNode;
  sortable?: boolean;
  className?: string;
  /** Header <th> classes */
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
  /** Value used for default sorting when `sortable` (string / number / ISO date string). */
  getSortValue?: (row: T) => unknown;
};

export type CustomTablePagination = {
  showWhen: boolean;
} & PaginationProps;

export type CustomTableProps<T> = {
  columns: CustomTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  sortConfig: SortConfig;
  onSort: (next: SortConfig) => void;
  /**
   * When true, Shift+click on a sortable header adds or toggles that column in the sort chain.
   * When false, every header click is single-column mode only.
   */
  multiSortWithShift?: boolean;
  /** Loading: shows `skeleton` in tbody. */
  loading?: boolean;
  skeleton: ReactNode;
  error: string | null;
  /** Optional custom error cell content (replaces default body copy). */
  errorDescription?: ReactNode;
  /** Optional title line above the error `error` string. */
  errorTitle?: ReactNode;
  emptyMessage: ReactNode;
  minTableWidth?: string;
  pagination?: CustomTablePagination;
  className?: string;
  tableClassName?: string;
};

function SortIndicator({
  columnId,
  sortConfig,
}: {
  columnId: string;
  sortConfig: SortConfig;
}) {
  const i = sortConfig.findIndex((r) => r.id === columnId);
  if (i === -1) {
    return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />;
  }
  const direction = sortConfig[i]!.direction;
  return (
    <span className="inline-flex items-center gap-0.5">
      {sortConfig.length > 1 ? (
        <span className="text-[10px] font-semibold text-charcoal/50" aria-hidden>
          {i + 1}
        </span>
      ) : null}
      {direction === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      )}
    </span>
  );
}

export function CustomTable<T>({
  columns,
  data,
  getRowId,
  sortConfig,
  onSort,
  multiSortWithShift = true,
  loading = false,
  skeleton,
  error,
  errorDescription,
  errorTitle,
  emptyMessage,
  minTableWidth = "900px",
  pagination,
  className,
  tableClassName,
}: CustomTableProps<T>) {
  const colCount = columns.length;
  const sortableSet = new Set(
    columns.filter((c) => c.sortable && c.getSortValue).map((c) => c.id),
  );

  let paginationEl: ReactNode = null;
  if (pagination?.showWhen) {
    const { showWhen: _showWhen, ...paginationProps } = pagination;
    paginationEl = (
      <div className="mt-6 border-t border-subtle pt-4">
        <Pagination {...paginationProps} />
      </div>
    );
  }

  const onHeaderClick = (column: CustomTableColumn<T>, e: MouseEvent<HTMLButtonElement>) => {
    if (!column.sortable || !column.getSortValue) return;
    if (!sortableSet.has(column.id)) return;
    const next = getNextSortConfig(
      sortConfig,
      column.id,
      true,
      multiSortWithShift && e.shiftKey,
    );
    onSort(next);
  };

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table
          className={cn("w-full text-left text-sm", tableClassName)}
          style={{ minWidth: minTableWidth }}
        >
          <thead>
            <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
              {columns.map((col) => {
                const canSort = Boolean(col.sortable && col.getSortValue);
                const rules = sortConfig;
                const activeIndex = rules.findIndex((r) => r.id === col.id);
                const ariaSort: "ascending" | "descending" | "none" | undefined =
                  !canSort
                    ? undefined
                    : activeIndex === -1
                      ? "none"
                      : rules[activeIndex]!.direction === "asc"
                        ? "ascending"
                        : "descending";
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn("px-4 py-3 font-medium", col.headerClassName, col.className)}
                    aria-sort={ariaSort}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={(e) => onHeaderClick(col, e)}
                        className="inline-flex w-full items-center justify-start gap-1.5 text-left text-charcoal/90 hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 rounded-sm -m-0.5 p-0.5"
                        title={multiSortWithShift ? "Shift+click for multi-column sort" : undefined}
                      >
                        <span className="min-w-0 flex-1">{col.header}</span>
                        <SortIndicator columnId={col.id} sortConfig={sortConfig} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          {loading ? (
            skeleton
          ) : error ? (
            <tbody>
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-10 align-top text-left text-size-sm text-rose-700"
                >
                  {errorDescription ?? (
                    <>
                      <p className="fw-medium">
                        {errorTitle ?? "Something went wrong while loading this data."}
                      </p>
                      <p className="mt-1 text-charcoal/80">{error}</p>
                      <p className="mt-2 text-size-xs text-charcoal/60">
                        Check your connection, refresh the page, or try again in a few minutes.
                      </p>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-12 text-center text-size-sm text-charcoal/80"
                >
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-subtle/70 last:border-b-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn("px-4 py-3", col.cellClassName, col.className)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {paginationEl}
    </div>
  );
}
