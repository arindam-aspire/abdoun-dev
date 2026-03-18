# Admin Property Management Frontend Refactor Guide

## 1. Current Implementation

The Admin Property Management feature is implemented across:

- **Pages**:
  - `src/app/[locale]/(admin)/properties/page.tsx`.
  - `src/app/[locale]/(admin)/properties/[id]/page.tsx`.
- **Components**:
  - `src/components/admin/properties/AdminSearchResultMain.tsx`.
  - `AdminSearchResults.tsx`, `AdminSearchResultListCard.tsx`.
  - `property-details/AdminPropertyDetailsMain.tsx`, `AdminPropertyDetailsTabBar.tsx`.

Admins:

- Search properties with admin-specific filters.
- View results in a dedicated admin search layout.
- Open an admin-specific details view with tabs for moderation or operational management.

## 2. Problems Identified

From the audit and plan:

- **Duplication with public search/details**:
  - Admin search and detail views repeat patterns from public features but with admin-specific fields.
- **API organization**:
  - Admin property API calls may live in services or components without a dedicated feature API module.
- **Pagination and performance**:
  - Admin search must scale to large datasets; patterns should align with performance guidelines.

## 3. Refactor Objectives

- Introduce an **admin-properties feature API module** and types.
- Reuse public search and property details utilities where appropriate.
- Ensure admin-specific behavior (e.g., moderation panels) is layered cleanly above shared logic.

## 4. Proposed Folder Structure

```text
src/
  features/
    admin-properties/
      api/
        adminProperties.api.ts
      hooks/
        useAdminPropertySearch.ts
        useAdminPropertyDetails.ts
      components/
        AdminPropertySearchPage.tsx
        AdminPropertyResults.tsx
        AdminPropertyDetailsPage.tsx
      types.ts
```

Benefits:

- Admin property concerns become first-class and testable.
- Code sharing with public property features is deliberate and explicit.

## 5. What Will Change

| Area       | Current                                           | After Refactor                                                |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------- |
| API Calls  | Hidden in services or ad-hoc code                 | Centralized `adminProperties.api.ts`                          |
| Components | Mix layout, queries, and UI in large components   | Thin pages + feature components + hooks                       |
| Reuse      | Implicit reuse of public search/details logic     | Explicit sharing of mappers and UI primitives where suitable  |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Create adminProperties.api.ts

- Extract all admin property search and detail HTTP calls into `adminProperties.api.ts`.
- Ensure:
  - URLs, methods, params, and responses remain the same.
  - Any mapping from backend structures to UI models is moved into this module or shared utilities.

### Step 2 — Introduce Hooks for Search and Details

- `useAdminPropertySearch`:
  - Manages filters, pagination, loading, and error states for admin search.
- `useAdminPropertyDetails`:
  - Fetches and manages state for admin detail views, including any moderation metadata.
- Refactor components to call these hooks while preserving UI and behavior.

### Step 3 — Reuse Public Utilities

- Where appropriate:
  - Reuse `queryStringBuilder` logic from the public search (if admins share similar URLs).
  - Reuse property details mapping utilities for base information; layer admin-specific data on top.

### Step 4 — Standardize List and Detail UI

- Use shared list and detail UI primitives (e.g., tables, cards, tab bars) to align look and feel with the rest of the app.
- Maintain admin-specific styling where it already exists, only refactoring underlying code structure.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `useAdminPropertySearch` (filters, pagination, error paths).
  - `useAdminPropertyDetails` (loading and display logic).
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Keep all admin property endpoints and payloads unchanged.
- Do not modify:
  - Filter parameters.
  - Sorting or pagination semantics.
  - Response data structure expected by moderation and detail views.

## 8. UI Behavior Safety Rules

- Preserve:
  - Admin search filters and their default values.
  - The appearance and structure of search results.
  - The fields and tabs shown on the admin property detail page.

## 9. Testing Checklist

- Admin property search:
  - Filters and pagination behave exactly as before.
- Admin property detail:
  - Displays the same data and tabs for a given property as before refactor.

## 10. Dependencies With Other Modules

- **Admin Dashboard module**:
  - Uses moderation metrics that link into admin property search and detail pages.
- **Agent Property Creation & Onboarding module**:
  - Properties created by agents flow into admin views; field alignment and mapping must stay consistent.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

