export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

type PaginationInput = Partial<PaginationMeta> & {
  totalItems?: number;
  count?: number;
};

/**
 * Raw list payloads from the API may use either a nested `pagination` object or
 * flat `page` / `pageSize` / `total` / `totalPages` / `hasNext` / `hasPrevious`
 * next to `items` (see `docs/refractor/Pagination/PAGINATION_FE_CLEANUP.md`).
 */
export type ListPaginationWire = {
  items?: unknown;
  pagination?: (Partial<PaginationMeta> & { totalItems?: number; count?: number }) | null;
  page?: unknown;
  pageSize?: unknown;
  total?: unknown;
  totalPages?: unknown;
  hasNext?: unknown;
  hasPrevious?: unknown;
};

/**
 * Prefer nested `pagination` when present; otherwise read flat pagination fields from the payload.
 */
export function paginationInputFromListPayload(
  payload: ListPaginationWire | null | undefined,
): PaginationInput | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const nested = payload.pagination;
  if (nested != null && typeof nested === "object") {
    return nested as PaginationInput;
  }
  const hasFlat =
    payload.total != null ||
    payload.totalPages != null ||
    payload.page != null ||
    payload.pageSize != null ||
    typeof payload.hasNext === "boolean" ||
    typeof payload.hasPrevious === "boolean";
  if (!hasFlat) return undefined;
  return {
    page: toFiniteNumber(payload.page),
    pageSize: toFiniteNumber(payload.pageSize),
    total: toFiniteNumber(payload.total),
    totalPages: toFiniteNumber(payload.totalPages),
    hasNext: typeof payload.hasNext === "boolean" ? payload.hasNext : undefined,
    hasPrevious: typeof payload.hasPrevious === "boolean" ? payload.hasPrevious : undefined,
  };
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export function normalizePagination(
  input: PaginationInput | undefined,
  fallback: {
    page?: number;
    pageSize?: number;
    total?: number;
    itemsLength?: number;
  } = {},
): PaginationMeta {
  const page = Math.max(
    1,
    Math.floor(
      toFiniteNumber(input?.page) ?? toFiniteNumber(fallback.page) ?? 1,
    ),
  );
  const pageSize = Math.max(
    1,
    Math.floor(
      toFiniteNumber(input?.pageSize) ?? toFiniteNumber(fallback.pageSize) ?? 10,
    ),
  );
  const totalCandidate =
    toFiniteNumber(input?.total) ??
    toFiniteNumber(input?.totalItems) ??
    toFiniteNumber(input?.count) ??
    toFiniteNumber(fallback.total) ??
    fallback.itemsLength ??
    0;
  const total = Math.max(0, Math.floor(totalCandidate));
  const totalPages = Math.max(
    1,
    Math.floor(
      toFiniteNumber(input?.totalPages) ?? Math.ceil(total / pageSize),
    ),
  );
  const hasNext =
    typeof input?.hasNext === "boolean" ? input.hasNext : page < totalPages;
  const hasPrevious =
    typeof input?.hasPrevious === "boolean" ? input.hasPrevious : page > 1;

  return {
    page,
    pageSize,
    total: Math.max(total, fallback.itemsLength ?? 0),
    totalPages,
    hasNext,
    hasPrevious,
  };
}

export function createPaginatedResult<T>(
  items: T[] | null | undefined,
  paginationInput: PaginationInput | undefined,
  fallback: {
    page?: number;
    pageSize?: number;
    total?: number;
  } = {},
): PaginatedResult<T> {
  const safeItems = Array.isArray(items) ? items : [];
  return {
    items: safeItems,
    pagination: normalizePagination(paginationInput, {
      ...fallback,
      itemsLength: safeItems.length,
    }),
  };
}

/** Normalize `items` + nested or flat pagination from a list wire payload. */
export function createPaginatedResultFromListWire<T>(
  payload: ListPaginationWire | null | undefined,
  fallback: { page?: number; pageSize?: number; total?: number } = {},
): PaginatedResult<T> {
  const rawItems =
    payload && typeof payload === "object" && "items" in payload ? payload.items : undefined;
  const safeItems = Array.isArray(rawItems) ? (rawItems as T[]) : [];
  return createPaginatedResult(
    safeItems,
    paginationInputFromListPayload(payload ?? undefined),
    fallback,
  );
}
