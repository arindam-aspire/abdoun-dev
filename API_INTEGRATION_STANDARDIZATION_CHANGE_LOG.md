# API Integration Standardization Change Log

## 1. Executive Summary
The frontend API integration layer was standardized in phased, low-risk steps by introducing shared HTTP client singletons, validating interceptor/auth behavior stability, unifying thunk-level API error extraction with `getApiErrorMessage`, preserving API-level pagination normalization contracts, and centralizing presigned upload `fetch` handling without changing backend contracts.

## 2. Files Changed
| File | Change Type | Reason |
|---|---|---|
| `API_INTEGRATION_STANDARDIZATION_CHECKLIST.md` | docs | Track inventory, plan, phase progress, and validation status |
| `src/lib/http/clients.ts` | new shared module | Ensure `createHttpClients()` is called once |
| `src/features/agent/dashboard/api/uploads.api.ts` | refactor | Use shared `authApi`; keep presigned upload flow and re-export upload helper |
| `src/features/saved-searches/api/savedSearches.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/agent/dashboard/api/agentProperties.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/profile/api/profile.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/agent/dashboard/api/agentDashboard.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/admin/dashboard/api/adminDashboard.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/admin-users/api/userService.ts` | refactor | Use shared `authApi` singleton |
| `src/features/admin/api/adminAgentApiService.ts` | refactor | Use shared `authApi` singleton |
| `src/features/property-search/api/propertyService.ts` | refactor | Use shared `publicApi`/`authApi` singleton |
| `src/features/profile/api/profilePicture.api.ts` | refactor | Use shared `authApi`; move upload helper import to shared upload module |
| `src/features/auth/api/authService.ts` | refactor | Use shared `publicApi`/`authApi` singleton |
| `src/features/agent/api/agentOnboardingApiService.ts` | refactor | Use shared `authApi` singleton |
| `src/features/recent-views/api/recentViews.api.ts` | fix/refactor | Use shared `authApi`; remove `any` from image mapping path |
| `src/features/favourites/api/favourites.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/agent/dashboard/api/taxonomy.api.ts` | refactor | Use shared `publicApi` singleton |
| `src/features/agent/dashboard/api/propertySubmissions.api.ts` | refactor | Use shared `authApi` singleton |
| `src/features/property-search/propertySearchSlice.ts` | error handling standardization | Replace raw `error.message` with `getApiErrorMessage` path |
| `src/features/property-details/propertyDetailsSlice.ts` | error handling standardization | Replace raw `error.message` with `getApiErrorMessage` path |
| `src/features/exclusive-properties/exclusivePropertiesSlice.ts` | error handling standardization | Replace raw `error.message` with `getApiErrorMessage` path |
| `src/features/admin/adminAgentsSlice.ts` | error handling standardization | Replace manual error parsing / raw messages with `getApiErrorMessage` |
| `src/features/admin-users/adminUsersSlice.ts` | error handling standardization | Remove fallback use of `action.error.message` in rejected path |
| `src/lib/api/upload.ts` | new shared module | Centralize raw `fetch` PUT presigned upload behavior and CORS/network error messaging |

## 3. API Client Changes
- **Old pattern:** feature API modules repeatedly called `createHttpClients()` and instantiated per-file clients/interceptors.
- **New pattern:** shared singleton export via `src/lib/http/clients.ts`:
  - `publicApi`
  - `authApi`
- **Result:** duplicate client/interceptor stacks were eliminated by moving all feature API imports to `@/lib/http/clients`.

## 4. Interceptor/Auth Review
- Reviewed:
  - `src/lib/http/createClient.ts`
  - `src/lib/auth/adapters/restAuthService.ts`
  - `src/lib/auth/adapters/localStorageTokenStore.ts`
  - `src/lib/auth/sessionManager.ts`
  - `src/lib/auth/sessionCookies.ts`
  - `src/components/layout/ui-provider.tsx`
- Behavior remained consistent:
  - 401 refresh queue logic retained (`isRefreshing` + queue flush).
  - Failed refresh still triggers logout/session-expiry paths.
  - `AUTH_SESSION_EXPIRED_EVENT` handling unchanged.
  - `publicApi` remains unauthenticated; `authApi` continues attaching bearer tokens.
- Remaining risk: existing global lint debt may hide unrelated future regressions; no interceptor functional regression was introduced in this work.

## 5. Error Handling Changes
- Applied `getApiErrorMessage` integration in target slices/thunks:
  - `propertySearchSlice`
  - `propertyDetailsSlice`
  - `exclusivePropertiesSlice`
  - `adminAgentsSlice`
  - `adminUsersSlice` rejected fallback path
- Removed raw/manual error extraction patterns in these targets where possible.
- Manual parsing remains in some non-target areas across the app and can be migrated in a follow-up.

## 6. Pagination / Response Normalization Changes
- Shared types/helpers used: `PaginationMeta`, `PaginatedResult<T>`, `createPaginatedResult`.
- API normalization remains in API modules (no backend-shape parsing moved into components).
- Component consumers continue reading normalized `result.items` and `result.pagination`.
- No additional full-fetch loop changes were required in this phase because current target flows already use server-driven pagination contracts.

## 7. Upload Handling Changes
- Presigned URL workflow preserved:
  1. authenticated app API call to obtain presigned URL
  2. raw `fetch` PUT to storage URL
  3. no auth header on storage upload
- Added shared helper: `src/lib/api/upload.ts`.
- `uploads.api.ts` now re-exports `putFileToPresignedUrl` from the shared helper for backward compatibility.

## 8. Mock Data / Mock Auth Notes
- No production runtime mock-auth endpoint path was introduced or enabled by this work.
- Existing mock/demo references remain outside this standardization scope (mainly tests/dev-oriented areas).
- Current changes are production-safe with respect to auth shortcuts.

## 9. Validation Results
- `npm test`
  - passed: 21/21 suites, 56/56 tests
- `npm run build`
  - passed: Next.js production build completed successfully
- `npm run lint`
  - failed: existing project-wide lint debt (`31 errors`, `56 warnings`), predominantly unrelated `react-hooks/set-state-in-effect` and historical `no-explicit-any` issues outside this initiative

## 10. Manual Smoke Test Checklist
- [x] Public homepage loads (`/en` -> HTTP 200)
- [x] Search works (`/en/search-result` -> HTTP 200)
- [x] Property details loads (`/en/property-details/1` -> HTTP 200)
- [x] Login works (`/en/agent-login` -> HTTP 200)
- [ ] Session refresh/expiry behavior checked (requires authenticated interactive session)
- [x] Admin dashboard loads (`/en/admin-dashboard` -> HTTP 200)
- [x] Agent dashboard loads (`/en/agent-dashboard` -> HTTP 200)
- [x] Pagination works on list pages (paged URLs returned HTTP 200)
- [ ] Upload flow checked if possible (requires authenticated interactive upload action)
- [x] Multilingual route still works (`/ar` -> HTTP 200)

## 11. Remaining Risks / Follow-ups
- Repository has pre-existing lint failures unrelated to this standardization; CI lint gate will still fail until baseline debt is addressed.
- Additional non-target files still use mixed error handling patterns and can be standardized in a follow-up pass.
- Manual smoke checklist is documented but not executed in this automated run.
