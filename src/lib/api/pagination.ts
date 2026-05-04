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
