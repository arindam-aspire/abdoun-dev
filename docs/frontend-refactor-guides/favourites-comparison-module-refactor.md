# Favourites & Comparison Frontend Refactor Guide

## 1. Current Implementation

The Favourites & Comparison feature is implemented across:

- **Pages**: `src/app/[locale]/(main)/favourites/page.tsx`, `src/app/[locale]/(main)/compare/page.tsx`.
- **Components**:
  - Favourites list view using shared property cards from the search feature.
  - `src/components/compare/CompareModal.tsx` for side-by-side comparison.
- **State**:
  - `src/features/favourites/favouritesSlice.ts` stores favourite property IDs per user.
  - `src/features/compare/compareSlice.ts` tracks which properties are selected for comparison.
- **Data**:
  - Property details for favourites and comparison are resolved from shared mock search results or existing property data.

Users:

- Toggle favourites from property cards.
- Open the favourites page to see their saved properties.
- Enter compare mode, select properties, and open a comparison view.

## 2. Problems Identified

From the audit and plan:

- **Local-only persistence**:
  - Favourites and compare data live only in client state; this is expected for now but should be clearly documented.
- **Code duplication**:
  - Property card and list logic is reused manually from search results, which can lead to style and behavior divergence if not managed carefully.
- **Component responsibility**:
  - Favourites page combines list rendering, comparison selection, and empty state messaging in a single file.

## 3. Refactor Objectives

- Ensure favourites and comparison views reuse **shared property card and list components** from the search feature.
- Clarify the **state model and lifetime** for favourites and comparison (per-user session, not persisted to backend).
- Keep the UI consistent with search results while simplifying the implementation.

## 4. Proposed Folder Structure

```text
src/
  features/
    favourites/
      store/
        favouritesSlice.ts
      hooks/
        useFavourites.ts
      components/
        FavouritesPage.tsx
        FavouritesList.tsx
    compare/
      store/
        compareSlice.ts
      hooks/
        useCompareSelection.ts
      components/
        ComparePage.tsx
        CompareModal.tsx
```

Benefits:

- Clear boundaries between favourites and compare concerns.
- Reusable hooks encapsulate selection and list behavior.
- Components remain small and focused, improving readability.

## 5. What Will Change

| Area       | Current                                              | After Refactor                                                    |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Components | Pages mix listing, selection, and empty states       | Separate `FavouritesPage`, `FavouritesList`, and compare components |
| State      | Slices used directly from pages and cards            | Feature hooks mediate interaction with slices                     |
| UI reuse   | Shared card logic imported ad hoc                    | Centralized property card/list components reused consistently     |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Completed (Steps 1–5)** with **no intended UI/behavior changes**.

### Step 1 — Feature hooks (completed)

- **Added** `src/features/favourites/hooks/useFavourites.ts`
- **Added** `src/features/compare/hooks/useCompareSelection.ts`
- **Updated** `src/components/favourites/FavouriteButton.tsx` to use `useFavourites()` (same auth gating + toggle behavior)
- **Updated** `src/app/[locale]/(main)/favourites/page.tsx` to use `useFavourites()` + `useCompareSelection()`

### Step 2 — Extract `FavouritesList` (completed)

- **Added** `src/features/favourites/components/FavouritesList.tsx`
- **Moved** list/compare-checkbox markup out of `favourites/page.tsx` into `FavouritesList` (same card component, same disabled rules, same labels)

### Step 3 — Stabilize compare flow (completed)

- **Added** `src/features/compare/utils/compareIds.ts` (`parseCompareIds`)
- **Updated** `src/app/[locale]/(main)/compare/page.tsx`:
  - uses `parseCompareIds(searchParams.get("ids"))`
  - synchronizes Redux compare selection **only when `ids` are present** in the URL

### Step 4 — Shared card reuse (completed)

- Standardized on `SearchResultPropertyCard` for favourites + compare (no favourite-specific card variant introduced).

### Step 5 — Tests & quality gates (completed)

- **Added tests**:
  - `src/__tests__/useFavourites.test.ts`
  - `src/__tests__/useCompareSelection.test.ts`
  - `src/__tests__/compareIds.test.ts`
- **Updated** `jest.config.js` coverage scope to include Phase 6 core modules.
- **Verified**:
  - `npm test` ✅
  - `npm run test:coverage` ✅

### Step 1 — Introduce Feature Hooks

- Add `useFavourites()`:
  - Wraps `favouritesSlice` selectors and actions.
  - Provides methods like `isFavourite(id)`, `toggleFavourite(id)`, and `clearFavourites()`.
- Add `useCompareSelection()`:
  - Wraps `compareSlice` selectors and actions.
  - Provides `selectedIds`, `toggleSelected(id)`, `canCompare`, `maxSelectable`.
- Refactor the pages to use these hooks while keeping the same Redux slices underneath.

### Step 2 — Extract FavouritesList Component

- Move list-related markup into `FavouritesList.tsx`:
  - Accepts `items` and actions via props.
  - Renders cards using the same property card components as the search results feature.
- Keep the same pagination behavior and empty state text.

### Step 3 — Stabilize Compare Flow

- Ensure the compare page:
  - Continues to parse `ids` from the querystring exactly as before.
  - Uses `useCompareSelection()` to synchronize selection with Redux.
  - Renders the comparison using shared card components and consistent styling.

### Step 4 — Shared Card & Layout Components

- Introduce or reuse shared property card and list layout components under the property-search feature or a shared UI folder.
- Replace any custom favourite-specific card markup with these shared components, keeping props and visuals the same.

### Step 5 — Tests & Quality Gates

- Add unit tests for:
  - `useFavourites` and `useCompareSelection` core behaviors.
  - Query parameter parsing for the compare page.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Favourites and comparison are currently client-side only:
  - No external API calls are introduced.
  - Do not add new endpoints or change existing property APIs.
- Any future persistence must wrap existing backend contracts; for now, treat this as a pure frontend concern.

## 8. UI Behavior Safety Rules

- Preserve:
  - Favourites toggling from all property cards.
  - The favourites page layout, pagination, and empty states.
  - The ability to select up to four properties for comparison.
  - The behavior when fewer than two properties are selected.

## 9. Testing Checklist

- Property cards:
  - Toggling favourites updates UI and state correctly.
- Favourites page:
  - Shows the same properties as before for a given user session.
  - Empty state appears under the same conditions.
- Compare page:
  - Accepts `ids` via URL and renders comparison correctly.
  - Back/close actions still navigate as before.

## 10. Dependencies With Other Modules

- **Property Search & Results module**:
  - Supplies the property cards and IDs used by favourites and comparison.
- **Authentication & Access module**:
  - Restricts access to favourites and compare features to authenticated users; any auth refactor must keep these entry points working.`

