# Public Home & Marketing Pages Frontend Refactor Guide

## 1. Current Implementation

The Public Home & Marketing feature is implemented across:

- **Pages**: `src/app/[locale]/(main)/page.tsx`, `about/page.tsx`, `team/page.tsx`.
- **Components**:
  - `src/components/home/home-main.tsx`, `HeroSection.tsx`, `FeaturedPropertiesSection.tsx`, `AboutUsSection.tsx`.
  - `src/components/about/AboutMain.tsx`.
  - `src/components/team/TeamMain.tsx`.
- **State & data**:
  - `src/features/exclusive-properties/exclusivePropertiesSlice.ts` loads and caches exclusive listings for the home page.
  - Localized text content is provided via translation files wired through `next-intl`.

The home page:

- Provides a hero search entry point into the property search feature.
- Highlights exclusive properties.
- Introduces Abdoun Real Estate and links into About and Team pages.

## 2. Problems Identified

From the audit and plan:

- **Component responsibilities**:
  - Home page sections may mix layout with some data fetching or business logic.
- **UI consistency**:
  - Hero and featured sections should use shared UI primitives in line with the UI agent.
- **Performance**:
  - Exclusive properties should be fetched once and cached; repeated fetching or unnecessary re-renders should be avoided.

## 3. Refactor Objectives

- Centralize exclusive properties fetching in a feature API module with predictable caching.
- Ensure hero and marketing sections use shared layout and typography components.
- Keep pages themselves thin, delegating to feature components in `src/features/`.

## 4. Proposed Folder Structure

```text
src/
  features/
    public-home/
      components/
        HomePage.tsx
        HeroSection.tsx
        ExclusivePropertiesSection.tsx
        AboutPreviewSection.tsx
      hooks/
        useExclusiveProperties.ts
    exclusive-properties/
      api/
        exclusiveProperties.api.ts
      store/
        exclusivePropertiesSlice.ts
```

Benefits:

- Public-facing home logic resides in `src/features/public-home`.
- Exclusive properties have a consistent data layer and hooks.

## 5. What Will Change

| Area       | Current                                      | After Refactor                                         |
| ---------- | -------------------------------------------- | ------------------------------------------------------ |
| Pages      | Import feature components directly from `components/home` | Pages import from `features/public-home/components`    |
| API Calls  | Exclusive properties handled by slice/service | `exclusiveProperties.api.ts` + `useExclusiveProperties` |
| UI System  | Ad hoc layout                                | Shared layout primitives consistent with UI agent      |

## 6. Step-by-Step Safe Refactor Plan

### Step 1 — Introduce Exclusive Properties API Module

- Create `exclusiveProperties.api.ts`:
  - Wrap the existing fetch logic used by `exclusivePropertiesSlice`.
  - Keep endpoints and payloads identical.
- Update `exclusivePropertiesSlice` to call this module internally.

### Step 2 — Add useExclusiveProperties Hook

- Implement `useExclusiveProperties`:
  - Wrap selectors and dispatch for fetching exclusive listings.
  - Manage loading/error state for home-page sections.
- Refactor `FeaturedPropertiesSection` to use this hook.

### Step 3 — Thin Page Components

- Move home-page-specific layout into `HomePage.tsx` under `features/public-home/components`.
- Keep `page.tsx` as a thin wrapper that renders `HomePage`.

### Step 4 — Align UI With UI Agent

- Ensure hero and sections:
  - Use shared buttons, headings, and card components from `src/components/ui`.
  - Avoid hardcoded colors/sizes, use design tokens instead.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `useExclusiveProperties` behavior.
  - Rendering of hero and featured sections with mock data.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Exclusive property endpoints must remain unchanged.
- No new endpoints or changes to existing request/response structures.

## 8. UI Behavior Safety Rules

- Preserve:
  - Hero search behavior and integration with the property search feature.
  - Which properties show in the exclusive section and how they are presented.
  - The content and structure of About and Team pages.

## 9. Testing Checklist

- Home page:
  - Loads hero and exclusive sections identically to current implementation.
- About and Team pages:
  - Render the same localized content.

## 10. Dependencies With Other Modules

- **Property Search & Results module**:
  - Hero search uses search feature routing and filters.
- **Property Details module**:
  - Exclusive properties link into property details; routes must remain consistent.

---

## Refactor completion notes

- **Done**: Exclusive properties API module (`src/features/exclusive-properties/api/exclusiveProperties.api.ts`) wraps `fetchExclusiveProperties` from propertyService; same endpoint (GET /properties/exclusive) and payload. Slice thunk now calls `getExclusiveProperties()` from the API module.
- **Done**: `useExclusiveProperties` in `src/features/public-home/hooks/useExclusiveProperties.ts` wraps selectors and dispatch; fetches once when idle; returns items, loading, error, status.
- **Done**: `HomePage` in `src/features/public-home/components/HomePage.tsx` composes `HeroSection`, `ExclusivePropertiesSection`, `AboutPreviewSection` from `src/features/public-home/components/*` and uses `useExclusiveProperties`. `(main)/page.tsx` is a thin wrapper that renders `HomePage`.
- **Done (tests)**: Jest configured. Unit test added for `useExclusiveProperties` (dispatch on idle).
- **Done**: Added feature-level wrappers under `src/features/public-home/components/*` so pages/features can depend on feature components (structure aligned) without altering UI or moving underlying implementations.
- **Unchanged**: Exclusive property endpoint and response shape; hero search behavior and search-result links; which properties show and how; About/Team content and structure.

