# Lead Frontend Audit Report

## 1. API Contract Summary

### Understanding Summary (from `LEAD_API_CONTRACT.md`)
- **Actors**
  - `registered_user`: can submit contact form lead only.
  - `agent`: can list/detail assigned leads, update status (`NEW -> IN_PROGRESS -> REQUEST_FOR_CLOSE`), reply, and manage own notes.
  - `admin`: can list scoped leads, create manual leads, reassign, update status, and apply close decision (`... -> CLOSED`).
- **API groups**
  - Contact form: `POST /api/v1/leads/contact-form`
  - Agent lead management: list/detail/status/reply/notes endpoints under `/api/v1/agent/leads`
  - Admin lead management: list/create/reassign/status/close-decision endpoints under `/api/v1/admin/leads`
- **Status lifecycle**
  - `NEW`
  - `IN_PROGRESS`
  - `REQUEST_FOR_CLOSE`
  - `CLOSED`
- **Allowed frontend actions by role**
  - Registered user: submit validated contact form payload.
  - Agent: progress status up to request-close, reply to lead, create/update/delete own notes.
  - Admin: manual create, reassign, scoped status updates, close decision.
- **Required forms and fields**
  - Contact form: `propertyId`, `name`, `email`, `phoneNumber`, `message`
  - Admin manual create: `propertyId`, `assignedAgentId`, `source`, `message`, `contactUserId?`
  - Status/reassign/reply/note payloads as in contract.
- **Pagination/filter needs**
  - Agent/admin list requires `page`, `pageSize`, optional `status`, `source`.
- **Error handling expectations**
  - Handle `401/403/404/422/500`, plus invalid transition currently possibly surfaced as `500`.
  - Duplicate contact submit should be treated as success (idempotent behavior).

### APIs Required
- Contact: `POST /api/v1/leads/contact-form`
- Agent: `GET /api/v1/agent/leads`, `GET /api/v1/agent/leads/{lead_id}`, `PATCH /api/v1/agent/leads/{lead_id}/status`, `POST /api/v1/agent/leads/{lead_id}/reply`, `POST/PATCH/DELETE notes`
- Admin: `GET /api/v1/admin/leads`, `POST /api/v1/admin/leads`, `PATCH /api/v1/admin/leads/{lead_id}/reassign`, `PATCH /api/v1/admin/leads/{lead_id}/status`, `POST /api/v1/admin/leads/{lead_id}/close-decision`

### Main Frontend Flows
- Property contact: user authentication gate -> validated form -> create lead -> toast/feedback.
- Agent lead operations: list with filters/pagination -> detail -> status/reply/notes actions.
- Admin lead operations: scoped list -> manual create/reassign/status/close decision.

## 2. Existing Frontend Architecture

### API client pattern
- Shared Axios clients via `src/lib/http/clients.ts`: `publicApi` and `authApi`.
- Request/response behavior centralized in `src/lib/http/createClient.ts`.
  - Injects bearer token for auth client.
  - Handles refresh token retry queue and logout flow.
  - Peels standard v1 response envelope via `peelV1EnvelopeForAxios`.
- Existing feature services follow this style (example: `src/features/admin/api/adminAgentApiService.ts`).

### State management pattern
- Redux Toolkit store in `src/store/index.ts` using slices and thunk-driven async flows.
- No RTK Query detected; current pattern is service calls + `createAsyncThunk` + slice state.
- Existing list modules use shared pagination helpers (`src/lib/api/pagination.ts`) and slice state.

### Auth handling
- Route gating in `middleware.ts` based on role cookie:
  - prevents unauthenticated access to admin/agent routes.
  - prevents role-cross access (`user` from protected routes, `agent` from admin routes, etc.).
- HTTP auth managed by token store + refresh flow in `createClient.ts`.

### Routing
- Existing lead-related routes exist, but key pages are currently redirected to under-development:
  - `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`
  - `src/app/[locale]/(agent)/agent-dashboard/inquiries/page.tsx`
  - `src/app/[locale]/(agent)/agent-dashboard/leads-and-inquiries/page.tsx`
- Admin leads route currently points to legacy page:
  - `src/app/[locale]/(admin)/leads/page.tsx` -> `legacy-pages/LeadsPage`
- Sidebar includes "Leads and Inquiries" but admin link is currently under-development in `src/components/layout/sidebar.config.ts`.

### Forms
- Existing forms are primarily controlled React state.
- Validation style is mixed:
  - lightweight inline checks in many feature components.
  - reusable validation utilities for profile/phone in `src/features/profile/schemas/profileFormSchema.ts` and `src/lib/phoneValidation.ts`.

### Table/list pattern
- Reusable table/list + pagination pattern exists (example: `LeadInquiriesTable`, property search list/grid).
- Shared pagination UI component: `src/components/ui/Pagination`.

### Pagination/filter pattern
- URL-query driven filter state is used in several screens.
- Lead inquiries mock page uses `status/source/period/page` in querystring and local filtering.
- Shared pagination normalization utilities exist to absorb payload differences (`src/lib/api/pagination.ts`).

### Toast/error handling
- Toast component exists (`src/components/ui/toast.tsx`) and is used per-page.
- Generic API error extraction exists (`src/lib/http/apiError.ts`) and supports FastAPI `detail`, validation array, and fallback messages.

## 3. Existing Related Code Found

### `src/features/property-search/components/modals/EmailAgentModal.tsx`
- **Purpose:** property contact-by-email modal UI.
- **Classification:** needs modification.
- **Notes:** currently triggers `mailto:` and does not call backend lead API; includes name/email/phone/message inputs that can be reused.

### `src/features/property-search/components/modals/ContactPropertyModal.tsx`
- **Purpose:** property contact-by-phone modal.
- **Classification:** reusable (partial).
- **Notes:** useful for call UI, but no lead API integration.

### `src/features/agent/dashboard/components/lead-inquiries/LeadInquiriesPage.tsx`
- **Purpose:** agent leads/inquiries management page.
- **Classification:** needs modification.
- **Notes:** structurally useful (filters, table, detail, toast), but currently wired to mock service and old status/source enums.

### `src/features/agent/api/mocks/leadInquiriesMockService.ts`
- **Purpose:** mock in-memory inquiries service.
- **Classification:** duplicate risk.
- **Notes:** should not be used for contract-based implementation; replace with real service layer integration.

### `src/features/agent/dashboard/components/lead-inquiries/LeadInquiriesTable.tsx`
- **Purpose:** inquiries table with status badges, source badge, pagination.
- **Classification:** reusable (with modifications).
- **Notes:** status labels (`new/contacted/closed`) do not match contract lifecycle and must be updated.

### `src/app/[locale]/(admin)/leads/page.tsx` + legacy admin leads pages
- **Purpose:** admin leads route and legacy placeholder pages.
- **Classification:** needs modification.
- **Notes:** route exists, but implementation is legacy/not aligned with new API contract.

### `src/components/layout/sidebar.config.ts`
- **Purpose:** nav IA for admin/agent dashboards.
- **Classification:** reusable (with modifications).
- **Notes:** contains "Leads and Inquiries" entry and under-development behavior for admin; this is the right integration point.

### `src/lib/http/clients.ts` and `src/lib/http/createClient.ts`
- **Purpose:** shared API client, token handling, envelope handling.
- **Classification:** reusable.
- **Notes:** lead API should be added as feature service using existing `authApi`/`publicApi` conventions; do not create new Axios instance or interceptor.

### `src/lib/http/apiError.ts`
- **Purpose:** central API error message extraction.
- **Classification:** reusable.
- **Notes:** supports FastAPI error shapes; suitable for lead error handling including 422 detail array.

## 4. Gap Analysis

### Contact Form Gaps
- No API-backed lead creation flow from property contact/email UI.
- Existing `EmailAgentModal` uses `mailto:` instead of `POST /api/v1/leads/contact-form`.
- Required contract validations (name/email/phone/message lengths) are not fully enforced in current contact modal flow.
- Auth gating for registered user contact submission is not wired in current modal action path.
- Duplicate-submit success handling is not explicitly modeled.

### Agent Lead Management Gaps
- Existing agent page is mock-data based; not connected to `/api/v1/agent/leads*`.
- Status model mismatch (`new/contacted/closed` vs `NEW/IN_PROGRESS/REQUEST_FOR_CLOSE/CLOSED`).
- Missing server-driven pagination/filter query integration (`page`, `pageSize`, `status`, `source`).
- Missing real API mutations for reply and notes create/update/delete with ownership constraints.
- Current routes for leads/inquiries redirect to under-development, so production navigation path is blocked.

### Admin Lead Management Gaps
- Admin leads route points to legacy page, not contract-driven implementation.
- Missing manual lead creation form bound to admin payload contract.
- Missing scoped reassign/status/close-decision actions.
- Admin "Leads and Inquiries" navigation currently under-development and not wired to functional page.

### API Layer Gaps
- No dedicated lead API service exists for required 12 endpoints.
- No lead-specific DTO/type map matching contract entities.
- Need consistent envelope/error parsing via existing `authApi` conventions.

### State Management Gaps
- No lead slices/thunks/hooks for agent/admin lead lists, details, status mutations, replies, notes.
- No normalized state for lead detail + notes + mutation loading/error states.
- No integrated querystring synchronization for lead filter/page state against backend pagination.

### UI Component Gaps
- Contact form can reuse existing modal structure but needs backend wiring and validation updates.
- Agent list/detail components exist but require status/source/filter/action updates to contract.
- Admin table/forms/actions for lead management are largely missing or legacy.
- Status badge system must be updated to contract statuses.

### Validation/Error Handling Gaps
- Lead-specific form validation constraints are not centrally defined.
- 422 field error binding is not mapped for lead forms.
- Invalid status transition should be surfaced as business-friendly UI message even when backend returns `500`.
- 401/403/404 user experience patterns need explicit flow decisions in lead screens.

## 5. Recommended Implementation Plan

1. **Types + API client methods**
   - Add lead domain types (`LeadStatus`, `LeadSource`, list/detail/reply/note payloads and responses).
   - Create `leadApiService` using existing `authApi` pattern and pagination helpers.
2. **Store/query hooks/thunks**
   - Add lead slices/thunks (or module hooks wrapping thunks) for agent/admin list/detail/mutations.
   - Include filter and pagination state synchronized with URL query.
3. **Contact form integration**
   - Reuse current contact/email modal UI.
   - Add auth gate behavior + contract validation + API submission + idempotent-success UX.
4. **Agent lead list/detail/actions**
   - Replace mock service calls in current inquiries module with real API.
   - Update statuses, allowed actions, badges, and notes/reply flows.
   - Unblock/replace under-development route targets.
5. **Admin lead management**
   - Implement admin list/table with filters/pagination.
   - Add manual create, reassign, status, and close decision actions.
   - Wire admin nav path away from under-development for this module.
6. **Testing/regression**
   - Add unit tests for type mappers, API params, state transitions, and validation.
   - Add UI-flow tests for key mutations and error states.

## 6. Checklist for Implementation

- [ ] **Create lead API service module**
  - **Files to change:** `src/features/*/api` (new lead service file under chosen feature structure)
  - **Expected behavior:** all 12 contract endpoints exposed via project naming conventions and existing `authApi/publicApi` clients
  - **Validation/test method:** unit tests for endpoint params/payload mapping and pagination parsing

- [ ] **Add lead domain types/interfaces**
  - **Files to change:** `src/types/*` (or feature-local types folder)
  - **Expected behavior:** strict typing for statuses, sources, list/detail payloads, note/reply DTOs
  - **Validation/test method:** compile-time checks and mapper tests with sample contract payloads

- [ ] **Wire registered-user contact form submit**
  - **Files to change:** property contact/email modal components and related container hooks
  - **Expected behavior:** validated submit calls `POST /api/v1/leads/contact-form`; duplicate treated as success; toast feedback shown
  - **Validation/test method:** UI tests for valid/invalid inputs, auth-required behavior, and success/error toasts

- [ ] **Replace agent mock service with real API**
  - **Files to change:** `LeadInquiriesPage`, related table/detail components, remove/retire mock wiring
  - **Expected behavior:** server data for list/detail/reply/notes/status, contract statuses/actions enforced
  - **Validation/test method:** integration tests for filters/pagination/action mutations and refresh behavior

- [ ] **Implement admin lead management screens/actions**
  - **Files to change:** admin leads route/components, nav wiring in sidebar config
  - **Expected behavior:** scoped list + manual create + reassign + status update + close decision
  - **Validation/test method:** action-based UI tests plus API-mock response scenarios (`403`, `404`, `422`)

- [ ] **Standardize lead error handling**
  - **Files to change:** lead module hooks/slices/components (reuse `getApiErrorMessage`)
  - **Expected behavior:** user-friendly messages for auth/scope/not-found/validation/invalid-transition/server failures
  - **Validation/test method:** unit tests with representative error payloads and message assertions

- [ ] **Route activation and regression pass**
  - **Files to change:** route files currently redirecting to under-development, sidebar/admin path handling
  - **Expected behavior:** agent/admin lead routes accessible per role guard and linked from dashboards/sidebar
  - **Validation/test method:** manual role-based navigation checks + middleware regression checks

## 7. Risks / Questions

- Backend note says invalid transition may currently return `500`; frontend needs a deterministic message map for this case.
- `close-decision` endpoint can technically accept broader status payloads; confirm whether UI must hard-lock this action to `CLOSED`.
- Current frontend role naming uses `"user"` while API contract uses `registered_user`; confirm token/claims-to-role mapping strategy for UI gating.
- Existing lead/inquiry UI uses legacy status/source vocabulary and may need migration support if old data is still displayed during rollout.
- Decide whether lead module should live under agent/admin split services or one shared lead service to avoid duplicated endpoint wrappers.
