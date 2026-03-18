# Property Details Frontend Refactor Guide

## 1. Current Implementation

The Property Details feature is implemented across:

- **Pages**: `src/app/[locale]/(main)/property-details/[id]/page.tsx`.
- **Components**:
  - Container: `src/components/property/property-details/PropertyDetailsMain.tsx`.
  - Sections: `PropertyDetailsHero.tsx`, `PropertyHighlights.tsx`, `PropertyOverview.tsx`, `PropertyAmenities.tsx`, `PropertyVirtualTour.tsx`, `PropertyNeighborhood.tsx`, `PropertyInsightsSidebar.tsx`.
- **State**:
  - `src/features/property-details/propertyDetailsSlice.ts` holds fetched details and status.
- **Services**:
  - Property details are fetched from a backend service (directly or via a shared property service).

The page:

- Fetches property details by ID.
- Derives display-friendly models (amenities, tabs, gallery, exclusive flags).
- Renders a tabbed layout that responds to scroll position and available sections.

## 2. Problems Identified

From the audit and plan:

- **Large multi-responsibility container**:
  - `PropertyDetailsMain` manages data fetching, tab configuration, scroll/IntersectionObserver logic, and multiple data transformations in a single file.
- **Derived data scattered in component**:
  - Amenities, gallery, and neighborhood calculations are implemented within the container component.
- **Performance concerns**:
  - Scroll/tabs synchronization might not be throttled or memoized, risk of unnecessary re-renders.
- **Error/loading handling duplication**:
  - Loading/error/not-found states may be handled ad hoc instead of via shared patterns.

## 3. Refactor Objectives

- Move data fetching and derived-state logic into **feature hooks and utilities**.
- Keep the container component focused on wiring sections together and orchestrating layout.
- Standardize handling of loading, error, and not-found states.
- Preserve all fields and sections shown to the user while improving readability and testability.

## 4. Proposed Folder Structure

```text
src/
  features/
    property-details/
      api/
        propertyDetails.api.ts
      store/
        propertyDetailsSlice.ts
      hooks/
        usePropertyDetails.ts
        usePropertyDetailsTabs.ts
        usePropertyAmenities.ts
      components/
        PropertyDetailsPage.tsx
        PropertyDetailsHero.tsx
        PropertyHighlights.tsx
        PropertyOverview.tsx
        PropertyAmenities.tsx
        PropertyVirtualTour.tsx
        PropertyNeighborhood.tsx
        PropertyInsightsSidebar.tsx
      utils/
        amenitiesMapper.ts
        galleryMapper.ts
        neighborhoodMapper.ts
      types.ts
```

Benefits:

- Clear separation between:
  - Data fetching (`api`, `usePropertyDetails`).
  - Derived data (`utils`/hooks).
  - Presentation (`components`).
- Scroll/tabs management becomes easier to reason about and unit test.

## 5. What Will Change

| Area       | Current                                                         | After Refactor                                                        |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Components | `PropertyDetailsMain` does everything                           | `PropertyDetailsPage` delegates to hooks and section components       |
| API Calls  | Called from container or services                               | Centralized in `propertyDetails.api.ts` and invoked via hooks         |
| State      | Slice + manual mapping inside component                         | Slice + typed utilities for mapping (amenities, gallery, neighborhood)|
| Hooks      | Minimal, logic embedded in components                           | Dedicated hooks for data, tabs, and amenities                         |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Completed (Steps 1–6)** with **no intended behavior/UI changes**.

### Step 1 — API module (completed)

- **Added** `src/features/property-details/api/propertyDetails.api.ts`
  - Thin wrapper around `src/services/propertyService.ts/fetchPropertyDetailsById` (same endpoint, params, response).
- **Updated** `src/features/property-details/propertyDetailsSlice.ts` to import `fetchPropertyDetailsById` and `PropertyDetailsApiResponse` from the feature API module.

### Step 2 — Derived data utilities (completed)

Moved inline mapping/derivation from `src/components/property/property-details/PropertyDetailsMain.tsx` into feature utils:

- **Added** `src/features/property-details/utils/amenitiesMapper.ts`
- **Added** `src/features/property-details/utils/galleryMapper.ts`
- **Added** `src/features/property-details/utils/neighborhoodMapper.ts`
- **Added** `src/features/property-details/utils/statsMapper.ts`
- **Added** `src/features/property-details/utils/propertyDetailsMapper.ts`

`PropertyDetailsMain` now consumes these utilities but keeps the **same output/markup order**.

### Step 3 — Feature hooks (completed)

- **Added** `src/features/property-details/hooks/usePropertyDetails.ts`
  - Encapsulates id parsing + thunk dispatch + loading/error/item selection.
- **Added** `src/features/property-details/hooks/usePropertyDetailsTabs.ts`
  - Encapsulates tab state + scrollIntoView + IntersectionObserver sync (same behavior).
- **Updated** `src/components/property/property-details/PropertyDetailsMain.tsx` to use the hooks.

### Step 4/5 — Page orchestration + wrapper components (completed)

- **Added** `src/features/property-details/components/PropertyDetailsPage.tsx` (thin orchestrator)
- **Updated** route page `src/app/[locale]/(main)/property-details/[id]/page.tsx` to render `PropertyDetailsPage`
- **Added** thin feature re-export wrappers under `src/features/property-details/components/*` for structure alignment (no prop/behavior changes).

### Step 6 — Tests & quality gates (completed)

- **Added tests**:
  - `src/__tests__/propertyDetails.mappers.test.ts`
  - `src/__tests__/usePropertyDetails.test.ts`
  - `src/__tests__/usePropertyDetailsTabs.test.ts`
- **Updated** `jest.config.js` coverage scope to include Phase 5 core modules.
- **Verified**:
  - `npm test` ✅
  - `npm run test:coverage` ✅

### Step 1 — Extract Property Details API Module

- Create `src/features/property-details/api/propertyDetails.api.ts`:
  - Wrap all existing property-details HTTP calls without changing endpoints or payloads.
  - Expose `fetchPropertyDetailsById(id)` and any related helper functions.
- Update the slice or thunk to call into this module, leaving component calls untouched for now.

### Step 2 — Move Derived Data Logic Into Utilities

- Create `amenitiesMapper.ts`, `galleryMapper.ts`, and `neighborhoodMapper.ts`:
  - Extract the logic that:
    - Consolidates amenities from multiple fields and deduplicates them.
    - Builds gallery entries (main image, additional images/videos).
    - Composes neighborhood information from coordinates and metadata.
- Replace inline calculations in `PropertyDetailsMain` with calls into these utilities.

### Step 3 — Introduce Feature Hooks

- Implement `usePropertyDetails(id)`:
  - Encapsulate fetching state from the slice or API module (loading, error, data).
  - Provide derived fields (highlights, exclusive flags) through memoized selectors.
- Implement `usePropertyDetailsTabs(sections)`:
  - Handle scroll/tabs synchronization and active tab state.
  - Use throttling/debouncing for scroll events as needed.
- Refactor `PropertyDetailsMain` to rely on these hooks, reducing its internal logic.

### Step 4 — Standardize Loading/Error/Not-Found Handling

- Introduce shared route-level handling:
  - Use Next.js `loading.tsx`, `error.tsx`, and `not-found.tsx` as appropriate for this route group.
- Within the feature:
  - Use a shared pattern (or shared small components) for “loading”, “error”, and “not found” UI.
  - Keep text and visuals identical to current behavior.

### Step 5 — Optional Component Splits

- Consider renaming `PropertyDetailsMain` to `PropertyDetailsPage` and:
  - Keep it as a thin orchestrator that renders:
    - `PropertyDetailsHero`
    - `PropertyHighlights`
    - `PropertyOverview`
    - `PropertyAmenities`
    - `PropertyVirtualTour`
    - `PropertyNeighborhood`
    - `PropertyInsightsSidebar`
- No changes to props or section order; only internal wiring changes.

### Step 6 — Tests & Quality Gates

- Add tests for:
  - `amenitiesMapper`, `galleryMapper`, `neighborhoodMapper`.
  - `usePropertyDetails` (loading, success, error).
  - `usePropertyDetailsTabs` interaction with section IDs.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit` after changes.

## 7. API Safety Rules

- Property details endpoint(s) must remain unchanged:
  - Same URL structure, parameters, and response shape.
- Any mapping from API to UI stays conceptually the same; it is only moved into shared utilities.
- Avoid adding new requests or changing the timing of existing ones.

## 8. UI Behavior Safety Rules

- Preserve:
  - All existing sections and their order.
  - Tab labels, behavior, and scroll-sync interactions.
  - Exclusive property enhancements and neighborhood section rules.
  - Virtual tour visibility rules based on backend data.
- Ensure that partial data (e.g., missing amenities or neighborhood) still behaves as before.

## 9. Testing Checklist

- Property details page:
  - Renders for valid IDs and shows all expected sections.
  - Handles invalid IDs with the same not-found/error behavior.
  - Tabs correctly follow scrolling and clicking.
- Exclusive properties:
  - Still show enhanced badges, video, and neighborhood as before.
- Virtual tour:
  - Appears only when data is present and functions as expected.

## 10. Dependencies With Other Modules

- **Property Search & Results module**:
  - Links from result cards to details pages; the refactor must keep route paths and link patterns intact.
- **Favourites & Comparison module**:
  - May deep-link into details pages via property IDs.
- **Admin Property Management module**:
  - Admin detail views may reuse mapping logic or patterns introduced here; utilities should be designed for reuse where appropriate.`

