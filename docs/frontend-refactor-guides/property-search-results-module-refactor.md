# Property Search & Results Frontend Refactor Guide

## 1. Current Implementation

The Property Search & Results feature is implemented across:

- **Pages**: `src/app/[locale]/(main)/search-result/page.tsx`.
- **Components**:
  - Filter and search UI: `src/components/search-result/SearchFields.tsx`.
  - Results list/grid: `SearchResults.tsx`, `SearchResultPropertyCard.tsx`, `SearchResultListCard.tsx`.
  - Controls: `SearchResultSortDropdown.tsx`, `SearchResultViewToggle.tsx`.
  - Modals: `SaveSearchModal.tsx`, `ContactPropertyModal.tsx`.
- **State**:
  - `src/features/property-search/propertySearchSlice.ts` holds filter state and metadata.
  - `src/features/savedSearches/savedSearchesSlice.ts` for saved searches.
- **Services & data**:
  - `src/services/propertyService.ts` handles external API calls for property search.
  - Mock data (`mockSearchResults.ts`, `jordanCities.ts`) supports demo flows.

The search page:

- Reads filter state from the Redux slice and URL query parameters.
- Builds search requests via `propertyService` and renders results in grid or list view.
- Offers sorting, pagination, and the ability to save a search.

## 2. Problems Identified

From the audit and refactor plan:

- **Data access spread**:
  - Property search logic is concentrated in `propertyService.ts`, but components and slices may construct query parameters themselves, risking duplication.
- **Component size and responsibility**:
  - `SearchResults` and `SearchFields` likely contain both UI and business logic (filter/query building, mapping API responses to UI models).
- **State and behavior coupling**:
  - Saved search and search filters may implement querystring handling in slightly different places.
- **Error/empty/loading handling**:
  - Patterns may not be standardized across list views and could duplicate markup and messages.

## 3. Refactor Objectives

- Centralize **search query construction and API calls** in a dedicated feature API module.
- Split large components into smaller, role-specific components and hooks.
- Ensure filtering, sorting, pagination, empty states, and errors follow consistent patterns.
- Improve testability and maintainability without changing any endpoints or query semantics.

## 4. Proposed Folder Structure

```text
src/
  features/
    property-search/
      api/
        propertySearch.api.ts
      store/
        propertySearchSlice.ts
      hooks/
        usePropertySearch.ts
        useSearchFilters.ts
      components/
        SearchResultPage.tsx
        SearchFilters/
          SearchFields.tsx
          SearchAdvancedFilters.tsx
        SearchResults/
          SearchResults.tsx
          PropertyGrid.tsx
          PropertyList.tsx
          SearchResultPropertyCard.tsx
          SearchResultListCard.tsx
        SaveSearch/
          SaveSearchModal.tsx
        ContactProperty/
          ContactPropertyModal.tsx
      types.ts
      utils/
        queryStringBuilder.ts
        mapping.ts
```

Benefits:

- All property search logic (filters, query building, results mapping) is easy to find under a single feature directory.
- Components stay focused on rendering; hooks handle data fetching and coordination with Redux.
- Saved search logic can reuse the same querystring builder to avoid divergence.

## 5. What Will Change

| Area       | Current                                                | After Refactor                                                     |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Components | `SearchFields`/`SearchResults` mix UI and logic        | Thin UI components backed by dedicated hooks and utilities         |
| API Calls  | `propertyService.ts` called directly from components   | `propertySearch.api.ts` used by hooks or thunks                    |
| State      | Filters and saved searches partly share URL handling   | Shared querystring builder reused across search and saved searches |
| Hooks      | Minimal or ad-hoc                                      | Reusable `usePropertySearch` and `useSearchFilters` hooks          |

## 6. Step-by-Step Safe Refactor Plan

### Step 1 — Extract Property Search API Module

- Create `src/features/property-search/api/propertySearch.api.ts`:
  - Wrap all existing calls from `propertyService.ts` without changing URLs, params, or response mapping.
  - Export functions like `searchProperties(filters, pagination)`, which internally call the same endpoints.
- Update `propertyService.ts` to call into this new module, leaving current imports untouched initially.

### Step 2 — Introduce Querystring Builder Utility

- Add `queryStringBuilder.ts` to:
  - Take the current filter state and produce the exact same querystring used now.
  - Parse querystring back into filter state for initial page load.
- Update:
  - `search-result/page.tsx` and any saved search runners to use this shared builder, preserving URL formats.

### Step 3 — Create Custom Hooks

- Implement `useSearchFilters`:
  - Encapsulate reading/writing of `propertySearchSlice` and synchronization with the URL.
  - Provide event handlers for filter changes and resets.
- Implement `usePropertySearch`:
  - Encapsulate calling `propertySearch.api.ts`, managing loading/error states.
  - Expose `results`, `total`, `page`, `pageSize`, `sort`, and `refetch`.
- Refactor `SearchFields` and `SearchResults` to use these hooks instead of directly manipulating Redux and services.

### Step 4 — Split Large Components

- Break `SearchResults.tsx` into:
  - `PropertyGrid` and `PropertyList` subcomponents.
  - `ResultsToolbar` for sort and view toggle controls.
- Keep props and visual output unchanged; only redistribute implementation into smaller files.

### Step 5 — Standardize Loading, Empty, and Error States

- Introduce shared components (e.g., `ListLoading`, `ListEmpty`, `ListError`) in `src/components/ui/list/`.
- Replace inline loading/empty/error markup in search-result components with these shared components, matching current copy and behavior.

### Step 6 — Tests & Quality Gates

- Add tests for:
  - `queryStringBuilder` to confirm it produces and parses the same strings as today.
  - `usePropertySearch` to ensure correct handling of loading, error, and pagination.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit` after each batch.

## 7. API Safety Rules

- Keep all search endpoints identical (URLs, HTTP methods, parameters, response structures).
- Do not change:
  - Filter parameter names.
  - Sorting parameters.
  - Pagination semantics.
- `propertySearch.api.ts` must delegate to the same underlying Axios client calls as `propertyService.ts`.

## 8. UI Behavior Safety Rules

- Preserve:
  - Layout of the search page, filters, and results.
  - Default sort mode and page size.
  - How filters map to URLs and back.
  - Save search behavior (what gets stored in a saved search and how it is run).
  - Contact modal appearance and content.

## 9. Testing Checklist

- Search page:
  - Loads and displays initial results as before.
  - Filters, sorts, and pagination all work identically.
  - URL reflects filters and can be shared/bookmarked.
- Saved search:
  - Saving a search captures identical querystrings.
  - Running a saved search loads the same results as before.
- Contact modal:
  - Opens from property cards and displays the same reference and phone.

## 10. Dependencies With Other Modules

- **Property Details module**:
  - Consumes the property IDs from search results to link to details pages.
- **Saved Searches module**:
  - Depends on the same querystring format produced by the search feature.
- **Favourites & Comparison module**:
  - Uses the same property IDs and card components as search results; the refactor must maintain these props and event handlers.`

---

## Refactor progress notes (Phase 4 – incremental)

- **Done (Step 1)**: Added `src/features/property-search/api/propertySearch.api.ts` (`searchPropertiesByQuery`) wrapping `propertyService.fetchPropertiesByQuery` (same endpoint `/properties`, same querystring contract and response mapping). Updated `propertySearchSlice` thunk to use the feature API.
- **Done (Step 2)**: Added `src/features/property-search/utils/queryStringBuilder.ts` and updated `SearchResults` to use it. This preserves the exact request query behavior (removes `sort`/`view`, enforces `page`, defaults `pageSize`).
- **Done (Step 3)**: Added hooks `src/features/property-search/hooks/useSearchFilters.ts` (URL-derived filters + setters) and `src/features/property-search/hooks/usePropertySearch.ts` (dispatch search thunk when request query changes). Updated `SearchResults` to use these hooks.
- **Done (Step 4)**: Split `SearchResults` rendering into `SearchResultsToolbar`, `PropertyGrid`, `PropertyList` (no markup/behavior changes, only moved code).
- **Done (Step 5)**: Standardized empty/error rendering using shared UI blocks `src/components/ui/list/ListEmpty.tsx` and `src/components/ui/list/ListError.tsx` (same copy/classes).
- **Done**: Added feature-level wrappers under `src/features/property-search/components/*` so `src/app` pages can import from feature layer (structure aligned) without changing existing UI logic in `SearchFields`.
- **Checks**: New/changed files are lint-clean. `npx tsc --noEmit` still fails due to pre-existing `LocationPicker`/Google Maps typing issues (unrelated to this module).

