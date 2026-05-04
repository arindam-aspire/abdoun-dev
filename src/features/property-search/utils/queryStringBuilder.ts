const PAGE_PARAM = "page";

/**
 * Stable key for property search dedupe: same logical filters/page produce the same string
 * regardless of param insertion order. Does not change the outgoing request — use the raw
 * string from `buildPropertySearchRequestQuery` for the API.
 */
export function normalizePropertySearchQueryKey(queryString: string): string {
  const params = new URLSearchParams(
    queryString.startsWith("?") ? queryString.slice(1) : queryString,
  );
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

/**
 * Builds the querystring used for the property search request.
 * Budget filters use canonical URL keys `budgetMin` / `budgetMax` (passed through from the page query as-is).
 * Must stay identical to the pre-refactor SearchResults logic:
 * - remove sort/view (client-only)
 * - enforce page and default pageSize
 */
export function buildPropertySearchRequestQuery(args: {
  searchParams: URLSearchParams;
  currentPage: number;
  defaultPageSize: number;
  sortParamKey?: string;
  viewParamKey?: string;
}): string {
  const {
    searchParams,
    currentPage,
    defaultPageSize,
    sortParamKey = "sort",
    viewParamKey = "view",
  } = args;

  const next = new URLSearchParams(searchParams.toString());
  next.delete(sortParamKey);
  next.delete(viewParamKey);
  next.set(PAGE_PARAM, String(currentPage));
  if (!next.get("pageSize")) {
    next.set("pageSize", String(defaultPageSize));
  }
  return next.toString();
}

