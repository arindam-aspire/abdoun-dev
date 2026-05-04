# API Handling Audit Report

**Project:** Abdoun multilingual Next.js App Router frontend  
**Scope:** Request/response/error/auth/upload/pagination/typing/mocks — analysis only (no code changes).  
**Date:** 2026-04-30

---

## 1. Executive Summary

The codebase has a **solid conceptual foundation**: a shared Axios factory (`createClient`), optional **v1 response envelope** unwrapping (`peelV1EnvelopeForAxios`), a documented **`StandardApiResponse<T>`** type, and a centralized **`getApiErrorMessage`** helper for FastAPI-style errors. **Public vs authenticated** traffic is separated via `publicApi` vs `authApi` in `createHttpClients`.

However, **each API module calls `createHttpClients()` independently**, which **instantiates duplicate Axios clients and duplicate interceptor stacks** (including refresh-token logic). That increases bundle/work, risks subtle desync, and makes behavior harder to reason about. **Error extraction is inconsistent** across Redux thunks (some use `getApiErrorMessage`, others only `Error.message`). **List/pagination contracts differ by endpoint** (`items` vs `data` vs `agents` + `pagination`, etc.), with normalization scattered in feature code. **Uploads correctly split** presign (Axios + auth) from **PUT to S3 (raw `fetch`)**, but errors/progress are handled ad hoc.

**Mock data and mock auth shortcuts still sit on live routes** (agent invite, notifications, OAuth-style flows, dashboard tiles using mock search results). That is the main **delivery-readiness** concern alongside duplicate HTTP clients.

**Update (post-pagination normalization pass):** a shared `PaginatedResult<T>` / `PaginationMeta` helper now exists in `src/lib/api/pagination.ts`, and primary list APIs (`propertyService`, `agentProperties`, `adminPropertySubmissions`, `adminAgentApiService`, `userService`, admin/agent property-performance endpoints) are normalized. Remaining pagination inconsistencies are now concentrated in favourites/saved-searches/recent-views/taxonomy APIs and a legacy admin users page.

---

## 2. Major Risks

| Risk | Why it matters |
|------|----------------|
| **Many independent `createHttpClients()` calls** | Duplicate interceptors, duplicate refresh queues conceptually per module import graph; harder to guarantee single refresh/logout behavior; wasted memory and harder debugging. |
| **Mock-backed or dev-only flows on user-facing routes** | Agent invite pages import mock services; notifications page uses hardcoded data; `AuthPopup` and `useAuthForms` contain mock emails and credential bypasses — must be gated or removed before production. |
| **Inconsistent Redux error handling** | Several thunks use `error.message` only, so Axios/API detail often becomes a generic message and UX/debug quality drops. |
| **Mixed pagination models** | UI assumes one pattern (`Pagination` component + URL `page` / `pageSize`) while some lists **client-paginate** already-fetched datasets (e.g. agent listings), inflating payload and confusing “API page” vs “UI page”. |
| **Refresh/logout Axios bypasses shared client** | `RestAuthService` uses a bare `axios.create` instance without the same interceptors/envelope behavior as `authApi` — contract drift risk if refresh/logout responses change. |

---

## 3. API Client Inventory

| Client / Pattern | Location | Used By | Problem | Recommendation |
|------------------|----------|---------|---------|----------------|
| **`createHttpClients` → `publicApi` + `authApi`** | `src/lib/http/index.ts`, `src/lib/http/createClient.ts` | All feature `*.api.ts` / services that import it | **New pair of clients per module** that calls `createHttpClients()` | Single module-level singleton (or React context) exporting shared `publicApi` / `authApi`; call `createHttpClients()` once per browser session. |
| **Per-feature `const { authApi } = createHttpClients()`** | e.g. `src/features/favourites/api/favourites.api.ts`, `src/features/saved-searches/api/savedSearches.api.ts`, `src/features/recent-views/api/recentViews.api.ts`, `src/features/admin-users/api/userService.ts`, `src/features/profile/api/profile.api.ts`, `src/features/profile/api/profilePicture.api.ts`, `src/features/admin/dashboard/api/adminDashboard.api.ts`, `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts`, `src/features/agent/dashboard/api/agentProperties.api.ts`, `src/features/agent/dashboard/api/uploads.api.ts`, `src/features/admin/api/adminAgentApiService.ts` | Respective features | Duplicate clients/interceptors | Import shared instances from `src/lib/http` (or `src/lib/http/clients.ts`). |
| **`createHttpClients` inside `authService`** | `src/features/auth/api/authService.ts` (`publicApi`, `authApi`) | All auth API functions | Same duplication; **second** `LocalStorageTokenStore` instance for `persistTokens` vs store inside `createHttpClients` | Unify token store + clients with the shared singleton pattern. |
| **`createHttpClients` inside `propertyService`** | `src/features/property-search/api/propertyService.ts` | Search, exclusive listings, similar properties, property details | Same duplication | Shared clients. |
| **Bare `axios.create` (refresh/logout)** | `src/lib/auth/adapters/restAuthService.ts` | Auth refresh + logout from `createClient` interceptor chain | No `peelV1EnvelopeForAxios`; manual `peelV1EnvelopePayload` on refresh only; separate from feature clients | Keep as internal detail but align envelope handling and base URL with main client; or route through a minimal shared helper. |
| **Raw `fetch` (S3 PUT)** | `src/features/agent/dashboard/api/uploads.api.ts` (`putFileToPresignedUrl`) | Property uploads, profile picture upload | Intentional (no `Authorization` on S3); error mapping custom | Document as standard; optionally centralize “CORS vs 403” messaging. |
| **Raw `fetch` (data URL → `File`)** | `src/features/profile/api/profilePicture.api.ts` (`dataUrlToProfileFile`) | Profile crop/preview flows | Local/blob only, not backend | Acceptable; note as non-API use. |

---

## 4. Request Pattern Inventory

| Pattern | Example Files | Risk | Recommended Standard |
|---------|---------------|------|---------------------|
| **Axios `params` for query string** | `src/features/property-search/api/propertyService.ts` (`GET /properties`, `/properties/exclusive`, similar); `src/features/agent/dashboard/api/agentProperties.api.ts`; `src/features/admin-users/api/userService.ts`; `src/features/admin/api/adminAgentApiService.ts`; `src/features/admin/dashboard/api/adminDashboard.api.ts` | Low; consistent with Axios | Keep; optionally add **`paramsSerializer`** if backend requires strict array encoding. |
| **Pre-built `URLSearchParams` / query builder** | `src/features/property-search/utils/queryStringBuilder.ts`; normalization in `propertyService.normalizeQueryParams` | Medium: multiple places touch `page` / `pageSize` defaults | Single builder for search URLs + API params; document default `pageSize` (10 vs 12 vs 20). |
| **JSON body snake_case (backend-aligned)** | `src/features/agent/dashboard/api/uploads.api.ts`, `src/features/profile/api/profilePicture.api.ts`, `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts`, `src/lib/auth/adapters/restAuthService.ts` (refresh) | Low for backend contract | Keep snake_case in API layer; map to camelCase only in UI models if needed. |
| **JSON body camelCase** | `src/lib/auth/adapters/restAuthService.ts` (`logout`: `{ refreshToken }`) vs refresh body snake_case | Medium: **inconsistent casing** across auth helpers | Align with backend contract in one place; add types per endpoint. |
| **No global `Accept-Language` / locale header** | HTTP client defaults in `createClient` / `createHttpClients` | Medium for i18n: UI is localized via `next-intl`, but **API may not receive language hint** | If backend supports it, add optional `resolveHeaders` from locale (e.g. in a single client factory). |
| **Multipart vs JSON** | Profile/property uploads: **presign + PUT**, not multipart to app API | Low | Standard: presign JSON + `PUT` binary to storage URL. |

---

## 5. Response Envelope Inventory

**Mechanism:** On success, `peelV1EnvelopeForAxios` replaces `response.data` with inner `data` when `success === true` and `data` key exists (`src/lib/http/standardEnvelope.ts`). `readV1EnvelopeMessage` captures optional top-level `message`. Failed envelopes (`success === false`) are left intact for callers to inspect.

| Response Pattern | Example Files | Risk | Recommended Standard |
|------------------|---------------|------|---------------------|
| **v1 envelope peeled → inner DTO** | Most `authApi` / `publicApi` responses after interceptors | Low when backend is consistent | Treat **`response.data` as inner payload** after migration; use `StandardApiResponse` only when explicitly handling failures. |
| **HTTP 200 + `success: false` + manual check** | `src/features/admin/dashboard/api/adminDashboard.api.ts` (`isFailedV1Envelope`); `src/features/admin-users/api/userService.ts` (`listUsers`) | Medium: **not all modules check** `isFailedV1Envelope`; some may mis-read empty data | Standard helper: `assertSuccess(response.data)` or throw with `getApiErrorMessage` / envelope `error` field. |
| **No envelope — raw paginated object** | `src/features/property-search/api/propertyService.ts` (`PropertySearchApiResponse`: `items` \| `data`, `total`, `page`, `pageSize`) | Medium: **dual list keys** (`items` vs `data`) | Backend contract doc + single normalizer `propertySearchRows()`. |
| **Nested `pagination` object** | `src/features/admin/api/adminAgentApiService.ts` (`agents` + `pagination.{page,pageSize,total,...}`) | Medium: **different from** `items` + top-level `total` | Feature-level normalizer to a shared `PaginatedResult<T>` type for UI. |
| **Union types: array OR wrapped object** | `src/features/favourites/api/favourites.api.ts`; `src/features/saved-searches/api/savedSearches.api.ts`; `src/features/recent-views/api/recentViews.api.ts` | Medium: **runtime branching** per endpoint version | Versioned parser or backend deprecation plan; log/telemetry when legacy shape seen. |
| **Success message from envelope** | `src/features/admin/api/adminAgentApiService.ts` (`validateInviteToken` uses `readV1EnvelopeMessage`) | Low: easy to forget | Document when to use `readV1EnvelopeMessage` vs body fields. |

**Example shape diversity (illustrative):**

- Search: `{ items?: [], data?: [], total, page, pageSize }` (after peel).
- Agents list: `{ agents: [], pagination: { total, page, pageSize, ... } }` (after peel).
- Agent properties: `{ items: [], total, page, pageSize, hasNext?, ... }`.
- Users list: parsed from many possible keys (`data`, `users`, `items`, …) in `userService.ts`.

---

## 6. Error Handling Inventory

| Error Pattern | Example Files | Risk | Recommended Standard |
|---------------|---------------|------|---------------------|
| **`getApiErrorMessage` (central)** | `src/lib/http/apiError.ts`; slices: `adminUsersSlice.ts`, `adminDashboardSummarySlice.ts`, `agentDashboardSummarySlice.ts`, `adminUserGrowthTrendsSlice.ts`; UI: `AuthPopup.tsx`, `SettingsPasswordPage.tsx`, many dashboard components | Low when used | **Mandatory for all thunks** and async handlers. |
| **`Error.message` only in thunks** | `src/features/property-search/propertySearchSlice.ts`; `src/features/property-details/propertyDetailsSlice.ts`; `src/features/exclusive-properties/exclusivePropertiesSlice.ts`; parts of `src/features/admin/adminAgentsSlice.ts` | **High**: loses Axios `response.data.detail` | Switch to `getApiErrorMessage`. |
| **Manual Axios typing / status checks** | `src/hooks/useAuthForms.ts` (`AxiosError`, 409 + `detail`) | Medium: one-off | Extract small helper e.g. `getConflictMessage(error)`. |
| **`isAxiosError` in components** | `src/features/profile/hooks/useUpdateProfile.ts`; `src/features/agent/dashboard/components/add-property/AddPropertyWizard.tsx`; `src/features/agent/dashboard/components/AgentListingsPage.tsx` | Medium: duplicates branching | Prefer `getApiErrorMessage` + optional error code enum from backend. |
| **`throw new Error(getApiErrorMessage(error))` wrapper** | `src/features/admin/dashboard/api/adminDashboard.api.ts`; `src/features/admin/api/adminAgentApiService.ts` (`validateInviteToken`) | Medium: stack trace chaining | Acceptable if UI only needs string; for logging, preserve `cause`. |
| **Silent / generic catch** | `src/components/layout/ui-provider.tsx` (`getCurrentUser` failure → `clearSession` or fallback login) | Medium: no user-visible reason | Optional toast or logged event for support. |
| **Upload-specific errors** | `src/features/agent/dashboard/api/uploads.api.ts` (403 → CORS message; `Failed to fetch` remap) | Low | Keep; share message constant with profile upload. |
| **Failed v1 envelope → empty list** | `src/features/admin-users/api/userService.ts` (`listUsers` returns `{ items: [], total: null }`) | Medium: **hides** failure reason from caller | Prefer propagate error or include `error` in result for admin UI. |

**Toast:** Custom `Toast` component with local `useState` in many screens (`AuthPopup`, `AdminDashboardHome`, `FavouriteButton`, `SavedSearchesView`, etc.) — **no single toast bus**; patterns vary (`ToastKind` vs raw `string`).

---

## 7. Pagination Inventory

| Current Pattern | Example Files | Risk | Recommended Standard |
|-----------------|---------------|------|---------------------|
| **Server pagination: `page` + `pageSize` query** | `propertyService.ts`; `agentProperties.api.ts`; `adminPropertySubmissions.api.ts`; `adminAgentApiService.ts`; `userService.ts` `GET /users`; `adminDashboard.api.ts` property performance | Low | Document per-resource contract; map to a shared **`PaginatedResult<T>`** + **`PaginationMeta`**. |
| **Primary list APIs normalized to shared shape** | `propertyService.ts`, `agentProperties.api.ts`, `adminPropertySubmissions.api.ts`, `adminAgentApiService.ts`, `userService.ts`, `adminDashboard.api.ts` (property performance), `agentDashboard.api.ts` (property performance) | Low | Keep `PaginatedResult<T>` + `PaginationMeta` as required contract for list endpoints. |
| **Legacy/non-normalized list endpoints still returning plain arrays** | `favourites.api.ts`, `savedSearches.api.ts`, `recentViews.api.ts`, `taxonomy.api.ts` | Medium: mixed contracts force endpoint-specific parsing | Migrate these to normalized list contract (or explicitly mark as non-paginated resources). |
| **Legacy page derives pagination heuristically** | `src/features/admin/dashboard/components/legacy-pages/AdminUsersPage.tsx` (computes totals/pages from `listTotal` + `hasNextPage`) | Medium: still mixes view logic with pagination inference | Move fully to normalized `pagination` meta from slice/api and remove component-level inference. |
| **Client-side only (static data)** | `src/app/[locale]/(main)/recently-viewed/page.tsx`; `src/features/agent/dashboard/components/lead-inquiries/LeadInquiriesPage.tsx` (mock/filtered); legacy `ListingsPage.tsx` mock | Medium: OK for small local lists | Label as client-only; don’t mix with server `total` semantics. |
| **URL sync (`page`, `pageSize`)** | `AdminViewRatePage.tsx`, `AgentListingsPage.tsx`, `SearchResults.tsx` (via search query) | Low | Keep; ensure one naming convention (`pageSize` vs `page_size` only on wire). |
| **Different meta field names** | `adminAgentApiService`: `pagination.total` / `totalItems`; `userService`: many total keys; property search: `total` top-level | Medium | Normalize once per endpoint in API layer, not in components. |

---

## 8. Auth / Token Handling Findings

- **Storage:** Access/refresh tokens in **localStorage** via `LocalStorageTokenStore` (`src/lib/auth/adapters/localStorageTokenStore.ts`); additional keys `subId`, `authUsername` set in `authService.ts` for refresh/username.
- **Session display:** `sessionManager` / cookies used for session snapshot (see `src/lib/auth/sessionCookies.ts`, `sessionManager.ts`) — alignment with tokens must stay consistent (hydration in `ui-provider.tsx`).
- **Refresh:** `createClient` 401 interceptor refreshes via `RestAuthService.refresh`, queues parallel requests, updates tokens, retries; on failure runs logout flow or **force local logout** + `AUTH_SESSION_EXPIRED_EVENT` when refresh error matches “Invalid or expired token” (`src/lib/http/createClient.ts`).
- **UI reaction:** `ui-provider.tsx` listens for `AUTH_SESSION_EXPIRED_EVENT` and calls `forceLocalLogout` → redirect to `/${locale}/login`.
- **Risks:**  
  - **Multiple `createHttpClients()`** ⇒ multiple logical interceptor stacks (even if sharing storage).  
  - **RestAuthService** separate Axios instance and **logout body shape** (`refreshToken`) vs refresh (`refresh_token`).  
  - **XSS ⇒ token theft** (inherent to localStorage) — standard frontend caveat for security review.  
- **Locale:** Route guards redirect unauthenticated users with locale prefix; **not** automatically sent on API (see §4).

---

## 9. Upload Handling Findings

- **Flow:** `POST` JSON to app API for presigned URL (`/uploads/presigned-url`, `/auth/me/profile-picture`) with **`authApi`** → **`putFileToPresignedUrl`** uses **`fetch` PUT** with `Content-Type` only (`src/features/agent/dashboard/api/uploads.api.ts`, `src/features/profile/api/profilePicture.api.ts`).
- **Property files:** `src/features/agent/dashboard/lib/submissionFileUpload.ts` orchestrates presign + PUT; used from wizard steps (`MediaDocumentsStep.tsx`, `OwnerInformationStep.tsx`) and `useS3Upload.ts`.
- **Progress / retry:** No centralized progress, retry, or multipart chunking; failures surface via `getApiErrorMessage` or local `setError` in steps.
- **Risk:** Presigned expiry and CORS produce **generic** user messages — acceptable short-term; align with backend on TTL and headers.

---

## 10. API Typing Findings

- **Strengths:** Rich DTOs in `propertyService.ts`, `adminPropertySubmissions.api.ts`, `agentProperties.api.ts`, `authService.ts` types for auth user/session.
- **Gaps:**  
  - `adminDashboard.api.ts` uses `Record<string, unknown>` / `unknown` for summary mapping.  
  - `response.data as unknown` casts in `userService.ts` for list parsing.  
  - **Explicit `any`:** `src/features/recent-views/api/recentViews.api.ts` (`images?.map((image:any) => …)`).  
  - **Union response types** (`Favorites`, `Saved searches`, `Recent views`) indicate **evolving contracts** — types document uncertainty but runtime must stay defensive.  
- **Duplication:** List-item shapes overlap between favourites, recent views, and property search — partial duplication of “listing” mapping logic.

---

## 11. Mock Usage Findings

| Area | Location | Production-safe? |
|------|----------|-------------------|
| **Agent invite** | `src/app/[locale]/(auth)/agent-invite/[token]/page.tsx`, `.../agent-invite/page.tsx` import `@/features/agent/api/mocks/agentInviteMockService` | **No** — replace with real API before delivery. |
| **Notifications** | `src/app/[locale]/(main)/notifications/page.tsx` — `DUMMY_NOTIFICATIONS` | **No** |
| **Public home mock properties** | `src/features/public-home/components/constants.ts` (`MOCK_*`) | **Risk** if any route still renders these instead of API data — verify wired data source per page. |
| **Search results mocks in admin/agent UIs** | `AdminSearchResults.tsx`, `AgentSearchResults.tsx` import `MOCK_SEARCH_RESULTS` | **No** for real listing management UX. |
| **Agent dashboard mock services** | `AgentListingsPage.tsx`, `AgentInquiriesPage.tsx`, `AddPropertyForm.tsx` (`addListing` mock), `legacy-pages/*` | **Mixed** — some rows labeled `isFromApi`; still risky if mock path is default. |
| **Auth popup / forms** | `AuthPopup.tsx`, `useAuthForms.ts` — mock emails, `MOCK_*_CREDENTIALS` in `src/types/auth.ts` | **No** — gate behind `NODE_ENV` or remove. |
| **i18n strings** | `en.json` / others: “mock” in user-visible copy | Signals incomplete product; update when data is real. |
| **Tests** | `src/__tests__/*` Jest mocks | **Yes** — isolated to tests. |

---

## 12. Recommended Final Standard

| Topic | Proposal |
|-------|----------|
| **API client** | **One module** exports `publicApi` and `authApi` singletons (lazy-init on client). No per-file `createHttpClients()`. |
| **Request format** | Axios `params` + JSON bodies; **snake_case on wire** where backend uses it; document exceptions. |
| **Response envelope** | Assume v1 peel on success; use **`assertOkEnvelope` / `isFailedV1Envelope`** at boundaries that return 200 errors; inner types only in feature code. |
| **Error format** | Backend: FastAPI `detail` / validation arrays; always surface via **`getApiErrorMessage`** (extend if backend adds codes). |
| **Error parsing** | Ban raw `error.message` in thunks unless re-throwing after `getApiErrorMessage`. |
| **Toast** | Thin wrapper hook (`useAppToast`) around existing `Toast` component for consistent duration/kind. |
| **Form validation mapping** | Central helper for field errors if backend returns `422` structured body; today mostly string `detail`. |
| **Pagination** | **`PaginatedResult<T>`** + **`PaginationMeta`**; normalize in `*.api.ts` only. |
| **Uploads** | Keep **presign + `fetch` PUT**; shared **`uploadWithPresign`** helper (presign fn + put + typed errors). |
| **DTO placement** | Request/response types colocated with `*.api.ts`; UI models in `types` or `mappers.ts`. |
| **Auth/session expiry** | Keep interceptor + `AUTH_SESSION_EXPIRED_EVENT`; ensure **only one client** runs interceptors; align `RestAuthService` payload shapes with backend. |

---

## 13. Refactoring Roadmap

### Phase 1 — Must Fix Before Delivery

| Task | Priority | Risk | Suggested Order |
|------|----------|------|-----------------|
| Replace agent-invite mock service with real API on `agent-invite` routes | P0 | High | 1 |
| Remove or env-gate `MOCK_*_CREDENTIALS`, mock OAuth emails, and mock login branches in `AuthPopup` / `useAuthForms` | P0 | High | 2 |
| Confirm public home / search / admin listing screens do not rely on `MOCK_SEARCH_RESULTS` or `MOCK_PROPERTIES` in production builds | P0 | High | 3 |
| Implement real notifications API or hide route until ready | P1 | Medium | 4 |

### Phase 2 — Standardize API Layer

| Task | Priority | Risk | Suggested Order |
|------|----------|------|-----------------|
| Introduce shared `publicApi` / `authApi` singletons; remove duplicate `createHttpClients()` from each feature file | P0 | Medium (regression on refresh) | 1 |
| Unify `RestAuthService` request/response handling with envelope expectations | P1 | Medium | 2 |
| Add consistent `assertSuccess` for 200 + `success: false` envelopes on critical admin mutations | P1 | Low | 3 |
| Optional: `Accept-Language` (or `X-Locale`) from `useLocale` via request interceptor | P2 | Low | 4 |

### Phase 3 — UI State & Form Error Consistency

| Task | Priority | Risk | Suggested Order |
|------|----------|------|-----------------|
| Migrate thunks in `propertySearchSlice`, `propertyDetailsSlice`, `exclusivePropertiesSlice`, and `adminAgentsSlice` to `getApiErrorMessage` | P1 | Low | 1 |
| Standardize toast usage (hook + kinds) on dashboard/settings/auth flows | P2 | Low | 2 |
| Refactor `AgentListingsPage` to avoid full multi-page client fetch where possible | P1 | **Completed** (server page/pageSize usage) | 3 |

### Phase 4 — Long-Term Improvements

| Task | Priority | Risk | Suggested Order |
|------|----------|------|-----------------|
| Consolidate list DTO mappers (favourites / recent / search) | P2 | Low | 1 |
| Normalize remaining list endpoints to `PaginatedResult<T>` (`favourites`, `saved-searches`, `recent-views`, `taxonomy`) | P1 | Medium | 2 |
| Typed admin dashboard summary instead of `Record<string, unknown>` | P2 | Low | 2 |
| Upload progress + retry policy for large videos | P3 | Medium | 3 |
| Consider http-only cookie session (bigger backend change) if XSS risk is a concern | P3 | High | 4 |

---

## 14. Do Not Change Yet

Touching these without deeper review risks auth regressions or data loss:

| File / flow | Reason |
|-------------|--------|
| `src/lib/http/createClient.ts` | 401 refresh queue, logout serialization, envelope peel interaction. |
| `src/lib/auth/adapters/restAuthService.ts` | Token refresh/logout contract with backend; separate Axios instance. |
| `src/components/layout/ui-provider.tsx` | Session hydration, `getCurrentUser` failure paths, `AUTH_SESSION_EXPIRED_EVENT`, post-login redirects. |
| `src/lib/auth/sessionManager.ts` / `sessionCookies.ts` | Cookie/session contract with middleware and SSR. |
| `src/features/agent/dashboard/components/AgentListingsPage.tsx` | Hybrid API + mock rows plus local filtering/sorting semantics; high UX sensitivity. |
| `src/features/admin-users/api/userService.ts` | Defensive multi-shape list parsing — easy to break admin user management. |
| `src/features/property-search/api/propertyService.ts` | Core marketplace search mapping (`items` vs `data`, localization fields). |

---

*End of report.*
