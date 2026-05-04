# API & Store Usage Audit Report

**Project:** Abdoun website (Next.js App Router, multilingual)  
**Scope:** `src/features/*/api/*`, Redux slices/thunks, hooks and pages that call HTTP clients (`authApi` / `publicApi` via `createHttpClients`), and data flow patterns.  
**Original audit date:** 2026-05-01  
**Last updated:** 2026-05-01 — aligned with **Duplicate API Phase 1** (`DUPLICATE_API_PHASE1_CHANGE_LOG.md`) and **property search dedupe Phase 2** (`PROPERTY_SEARCH_DEDUPE_CHANGE_LOG.md`). Earlier “analysis only” items below are retained as baseline; **§1–2 and §4–8 incorporate current implementation status.**

---

## 1. Executive Summary

- **Duplicate API calls (current):** **Mitigated** for **`GET /auth/me`**, **`GET /saved-searches`**, **`GET /properties/{id}/similar`**, **taxonomy** (Phase 1), and **`GET /properties` (listing search)** via **`fetchProperties` thunk `condition`** + **`normalizePropertySearchQueryKey`** (Phase 2; see `PROPERTY_SEARCH_DEDUPE_CHANGE_LOG.md`). **Still open:** `GET /favorites` (single hydrator — unchanged); admin **`GET /users`** (sidebar vs table); **recent views** remain page-local.
- **Store usage:** Unchanged at a high level: Redux for **property search**, **property details** (main record), **exclusive home listings**, **admin/agent dashboards**, **admin agents/users**, **favourites IDs**, **saved search items**, **compare IDs**, **add-property wizard**. Auth still stores `userId` only; profile slice holds display fields after `login` middleware sync.
- **Overall data flow health:** **Improved vs original audit** for session hydration, saved-search list load, **property search duplicate GETs**, similar listings, and wizard taxonomy. **Moderate** overall: similar listings remain **hook-local** (not Redux) but are now **one implementation** with shared caching.

---

## 2. Duplicate API Call Inventory

| API / Endpoint | Files / Call sites | Status | Notes |
|----------------|-------------------|--------|--------|
| `GET /auth/me` | `getCurrentUserDeduped` in `src/lib/auth/currentUserRequest.ts`; used from `ui-provider.tsx`, `useUpdateProfile.ts` (`force: true`), `force-change-password/page.tsx` (`force: true`), `AuthPopup.tsx` | **Addressed (Phase 1)** | Raw `getCurrentUser` in `authService` unchanged; internal refresh helpers may still call it directly. |
| `GET /favorites` (list IDs) | `src/components/layout/ui-provider.tsx` | **Unchanged** | Single hydration entry; no duplicate hydrator added. |
| `GET /saved-searches` | `listSavedSearches()` in `savedSearches.api.ts` (in-flight dedupe); `UiProvider`; `useSavedSearches.load({ force? })` | **Addressed (Phase 1)** | Skip refetch when `hydratedUserId === user.id` unless `force`; retry uses `force`. |
| `GET /properties` (search) | `propertySearchSlice` (`fetchProperties` + `condition`); `normalizePropertySearchQueryKey` in `queryStringBuilder.ts`; `usePropertySearch.ts` | **Addressed (Phase 2)** | Skips in-flight + duplicate successful same-key fetch; retries after error still allowed. |
| `GET /properties/exclusive` | `exclusivePropertiesSlice` / `propertyService` | **Low risk** | “Once when idle” pattern unchanged. |
| `GET /properties/{id}/similar` | `useSimilarProperties.ts`; `SimilarProperties.tsx`, `PropertyDetailsSimilarProperties.tsx`, `PropertyDetailsSimilarPropertiesSection.tsx` | **Addressed (Phase 1)** | One hook; module cache + in-flight per property id. |
| `GET /location-taxonomy` | `useLocationTaxonomy.ts` → `LocationStep.tsx` | **Addressed (Phase 1)** | Module cache + in-flight; step remount reuses data. |
| `GET /property-taxonomy` | `usePropertyTaxonomy.ts` → `BasicInformationStep.tsx` | **Addressed (Phase 1)** | Same as location taxonomy. |
| `GET /agents/dashboard/summary` (+ performance) | `agentDashboardSummarySlice`, hydrator, `useAgentDashboard` | **OK** | Thunk `condition` dedupes. |
| `GET /admin/dashboard/summary` | `adminDashboardSummarySlice`, `useAdminDashboard`, legacy pages | **OK** | Thunk `condition` dedupes. |
| `GET /agents` | `Sidebar`, `useAdminAgentsTotalForDashboard`, `AdminAgentsPage` | **Open (low)** | Different params / cache keys; optional future consolidation. |
| `GET /users` | `fetchAdminUsersSidebarTotal`, `fetchAdminUsers` | **Open (low)** | Two calls when admin opens users area. |
| `GET /users/recent-views` | `recently-viewed/page.tsx` | **Open (low)** | Page-local; optional shared cache if second consumer appears. |

---

## 3. Store Usage Analysis

| Area | Current Pattern | Notes |
|------|-----------------|-------|
| Auth | `authSlice` + `profileSlice` via `login` | Unchanged; `/me` refresh orchestration now goes through `getCurrentUserDeduped` at listed call sites. |
| Property search | Redux thunk + slice + **`condition`** / normalized query keys | See `PROPERTY_SEARCH_DEDUPE_CHANGE_LOG.md`. |
| Property details | Redux for main record; similar via **`useSimilarProperties`** (not in slice) | Consistent fetch path; optional future: slice field `similarByPropertyId`. |
| Saved searches | Redux items + **`load({ force })`** guard | Hydration aligned with `UiProvider`; API dedupes concurrent list fetches. |
| Favourites | Redux + `UiProvider` hydration | Unchanged. |
| Add property wizard | Redux wizard + **taxonomy hooks** (module cache) | Reference data no longer refetched on every step remount. |
| Dashboards / admin lists | Thunks with conditions | Still the reference pattern for new features. |

---

## 4. Mixed Data Flow Issues

- **Similar properties:** Still **hook-local** (not Redux) but **no longer** three independent `useEffect` fetch implementations — all use **`useSimilarProperties`**.
- **Taxonomy:** Wizard state remains Redux; taxonomy is **session-cached hooks**, not per-step `useEffect` to API — lifecycle is clearer.
- **`GET /auth/me`:** Multiple **entry points** remain (layout, modal, profile, force-password) but share **deduped** network behavior except **`force: true`** after mutations.
- **Saved searches list:** `UiProvider` + `SavedSearchesView` can still both *invoke* load paths; **concurrent** list calls collapse to one HTTP request; **sequential** redundant calls avoided when Redux already hydrated.
- **Agent dashboard hydrator vs `useAgentDashboard`:** Still acceptable; thunk dedupes.

---

## 5. Missing Store Opportunities

- **Recent views:** Still optional slice/hook if reused outside `recently-viewed/page.tsx`.
- **Similar properties in Redux:** Optional `propertyDetails` extension — **not required** now that the hook centralizes behavior.
- **Deduped `getCurrentUser`:** **Implemented** as `getCurrentUserDeduped` (not store-backed).
- **Taxonomy in Redux:** **Not adopted**; module cache in hooks matches Phase 1 scope.

---

## 6. Overuse of Store

No change from original audit: wizard slice, theme, favourites/saved searches/compare usage remain justified.

---

## 7. Recommended Data Flow Standard

| Situation | Preferred approach |
|-----------|-------------------|
| **Cross-route server lists** | Redux thunks with **`condition`** dedupe (`adminDashboardSummary`, `agentDashboardSummary`, `adminAgents`, **`fetchProperties`**). |
| **Session `/auth/me`** | **`getCurrentUserDeduped`**; use **`{ force: true }`** after mutations that must observe fresh server state. |
| **Saved search list refresh** | Prefer Redux hydration from `UiProvider`; use **`load({ force: true })`** only for explicit retry or post-mutation full resync if added later. |
| **Similar listings (detail context)** | **`useSimilarProperties`**; avoid new direct `fetchSimilarPropertiesById` in components. |
| **Taxonomy (wizard)** | **`useLocationTaxonomy`** / **`usePropertyTaxonomy`**; avoid calling `fetchLocationTaxonomy` / `fetchPropertyTaxonomy` directly from steps. |
| **Reference data** | Module cache or Redux slice — Phase 1 used **module cache in hooks**. |
| **Direct API calls** | Keep in `*.api.ts` / `*Service.ts`; UI uses hooks/thunks/deduped helpers. |

---

## 8. Refactoring Plan

### Phase 1 — Critical duplicate calls (**completed**)

| Task | Outcome |
|------|---------|
| Dedupe `getCurrentUser` (layout + profile + auth modal + force-password) | **`currentUserRequest.ts`** + call-site updates |
| Saved-search hydration vs `load()` | **`listSavedSearches` in-flight dedupe** + **`load({ force })`** |
| Consolidate similar-properties fetch | **`useSimilarProperties`** + three components updated |
| Taxonomy remount refetch | **`useLocationTaxonomy`**, **`usePropertyTaxonomy`** |

*Details: `DUPLICATE_API_PHASE1_CHANGE_LOG.md`.*

### Phase 2 — Store alignment (**remaining**)

| Task | Priority | Notes |
|------|----------|-------|
| Property search thunk/hook dedupe for identical `requestQuery` | Medium | Still recommended |
| Optional: similar or taxonomy in Redux | Low | Only if cross-route sharing needs it |
| Optional: recent-views slice | Low | If second consumer appears |

### Phase 3 — Cleanup & optimization (**remaining**)

| Task | Priority | Notes |
|------|----------|-------|
| Merge/remove unused similar section components if layouts consolidate | Low | Components retained for alternate layouts |
| Document single hydrator rules (favourites / saved searches) | Low | Partially addressed by Phase 1 code |
| Admin `GET /users` double-call | Low | Metrics-driven |

---

## 9. Do Not Change Yet (High-Risk Areas)

Unchanged: auth token/refresh pipeline (`createClient` interceptors), upload presign flows, dashboard thunks/sidebar derivations, property submission lifecycles — touch only with design review and regression testing.

---

## Appendix — Key files

**Original review:** `clients.ts`, `createClient.ts`, `store/index.ts`, `selectors.ts`, `ui-provider.tsx`, main feature slices/thunks.

**Post–Phase 1 additions:** `src/lib/auth/currentUserRequest.ts`, `src/features/property-details/hooks/useSimilarProperties.ts`, `src/features/agent/dashboard/hooks/useLocationTaxonomy.ts`, `src/features/agent/dashboard/hooks/usePropertyTaxonomy.ts`, updates in `savedSearches.api.ts`, `useSavedSearches.ts`, similar-property components, add-property steps.

**Post–property-search dedupe (Phase 2):** `propertySearchSlice.ts` (`inFlightQueryKey`, `lastSuccessfulQueryKey`, thunk `condition`), `normalizePropertySearchQueryKey` in `queryStringBuilder.ts`.

---

*End of report.*
