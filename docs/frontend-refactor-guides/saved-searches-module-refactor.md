# Saved Searches Frontend Refactor Guide

## 1. Current Implementation

The Saved Searches feature is implemented across:

- **Page**: `src/app/[locale]/(main)/saved-searches/page.tsx`.
- **Components**:
  - `src/components/search-result/SaveSearchModal.tsx` for capturing search names.
  - Saved search list UI on the saved-searches page (inline or in dedicated components).
- **State**:
  - `src/features/savedSearches/savedSearchesSlice.ts` stores saved search entries with:
    - A generated ID.
    - Name.
    - Querystring.
    - Created-at timestamp.

Users:

- Save the current search from the search-result page.
- Visit the saved searches page to view, run, rename, or delete saved searches.

## 2. Problems Identified

From the audit and plan:

- **State shape duplicated**:
  - The shape of saved search entries is implicit in the slice and not standardized in a shared type.
- **Querystring handling**:
  - Saved searches store the full querystring, and running them replicates logic that exists in the search feature.
- **UI and error handling**:
  - Empty and error states could be more standardized and reuse shared components across list features.

## 3. Refactor Objectives

- Introduce a clear **SavedSearch** type to represent saved searches consistently.
- Centralize querystring building and parsing so saved searches and property search stay in sync.
- Align the saved searches UI and UX with the patterns used in favourites and other list features.

## 4. Proposed Folder Structure

```text
src/
  features/
    saved-searches/
      store/
        savedSearchesSlice.ts
      hooks/
        useSavedSearches.ts
      components/
        SavedSearchesPage.tsx
        SavedSearchList.tsx
        SaveSearchModal.tsx
      types.ts
```

Benefits:

- All saved-search-related code is discoverable in one place.
- Hooks encapsulate behavior; pages and modals become thin presenters.
- Querystring and routing integration can be shared with the property-search feature.

## 5. What Will Change

| Area       | Current                                         | After Refactor                                         |
| ---------- | ----------------------------------------------- | ------------------------------------------------------ |
| Types      | Implicit saved search shape in slice            | Explicit `SavedSearch` type in `types.ts`              |
| State      | Slice used directly from components             | Access via `useSavedSearches` hook                     |
| Routing    | Direct navigation using local URL-building code | Shared querystring builder reused from property search |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Completed (Steps 1–5)** with **no intended UI/behavior changes**.

### Step 1 — Define `SavedSearch` type (completed)

- **Added** `src/features/saved-searches/types.ts` (`SavedSearch`)
- **Updated** `src/features/savedSearches/savedSearchesSlice.ts` to use the shared type via `export type SavedSearchItem = SavedSearch` (no runtime change).

### Step 2 — `useSavedSearches` hook (completed)

- **Added** `src/features/saved-searches/hooks/useSavedSearches.ts`
- **Updated** `src/components/search-result/SaveSearchModal.tsx` to call the hook’s `add()` operation instead of dispatching the slice directly.

### Step 3 — Shared querystring behavior (completed)

- Saved searches continue to store the **raw querystring** (no leading `?`) and “Run” continues to navigate to:
  - `/${locale}/search-result?${queryString}`
- URL formatting is centralized in `useSavedSearches.runUrl()` (output unchanged).

### Step 4 — Standardize list UI (completed)

- **Added** `src/features/saved-searches/components/SavedSearchList.tsx` (extracted list markup + actions)
- **Added** `src/features/saved-searches/components/SavedSearchesPage.tsx` (thin page composition)
- **Updated** `src/app/[locale]/(main)/saved-searches/page.tsx` to render the feature page component.

### Step 5 — Tests & quality gates (completed)

- **Added tests**:
  - `src/__tests__/useSavedSearches.test.ts`
- **Updated** `jest.config.js` coverage scope to include Phase 7 core modules.
- **Verified**:
  - `npm test` ✅
  - `npm run test:coverage` ✅

### Step 1 — Define SavedSearch Type

- Create `src/features/saved-searches/types.ts`:
  - Export a `SavedSearch` interface with `id`, `name`, `queryString`, `createdAt`.
- Update `savedSearchesSlice.ts` to import and use this type without changing runtime behavior.

### Step 2 — Introduce useSavedSearches Hook

- Add `useSavedSearches.ts`:
  - Wraps selectors and actions from the slice.
  - Provides operations:
    - `addSavedSearch(savedSearchPayload)`.
    - `removeSavedSearch(id)`.
    - `renameSavedSearch(id, newName)`.
    - `runSavedSearch(savedSearch)` (returns URL path and querystring).
- Refactor the saved-searches page and `SaveSearchModal` to use this hook.

### Step 3 — Share Querystring Logic with Property Search

- Use the shared querystring builder from the property-search feature:
  - When saving a search, call into the same utility to get the canonical querystring.
  - When running a saved search, navigate to `/[locale]/search-result` with the stored querystring unchanged.

### Step 4 — Standardize List UI

- Extract the saved search list into `SavedSearchList.tsx`:
  - Handles rendering names, created-at dates, and actions (run, rename, delete).
  - Uses shared list/empty/error UI patterns used by favourites and other lists.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `useSavedSearches` behaviors.
  - Interaction between saving and running searches.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Saved searches are purely a frontend concern:
  - No backend API calls are introduced by this feature.
  - Do not change or add endpoints when refactoring.

## 8. UI Behavior Safety Rules

- Preserve:
  - How names are captured and validated in `SaveSearchModal`.
  - The exact querystring stored for a given set of filters.
  - How saved searches are ordered and displayed.
  - The behavior of run, rename, and delete actions.

## 9. Testing Checklist

- From the search-result page:
  - Saving a search produces the same querystring as before.
- On the saved-searches page:
  - All saved searches render as before.
  - Running a saved search navigates to the same URL as before.
  - Rename and delete actions behave identically, including confirm prompts.

## 10. Dependencies With Other Modules

- **Property Search & Results module**:
  - Provides the filter state and URL structure that saved searches snapshot.
- **Authentication & Access module**:
  - Restricts saved searches to authenticated users; any auth refactor must maintain this relationship.`

