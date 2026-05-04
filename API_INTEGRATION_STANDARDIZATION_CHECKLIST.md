# API Integration Standardization Checklist

## 1. Current API Layer Inventory
- [x] HTTP client factory identified (`src/lib/http/index.ts`)
- [x] Public API client usage identified
- [x] Auth API client usage identified
- [x] Duplicate client creation identified (`createHttpClients()` used across feature API files)
- [x] Interceptors identified (`src/lib/http/createClient.ts`)
- [x] Token refresh flow identified (`createClient` auth response interceptor + `RestAuthService.refresh`)
- [x] Logout/session expiry flow identified (`runLogoutFlow`, `AUTH_SESSION_EXPIRED_EVENT`, `sessionManager`)
- [x] Response envelope utilities identified (`src/lib/http/standardEnvelope.ts`)
- [x] Error handling utilities identified (`src/lib/http/apiError.ts`)
- [x] Pagination helpers identified (`src/lib/api/pagination.ts` and feature-level normalizers)
- [x] Upload/presigned URL flows identified (`src/features/agent/dashboard/api/uploads.api.ts`, `src/features/profile/api/profilePicture.api.ts`)
- [x] Mock auth/security shortcuts identified (tests and localized demo content references; no direct prod mock auth API path found in active runtime code)

## 2. Implementation Plan
- [x] Shared API client singleton plan
- [x] Interceptor safety plan
- [x] Auth refresh safety plan
- [x] Error handling standard plan
- [x] Pagination normalization integration plan
- [x] Upload handling plan
- [x] Testing plan
- [x] Rollback risk notes

## 3. Implementation Progress
- [x] Phase 1 completed
- [x] Phase 2 completed
- [x] Phase 3 completed
- [x] Phase 4 completed
- [x] Phase 5 completed

## 4. Validation
- [x] TypeScript check passed (`npm run build`)
- [x] Unit tests passed (`npm test`)
- [x] Build passed (`npm run build`)
- [ ] Lint passed (`npm run lint` currently fails due existing repository lint debt outside this phase)
- [x] Manual smoke checklist documented

## Plan Notes
- Introduce `src/lib/http/clients.ts` as the single shared client export location.
- Migrate feature API modules from local `createHttpClients()` calls to `@/lib/http/clients`.
- Validate no interceptor/auth behavior changes after singleton migration (Phase 2 safety review).
- Continue converging on `getApiErrorMessage` usage where raw error parsing remains (Phase 3).
- Keep list response normalization in API files and preserve existing component contracts (Phase 4).
- Keep presigned upload pattern (`authApi` for presign + raw `fetch` for upload) and centralize helper only if low-risk (Phase 5).
- Rollback strategy: revert per-phase file groups if regressions are detected in auth/session/listing/upload flows.

## Latest Validation Snapshot (After Phase 5)
- `npm test`: passed (21/21 suites, 56/56 tests).
- `npm run build`: passed (Next.js production build successful).
- `npm run lint`: failed with pre-existing project-wide issues (31 errors, 56 warnings), including `react-hooks/set-state-in-effect` and `no-explicit-any` in files outside this migration.

## Manual Smoke Execution Notes
- Dev server launched on `http://localhost:3005` for smoke checks.
- Route checks (HTTP 200): `/en`, `/en/search-result`, `/en/property-details/1`, `/en/admin-dashboard`, `/en/agent-dashboard`, `/en/properties`, `/en/agent-dashboard/listings`.
- Login route check (HTTP 200): `/en/agent-login`.
- Multilingual route check (HTTP 200): `/ar`.
- Pagination URL checks (HTTP 200):
  - `/en/search-result?page=2&pageSize=12`
  - `/en/agent-dashboard/listings?page=2&pageSize=20`
  - `/en/admin-dashboard/listings?page=2&pageSize=20`
- Session refresh/expiry and upload flow require authenticated interactive/manual browser action and were not fully executable via headless HTTP-only checks in this run.
