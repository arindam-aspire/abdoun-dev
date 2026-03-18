const PAGE_PARAM = "page";

/**
 * Builds the querystring used for the property search request.
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

