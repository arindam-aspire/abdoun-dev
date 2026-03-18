## Abdoun Real Estate Platform – Feature Refactor Plan (Enterprise-Grade, Secure Stack)

This document describes how to incrementally refactor the existing Abdoun Real Estate Next.js application to align with the **Core Next.js Enterprise Rule** (`.cursor/rules/core/core.mdc`), canonical project structure, centralized API patterns, performance and scalability guidelines, and RBAC/security agents—**without changing current business behavior, API contracts, or visible UX flows**. It builds on the existing feature inventory captured in `docs/EXISTING_FEATURES.md` and focuses on structural, architectural, and quality improvements only.

---

## 1. Global Architecture & Project Structure

- **Goal**: Align folder layout and architecture with `project-structure.md` and `frontend-agent.mdc`, while preserving routes, behavior, and public contracts.

### 1.1 Target Structure

Gradually converge to the canonical structure referenced by **core.mdc Phase 3 (Architecture & Structure)** and `frontend-agent.mdc`:

- `src/app/`
  - Route groups `(public)/(main)/(auth)/(agent)/(admin)` under `[locale]` as already used.
  - Route-level `layout.tsx`, `page.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx` following Next.js App Router conventions.
- `src/features/`
  - One folder per domain feature, e.g.:
    - `auth/`, `profile/`
    - `property-search/`, `property-details/`, `favourites/`, `saved-searches/`, `compare/`
    - `agent-dashboard/`, `agent-properties/`, `agent-inquiries/`
    - `admin-dashboard/`, `admin-agents/`, `admin-properties/`
  - Each feature containing:
    - `components/` (feature-specific UI)
    - `api/` (feature-specific API wrappers)
    - `store/` or `slice.ts` (Redux/RTK Query definitions)
    - `hooks/` (feature-specific hooks)
    - `types.ts` (feature-local types when not globally shared)
- `src/lib/`
  - Cross-cutting utilities (date, formatting, mapping, cookies, storage, analytics).
  - Auth adapters (token stores, auth services) that are not route- or feature-specific.
  - HTTP client factory and interceptors (aligned with `api-agent.mdc`).
- `src/api/`
  - Shared API boundary types and low-level service clients where not feature-scoped.
  - Eventually deprecate ad-hoc `services/*.ts` in favor of `src/features/**/api/*.api.ts`.
- `src/store/`
  - Global Redux store configuration, middleware, and root reducers (per `state-agent.mdc`).
- `src/types/`
  - Cross-feature types, API contracts (e.g. `src/types/api.ts` as suggested by core Phase 1).
- `src/permissions/`
  - RBAC models and permission constants used by guards and components.
  - `PermissionGuard`, `RoleGuard`, and helper utilities (as per `rbac-permission-agent.mdc` and `routing-agent.mdc`).
- `src/components/ui/`
  - Shared UI primitives based on shadcn (`ui-agent.mdc`).
  - Layout primitives: `AppShell`, `PageHeader`, `DataTable`, `ThemeToggle`, etc.

### 1.2 Non-Breaking Migration Steps

- **Introduce path aliases**:
  - Update `tsconfig.json` to add `@features/*`, `@lib/*`, `@api/*`, `@store/*`, `@types/*`, `@permissions/*`, `@ui/*`.
  - Keep existing relative imports working; gradually migrate files to aliases when edited.
- **Incrementally move modules**:
  - For each feature area (see Section 4), move:
    - Redux slices into `src/features/<feature>/store/` (or keep a `slice.ts` root).
    - UI components into `src/features/<feature>/components/`.
    - Service files into `src/features/<feature>/api/*.api.ts`.
  - Re-export from legacy locations if needed to avoid breaking imports (e.g., simple passthrough `index.ts`).
- **Document backend contracts**:
  - Create or update `docs/backend-analysis.md` as required by **core.mdc Phase 1 (Backend Understanding)**, capturing:
    - Auth endpoints (login, refresh, logout, admin agents).
    - Property search, property details, dashboards.
    - Error formats, pagination patterns, and enums.
  - Use this doc when creating `src/types/api.ts` and feature-specific `types.ts`.

This work should be planned and executed in alignment with **frontend-agent.mdc** and the canonical structure described in `.cursor/rules/references/project-structure.md` (if present), making sure every change is import-compatible (no route or API surface changes).

---

## 2. Authentication & Access

- **Goal**: Consolidate auth model, token source, and access model in line with `rbac.md`, `security-agent.mdc`, and `rbac-permission-agent.mdc`, without changing observable login flows, redirects, or role-based UX.

### 2.1 Current Auth Model (from Code)

Based on `src/lib/auth/**`, `src/features/auth/authSlice.ts`, `middleware.ts`, and header/route guards:

- Auth is modeled as:
  - Redux auth slice with user and role.
  - Session cookies set in `sessionCookies.ts` (including role and user info).
  - Token storage in `localStorage` (`LocalStorageTokenStore`).
  - HTTP interceptors using tokens from the token store.
- Access control:
  - Middleware checks a role cookie to protect `/[locale]/dashboard` for admins.
  - Client-side `AgentRouteGuard` and `AdminRouteGuard` hydrate Redux from cookies when needed and redirect unauthenticated/unauthorized users.

### 2.2 Central Token & Session Handling Strategy

Refactor towards a single, composable auth/session module (per **core.mdc Phases 1, 4, 5** and `security-agent.mdc`):

- **Introduce `src/lib/auth/sessionManager.ts`**:
  - Export a narrow interface for:
    - `getCurrentSession(context)` – reads from cookies/headers and returns normalized `AuthSession` (user, roles, tokens).
    - `persistSession(session, context)` – writes cookies (or other storage) in one place.
    - `clearSession(context)` – clears tokens and cookies consistently.
  - Internally compose:
    - Cookie-level utilities currently in `sessionCookies.ts`.
    - Token store (`LocalStorageTokenStore`) for client-only flows.
  - Keep the external observable behavior identical (same cookies, redirects) initially, but centralize reads/writes.

- **Align with `rbac-permission-agent.mdc`**:
  - Define a small `src/permissions/model.ts` describing:
    - Roles: `public`, `authenticated`, `agent`, `admin`.
    - Permission constants for feature access (e.g. `canViewAgentDashboard`, `canManageAgents`).
  - Implement `derivePermissionsFromSession(session)` that maps current role string → permission set.

### 2.3 Route Protection Strategy

Refine route protection using **core.mdc Phase 11 (Routing & Access Control)** and `routing-agent.mdc`:

- **Middleware**:
  - Use `sessionManager` to interpret the incoming request.
  - Derive permissions from roles using `rbac-permission-agent.mdc` mapping functions.
  - Keep existing redirects and path checks, but route decisions should no longer read raw cookies directly—only normalized session state.

- **Layout Guards**:
  - Keep `AgentRouteGuard` and `AdminRouteGuard` as thin components that:
    - Read session from Redux slice or a `useSession()` hook.
    - Render children or a redirect/loader as they already do.
  - Internally, `useSession()` should rely on `sessionManager` and not duplicate token/cookie parsing code.

These steps keep login forms, inline AuthPopup flows, and existing redirects unchanged, while cleaning up duplication and centralizing the auth/access model as recommended by `security-agent.mdc` and `rbac-permission-agent.mdc`.

---

## 3. API Layer & Data Access

- **Goal**: Bring the API layer in line with `api-agent.mdc` and `api-patterns.md` without changing URLs, payload shapes, or response handling semantics visible to features.

### 3.1 Central HTTP Client & Interceptors

Per **core.mdc Phases 1 & 12** and `api-agent.mdc`:

- Keep the existing Axios client factory (`src/lib/http/createClient.ts` and `src/lib/http/index.ts`) as the base.
- Introduce:
  - `src/api/httpClient.ts` – exports:
    - `createBrowserClient()` – wraps the current browser client logic.
    - `createServerClient()` – placeholder for server-side usage (even if not yet used) with the same interceptors.
  - Define a shared `ApiError` shape:
    - Type in `src/types/api.ts` with fields like `code`, `message`, `details`, `raw`.
    - A helper `normalizeApiError(error: unknown): ApiError` used in interceptors and feature-level hooks.
- Interceptors should:
  - Preserve current refresh/logout behavior.
  - Convert lower-level Axios errors to `ApiError` before surfacing them to the rest of the app.

### 3.2 Feature API Modules

Gradually introduce feature-scoped API modules as wrappers over existing services:

- For each feature (Section 4), create `src/features/<feature>/api/*.api.ts` modules that:
  - Wrap calls currently in `src/services/*` or `src/lib/http/*`.
  - Use `httpClient` from `src/api/httpClient.ts`.
  - Expose functions and/or RTK Query endpoints (when adopted per `state-agent.mdc`).
  - Re-export existing service functions where necessary to keep imports stable during migration.

The intent is to route all network access through `api-agent.mdc`-style modules, but **without** altering endpoint URLs, query parameters, or response parsing logic already used by features.

---

## 4. Feature-by-Feature Refactor Plan

This section maps existing features (see `docs/EXISTING_FEATURES.md`) to concrete refactor steps required to comply with `.cursor/rules/core/core.mdc` and the relevant agents (`frontend-agent.mdc`, `api-agent.mdc`, `routing-agent.mdc`, `security-agent.mdc`, `rbac-permission-agent.mdc`, `state-agent.mdc`, `error-handling-agent.mdc`, `performance-agent.mdc`, `testing-agent.mdc`, `theme-agent.mdc`, `solid-agent.mdc`, etc.).

### 4.1 Authentication & Access

- **Files** (indicative):
  - Pages: `src/app/[locale]/(auth)/login/page.tsx`, `src/app/[locale]/(auth)/agent-login/page.tsx`, `src/app/[locale]/(auth)/agent-invite/*`.
  - Components: `src/components/auth/AuthPopup.tsx`, `src/components/layout/AppHeader.tsx`, `src/components/layout/AgentRouteGuard.tsx`, `src/components/layout/AdminRouteGuard.tsx`.
  - Lib/Services: `src/lib/auth/sessionCookies.ts`, `src/lib/auth/adapters/localStorageTokenStore.ts`, `src/lib/auth/adapters/restAuthService.ts`, `src/lib/http/index.ts`, `middleware.ts`.
  - Store: `src/features/auth/authSlice.ts`.
- **Refactor focus**:
  - **API usage**:
    - Move low-level auth calls from `restAuthService.ts` into `src/features/auth/api/auth.api.ts` (wrapping existing functions).
    - Keep function signatures and backend payloads identical; just centralize into a feature API module per `api-agent.mdc`.
  - **UI system alignment**:
    - Ensure `AuthPopup` and login page use shared UI primitives from `src/components/ui` (buttons, inputs, dialogs) as defined by `ui-agent.mdc`.
    - Keep form layout and validation behavior unchanged; only replace ad-hoc markup with standard components when edited.
  - **Performance**:
    - Confirm that auth forms debounce expensive operations (currently mostly single-submit flows, so minimal change; just avoid extra re-renders per `performance-agent.mdc`).
  - **RBAC / routing**:
    - Replace direct role-cookie reads in `middleware.ts` with normalized session from `sessionManager` (Section 2) without changing redirect conditions.
    - Introduce `PermissionGuard` and `RoleGuard` components in `src/permissions/` and adapt `AgentRouteGuard`/`AdminRouteGuard` to use them internally while preserving props and behavior (`routing-agent.mdc`, `rbac-permission-agent.mdc`).
  - **Error handling**:
    - Ensure auth components use standardized error mapping (e.g., `normalizeApiError`) and display toasts/messages in a consistent way (per `error-handling-agent.mdc`).
  - **State management**:
    - Keep `authSlice` as the source of truth for client state; gradually introduce RTK Query endpoints for auth where helpful (e.g., `login`, `refresh`), reusing existing thunks to avoid breaking call sites (`state-agent.mdc`).

### 4.2 Public Home & Marketing Pages

- **Files**:
  - Pages: `src/app/[locale]/(main)/page.tsx`, `src/app/[locale]/(main)/about/page.tsx`, `src/app/[locale]/(main)/team/page.tsx`.
  - Components: `src/components/home/home-main.tsx`, `src/components/home/HeroSection.tsx`, `src/components/home/FeaturedPropertiesSection.tsx`, `src/components/home/AboutUsSection.tsx`, `src/components/about/AboutMain.tsx`, `src/components/team/TeamMain.tsx`.
  - Store: `src/features/exclusive-properties/exclusivePropertiesSlice.ts`.
- **Refactor focus**:
  - **API usage**:
    - Introduce `src/features/exclusive-properties/api/exclusiveProperties.api.ts` to wrap fetching exclusive properties; keep Redux slice actions and selectors the same, just delegate to the new API module.
  - **UI system**:
    - Refactor hero, featured sections, and marketing blocks to use shared layout components (`PageHeader`, `Section`, shared cards) where it does not alter the UX (per `frontend-agent.mdc` and `ui-agent.mdc`).
  - **Performance**:
    - Ensure exclusive properties are fetched once and cached; validate selectors are memoized and avoid unnecessary re-renders in `home-main.tsx`.
  - **Theme & accessibility**:
    - Apply `theme-agent.mdc` guidelines: ensure semantic headings, focusable CTAs, and proper contrast using design tokens.

### 4.3 Property Search & Results

- **Files**:
  - Pages: `src/app/[locale]/(main)/search-result/page.tsx`.
  - Components: `src/components/search-result/SearchFields.tsx`, `src/components/search-result/SearchResults.tsx`, `src/components/search-result/SearchResultPropertyCard.tsx`, `src/components/search-result/SearchResultListCard.tsx`, `src/components/search-result/SearchResultSortDropdown.tsx`, `src/components/search-result/SearchResultViewToggle.tsx`, `src/components/search-result/SaveSearchModal.tsx`, `src/components/search-result/ContactPropertyModal.tsx`.
  - Store: `src/features/property-search/propertySearchSlice.ts`, `src/features/savedSearches/savedSearchesSlice.ts`.
  - Services: `src/services/propertyService.ts`, mock data files.
- **Refactor focus**:
  - **API usage**:
    - Create `src/features/property-search/api/propertySearch.api.ts` to host search-related functions currently in `propertyService.ts`.
    - Ensure querystring construction logic (status, city, area, filters) is centralized in this module for reuse across search and saved searches.
  - **UI system**:
    - Align filters, dropdowns, and list toggles with `ui-agent.mdc` using shared form controls and `DataTable`/list primitives while keeping UX and filter semantics identical.
  - **Performance**:
    - Implement debounced search/filter logic (if not already in place) per `performance-agent.mdc` to avoid firing too many network calls when sliders/inputs change.
    - Confirm pagination and sort operations are either server-side or efficiently cached; use memoized selectors to derive derived lists from Redux.
  - **Error handling**:
    - Adopt a standard empty/error state pattern (per `error-handling-agent.mdc`), using a shared component for “no results”, “loading”, and “error” states across search views.
  - **State management**:
    - Evaluate migrating search queries and results into RTK Query endpoints while keeping existing `propertySearchSlice` shape intact for now (non-breaking).

### 4.4 Property Details

- **Files**:
  - Pages: `src/app/[locale]/(main)/property-details/[id]/page.tsx`.
  - Components: `src/components/property/property-details/PropertyDetailsMain.tsx`, `PropertyDetailsHero.tsx`, `PropertyHighlights.tsx`, `PropertyOverview.tsx`, `PropertyAmenities.tsx`, `PropertyVirtualTour.tsx`, `PropertyNeighborhood.tsx`, `PropertyInsightsSidebar.tsx`.
  - Store: `src/features/property-details/propertyDetailsSlice.ts`.
- **Refactor focus**:
  - **API usage**:
    - Move property-details-specific fetch logic into `src/features/property-details/api/propertyDetails.api.ts` (wrapping any ad-hoc service calls).
  - **SOLID and UI structure**:
    - Split `PropertyDetailsMain.tsx` into smaller components/hooks where it does heavy data transformation (e.g., `usePropertyAmenities`, `usePropertyTabs`) per `solid-agent.mdc`, without impacting props or layout.
  - **Performance**:
    - Ensure intersection observers and scroll event handlers are throttled/debounced according to `performance-agent.mdc`.
    - Memoize computed derived data (amenities lists, gallery items) when inputs have not changed.
  - **Error & loading states**:
    - Standardize loading/error/not-found handling using reusable components aligned with `error-handling-agent.mdc` and Next.js `error.tsx` / `not-found.tsx` patterns.

### 4.5 Favourites & Comparison

- **Files**:
  - Pages: `src/app/[locale]/(main)/favourites/page.tsx`, `src/app/[locale]/(main)/compare/page.tsx`.
  - Components: `src/components/compare/CompareModal.tsx`, property cards reused from search.
  - Store: `src/features/favourites/favouritesSlice.ts`, `src/features/compare/compareSlice.ts`.
- **Refactor focus**:
  - **State model**:
    - Keep the current in-memory Redux implementation but document it clearly in `favouritesSlice` and `compareSlice` to align with `state-agent.mdc` (clarifying local-only persistence).
  - **UI system**:
    - Ensure favourites and compare views use shared property-card components and list layouts from a central UI system, deduplicating styling and logic.
  - **Performance**:
    - For compare views, ensure derived comparison rows are memoized and that only selected items trigger re-renders.
  - **Routing & permissions**:
    - Enforce authenticated access using shared guards or header-level checks consistent with `rbac-permission-agent.mdc` (without changing redirection targets).

### 4.6 Saved Searches

- **Files**:
  - Pages: `src/app/[locale]/(main)/saved-searches/page.tsx`.
  - Components: `SaveSearchModal.tsx`, saved-seach list components.
  - Store: `src/features/savedSearches/savedSearchesSlice.ts`.
- **Refactor focus**:
  - **State & persistence**:
    - Align saved search model (name, querystring, timestamps) with a shared `SavedSearch` type in `src/types/api.ts` or feature-local `types.ts`.
  - **UI & error handling**:
    - Use shared list/empty/error components per `frontend-agent.mdc` and `error-handling-agent.mdc` so saved searches look and behave consistently with favourites and other lists.
  - **Routing**:
    - Centralize querystring generation/loading into a utility module inside `src/features/property-search/` that saved searches reuse to avoid subtle divergence.

### 4.7 User Profile & Account

- **Files**:
  - Components: `src/components/profile/ProfileModal.tsx`, `ProfilePhoto.tsx`, `PersonalInformationTab.tsx`, `SignInSecurityTab.tsx`.
  - Store: `src/features/profile/profileSlice.ts`.
- **Refactor focus**:
  - **API usage**:
    - Introduce `src/features/profile/api/profile.api.ts` that wraps any update endpoints or mock services.
  - **SOLID and forms**:
    - Split out form schemas and validation into separate modules (`profileFormSchema.ts`) to satisfy `solid-agent.mdc` SRP guidance.
  - **Theme & accessibility**:
    - Ensure the modal follows `theme-agent.mdc` guidance (focus trapping, ARIA attributes, keyboard shortcuts).

### 4.8 Agent Dashboard & Analytics

- **Files**:
  - Pages: `src/app/[locale]/(agent)/agent-dashboard/page.tsx`, `trends/page.tsx`, `view-rate/page.tsx`, `leads/page.tsx`, `inquiries/page.tsx`, `listings/page.tsx`.
  - Components: `src/components/dashboard/AgentDashboardHome.tsx`, `src/components/agent/AgentTrendsPage.tsx`, `PerformanceBarChart.tsx`, `InquiryTrendLineChart.tsx`.
  - Services: `src/services/agentDashboardMockService.ts`.
- **Refactor focus**:
  - **API abstraction**:
    - Wrap dashboard mock service in `src/features/agent-dashboard/api/agentDashboard.api.ts` to make the transition to real backend endpoints seamless.
  - **UI composition**:
    - Extract reusable dashboard card, chart container, and metric components and move them into `src/components/ui/dashboard/` per `frontend-agent.mdc`.
  - **Performance**:
    - Ensure chart components accept memoized props and do not re-render excessively when unrelated dashboard state changes.
  - **RBAC**:
    - Confirm these routes are only accessible through `AgentRouteGuard` or equivalent `RoleGuard`.

### 4.9 Agent Listings, Inquiries & Leads

- **Files**:
  - Pages: `src/app/[locale]/(agent)/agent-properties/*`, `agent-dashboard/inquiries/page.tsx`, `agent-dashboard/leads/page.tsx`, `agent-dashboard/listings/page.tsx`.
  - Components: `src/components/agent/AgentProperties.tsx`, `properties/AgentSearch.tsx`, `properties/AgentSearchResults.tsx`, `properties/AgentPropertyEdit.tsx`, `lead-inquiries/LeadInquiriesPage.tsx`, `lead-inquiries/LeadInquiryDetailModal.tsx`, `src/components/agent/AgentListingsPage.tsx`.
- **Refactor focus**:
  - **API layer**:
    - Create `src/features/agent-properties/api/agentProperties.api.ts` and `src/features/agent-inquiries/api/agentInquiries.api.ts` to wrap existing mock or real services.
  - **State management**:
    - Introduce RTK Query endpoints for agent-specific listing and inquiry data where appropriate, following `state-agent.mdc`, while keeping the current UI and Redux shape intact.
  - **Performance**:
    - Adopt pagination and filtering best practices (server-side or RTK Query caching) so large numbers of listings or inquiries scale well.
  - **RBAC**:
    - Ensure these pages consistently use agent-only permissions and guard components from `rbac-permission-agent.mdc`.

### 4.10 Agent Property Creation & Onboarding

- **Files**:
  - Pages: `src/app/[locale]/(agent)/agent-dashboard/add-property/page.tsx`.
  - Components: `src/components/agent/add-property/AddPropertyForm.tsx`, `PropertyFormSection.tsx`, `DocumentUploadField.tsx`, `MediaUploadField.tsx`, `src/components/map/LocationPicker.tsx`.
  - Services: `src/services/agentDashboardMockService.ts` (submission).
- **Refactor focus**:
  - **Form architecture**:
    - Split the large multi-section form into dedicated sub-form components and hooks (e.g., `usePropertyOwnerForm`, `usePropertyLocationForm`) per `solid-agent.mdc`, while keeping the visible multi-step layout the same.
  - **API & validation**:
    - Create `src/features/agent-properties/api/addProperty.api.ts` for submission, reusing mock service logic.
    - Externalize Zod/Yup schemas (if used) into a `validation.ts` file referenced by the form and API layer.
  - **Performance**:
    - Ensure location picking and map initialization are guarded against unnecessary re-renders and handle geolocation failures gracefully per `performance-agent.mdc`.

### 4.11 Admin Dashboard & Analytics

- **Files**:
  - Pages: `src/app/[locale]/(admin)/dashboard/page.tsx`.
  - Components: `src/components/dashboard/AdminDashboardHome.tsx`, chart components reused from agent dashboard.
  - Services: `src/services/adminDashboardMockService.ts`.
- **Refactor focus**:
  - **API wrapper**:
    - Move admin dashboard data-fetching into `src/features/admin-dashboard/api/adminDashboard.api.ts`.
  - **UI components**:
    - Share chart and KPI card components with agent dashboard via `src/components/ui/dashboard/`.
  - **RBAC**:
    - Ensure the admin dashboard route uses `RoleGuard` with explicit admin permission checks per `rbac-permission-agent.mdc`.

### 4.12 Admin Agent Management

- **Files**:
  - Pages: `src/app/[locale]/(admin)/agents/page.tsx`.
  - Components: `src/components/dashboard/AdminAgentsPage.tsx`, `src/components/admin/agents/AdminAgentActionsMenu.tsx`.
  - Store: `src/features/admin-agents/adminAgentsSlice.ts`.
  - Services: `src/services/adminAgentApiService.ts`.
- **Refactor focus**:
  - **API**:
    - Move agent management calls into `src/features/admin-agents/api/adminAgents.api.ts`, wrapping `adminAgentApiService.ts`.
  - **State**:
    - Clarify normalized collections and pagination shapes in `adminAgentsSlice` per `state-agent.mdc` (e.g., `entities` + `ids` or `byPage` maps) without changing the public selectors yet.
  - **Error & feedback**:
    - Standardize invite/approve/decline/delete feedback via toaster patterns defined in `error-handling-agent.mdc`.
  - **Permissions**:
    - Apply `rbac-permission-agent.mdc` so that each action (invite, approve, grant admin) checks for explicit admin-level permissions within the UI and route.

### 4.13 Admin Property Management

- **Files**:
  - Pages: `src/app/[locale]/(admin)/properties/page.tsx`, `src/app/[locale]/(admin)/properties/[id]/page.tsx`.
  - Components: `src/components/admin/properties/AdminSearchResultMain.tsx`, `AdminSearchResults.tsx`, `AdminSearchResultListCard.tsx`, `property-details/AdminPropertyDetailsMain.tsx`, `property-details/AdminPropertyDetailsTabBar.tsx`.
- **Refactor focus**:
  - **API**:
    - Introduce `src/features/admin-properties/api/adminProperties.api.ts` for admin-side search and property details.
  - **UI & routing**:
    - Align admin search and details UIs with public property search/details patterns while keeping admin-only fields and operations distinct.
  - **Performance & pagination**:
    - Ensure the admin search uses server-side pagination and stable sorting consistent with `performance-agent.mdc`.

---

## 5. Performance & Scale Enhancements

Cross-cutting performance improvements, guided by `performance-agent.mdc` and relevant **core.mdc** phases:

- **Data-loading**:
  - Adopt RTK Query or standardized data-fetching hooks in feature API modules for search, dashboards, and admin lists, ensuring built-in caching, de-duplication, and pagination.
  - Ensure lists (properties, agents, inquiries) use server-side pagination parameters consistently rather than loading large datasets into memory.
- **Rendering**:
  - Introduce virtualization for large property or agent lists where applicable using shared table/list components.
  - Memoize heavy child components (cards, charts) and expensive selector computations to avoid unnecessary re-renders.
- **Interaction**:
  - Debounce search inputs and filter controls on property search and admin/agent search screens.
  - Throttle scroll and resize handlers (e.g., property details tab sync, dashboard widgets) following `performance-agent.mdc`.

These enhancements should be applied as features are touched for other refactors, ensuring no perceived behavior change other than smoother performance.

---

## 6. Security & Code Quality Guardrails

Guided by `security-agent.mdc`, `testing-agent.mdc`, and **core.mdc** Phases 5 (Security), 16 (Testing & QA), and 17 (Code Quality):

- **Security alignment**:
  - Harden token and role handling using `sessionManager` to avoid direct trust in client-modifiable cookies and localStorage, while keeping the same role semantics in the short term.
  - Ensure `middleware.ts` and guards rely on normalized session and permission functions from `src/permissions/`.
  - Review all external calls for input/output validation; add lightweight validation where missing in feature API modules.
- **Code quality gates**:
  - Enforce a clean run of:
    - `npm run build`
    - `npm run lint`
    - `npm run test` / `npm run test:coverage`
    - `npx tsc --noEmit`
  - Address new lints/warnings introduced by refactors and only touch pre-existing issues when immediately relevant.
  - Implement basic Jest/RTL tests for critical flows (auth, search, property details, dashboard render) as required by `testing-agent.mdc`.

---

## 7. Agent Alignment (Frontend, State, Routing, Errors, Theme, SOLID)

For each key agent, the refactor should explicitly align features with its guidance:

- **Frontend/UI & Components (`frontend-agent.mdc`, `ui-agent.mdc`)**:
  - Keep page-level components (`page.tsx`) thin; move logic into feature components and hooks.
  - Centralize UI primitives in `src/components/ui` and reuse them across search, dashboards, admin, and auth flows.
  - Prefer Server Components by default; mark components as `'use client'` only where hooks/Redux/browser APIs are needed.

- **State (`state-agent.mdc`)**:
  - Clarify which data belongs in:
    - RTK Query (server data: properties, agents, dashboards).
    - Redux Toolkit slices (cross-route UI state: auth, profile, filters, saved searches, favourites).
    - Local component state (pure UI concerns).
  - Gradually migrate manual thunk-based data fetching into RTK Query endpoints, keeping slices as thin orchestrators.

- **Routing & Access Control (`routing-agent.mdc`, `rbac-permission-agent.mdc`)**:
  - Ensure route groups clearly reflect access boundaries: `(public)`, `(main)`, `(auth)`, `(agent)`, `(admin)`.
  - Use shared `PermissionGuard` / `RoleGuard` for client-side gating instead of ad-hoc checks.
  - Keep middleware as the first security gate for protected admin and agent routes.

- **Error Handling (`error-handling-agent.mdc`)**:
  - Normalize API errors into a shared `ApiError` and use consistent toast/inline messaging patterns.
  - Implement and use `error.tsx` and `not-found.tsx` for route-level failures where appropriate.
  - Avoid silent failures; always surface user-meaningful messages without leaking sensitive details.

- **Theme & Accessibility (`theme-agent.mdc`)**:
  - Use `next-themes` or equivalent to provide light/dark/system themes across layouts.
  - Ensure navigation, modals, and forms are keyboard-accessible with proper ARIA attributes and focus management.
  - Use design tokens and Tailwind variables rather than hardcoded colors and sizes.

- **SOLID (`solid-agent.mdc`)**:
  - Ensure pages and major components follow SRP by extracting complex logic into hooks and utilities.
  - Favor composition over modification of base UI components (OCP).
  - Keep props interfaces focused; split “god” props into smaller interfaces as features are refactored.
  - Depend on abstractions (e.g., feature API modules and hooks) rather than concrete HTTP or storage implementations.

---

## 8. Implementation Strategy

- **Phase-driven refactor (core.mdc Phases 0 → 18)**:
  - For each feature area:
    - Phase 0–1: Confirm requirements and backend contracts against existing behavior; update `docs/backend-analysis.md` and `src/types/api.ts` as needed.
    - Phase 3: Align structure under `src/features/**` and `src/app/**` while keeping imports functioning.
    - Phases 4–5: Ensure roles and permissions are correctly modeled in `src/permissions/` and enforced through middleware and guards.
    - Phases 10–12: Refine state management and API modules (`RTK`, `RTK Query`, Axios clients).
    - Phases 15–17: Apply SOLID, testing, and code quality checks before marking a feature area as “refactored”.

- **Incremental migration**:
  - Refactor one feature area at a time (e.g., Authentication, then Property Search, then Property Details, etc.).
  - Introduce new modules in parallel with existing ones; add deprecation comments but do not remove old modules until all imports are migrated.
  - Keep route structures, component props, and API shapes intact to ensure no change in visible behavior.

- **Quality gates**:
  - Before considering a feature area complete:
    - Run `build`, `lint`, `test:coverage`, and `tsc --noEmit` with no new errors.
    - Confirm that `docs/EXISTING_FEATURES.md` remains accurate (no behavioral change).
    - Optionally, add a short note to an internal checklist or doc indicating that the feature is now compliant with the core rule and relevant agents.

This plan is designed to be executed iteratively, ensuring that each feature can be refactored to enterprise-grade standards while the Abdoun Real Estate platform remains fully functional and stable throughout the transition.

