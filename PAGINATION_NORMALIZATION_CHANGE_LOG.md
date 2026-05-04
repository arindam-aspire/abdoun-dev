# Pagination Normalization Change Log

## Summary

Standardized list-response handling around a shared frontend contract:

- `PaginatedResult<T>` with `items` + `pagination`
- `PaginationMeta` (`page`, `pageSize`, `total`, `totalPages`, `hasNext`, `hasPrevious`)

Normalization is now handled in API modules so components/slices no longer parse backend-specific pagination keys.

## Shared Types Added

- Added `src/lib/api/pagination.ts`:
  - `PaginationMeta`
  - `PaginatedResult<T>`
  - `normalizePagination(...)`
  - `createPaginatedResult(...)`

## API Files Updated

- `src/features/property-search/api/propertyService.ts`
  - `PropertySearchResult` -> `PaginatedResult<SearchResultListing>`
  - `ExclusivePropertiesResult` -> `PaginatedResult<HomeProperty>`
  - Normalized `/properties` and `/properties/exclusive` responses.

- `src/features/agent/dashboard/api/agentProperties.api.ts`
  - `AgentPropertyListData` and `AgentDraftSubmissionsListData` now return normalized pagination.
  - Preserved additive fields (`draft_submissions`, `draft_submissions_total`) on property list response.

- `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts`
  - `AdminSubmissionListResponse` and `AdminDraftSubmissionsListData` now return `PaginatedResult<...>`.

- `src/features/admin/api/adminAgentApiService.ts`
  - `ListAdminAgentsResult` now returns `PaginatedResult<AdminAgent>`.
  - Reused central pagination normalization from backend `pagination` object.

- `src/features/admin-users/api/userService.ts`
  - `ListUsersResult` now returns `PaginatedResult<UserManagementUser>`.
  - Preserved multi-shape parsing (`items/data/users/results/...`) and normalized output.

- `src/features/admin/dashboard/api/adminDashboard.api.ts`
  - `AdminPropertyPerformanceResult` now returns `PaginatedResult<PerformanceComparisonItem>`.

- `src/features/agent/dashboard/api/agentDashboard.api.ts`
  - `AgentPropertyPerformanceResult` now returns `PaginatedResult<PerformanceComparisonItem>`.
  - Keeps existing payload-shape compatibility while normalizing output.

## Components / State Consumers Updated

- `src/features/property-search/propertySearchSlice.ts`
- `src/features/exclusive-properties/exclusivePropertiesSlice.ts`
- `src/features/admin/adminAgentsSlice.ts`
- `src/features/admin-users/adminUsersSlice.ts`
- `src/features/agent/dashboard/agentDashboardSummarySlice.ts`
- `src/features/admin/dashboard/components/AdminViewRatePage.tsx`

Updated these to consume `result.pagination.*` instead of legacy top-level totals/page fields.

## Pagination Loops Removed

- `src/features/agent/dashboard/components/AgentListingsPage.tsx`
  - Removed full fetch loop across pages.
  - Now requests current `page` + `pageSize` from URL and uses API pagination.

- `src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx`
  - Removed full fetch loop across pages.
  - Now requests current `page` + `pageSize` from URL and uses API pagination.

## Backend Contract Confirmation

- No backend endpoint URL changes.
- No backend request payload contract changes.
- No auth/token flow changes.
- No API envelope behavior changes.
- Backend shape differences remain mapped inside API layer only.

## Validation Results

- `npm run build` -> **pass**
- `npm test` -> **pass** (21 suites, 56 tests)
- `npm run lint` -> **fails due to pre-existing repo-wide lint issues unrelated to this change set** (legacy `any`, `react-hooks/set-state-in-effect`, etc.)

## Remaining Risks

- `AgentListingsPage` and `AdminPropertySubmissionsPage` still apply some client-side filtering/sorting over the current server page; if full dataset filtering is required, backend query params should be extended in a follow-up.
- `userService` still supports many legacy response shapes; this is intentional for compatibility but increases parser complexity.
- Additional list APIs outside this task scope may still use non-normalized internal contracts.

## Missed / Remaining Standardization Gaps (Cross-Check Update)

After re-checking API and pagination consumers, these gaps remain if the goal is full app-wide response/pagination standardization:

- `src/features/favourites/api/favourites.api.ts`
  - `GET /favorites` still uses union parsing (`number[]` OR `{ items }`) and returns plain arrays (`number[]` / `FavoriteListItem[]`), not `PaginatedResult<T>`.

- `src/features/saved-searches/api/savedSearches.api.ts`
  - `GET /saved-searches` still uses union parsing (`SavedSearchApiItem[]` OR `{ items }`) and returns `SavedSearch[]` only.

- `src/features/recent-views/api/recentViews.api.ts`
  - `GET /users/recent-views` still uses union parsing and returns plain mapped array, no normalized pagination meta.

- `src/features/agent/dashboard/api/taxonomy.api.ts`
  - `GET /location-taxonomy` and `GET /property-taxonomy` parse `items | data` but return plain arrays.

- `src/features/admin/dashboard/components/legacy-pages/AdminUsersPage.tsx`
  - Builds pagination heuristics in component state (`hasNextPage`, inferred `totalPages`) instead of relying purely on API-normalized pagination meta from slice.

These are not regressions from this change; they are remaining endpoints/components outside the normalized set and should be targeted in the next pagination-response pass.
