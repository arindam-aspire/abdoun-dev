# Duplicate API Phase 1 — Change Log

## 1. Executive Summary

Phase 1 reduces duplicate frontend calls for **`GET /auth/me`**, **`GET /saved-searches`**, **similar property listings**, and **taxonomy** endpoints by introducing a small dedupe/TTL layer for current-user fetches, list-level in-flight dedupe for saved searches, a shared similar-properties hook with session cache, and module-level taxonomy caches reused across add-property wizard steps. Axios clients, interceptors, token refresh behavior, and backend URLs were not modified.

---

## 2. Files Changed

| File | Change | Reason |
|------|--------|--------|
| `src/lib/auth/currentUserRequest.ts` | **Added** `getCurrentUserDeduped` | Shared `/auth/me` orchestration with TTL + in-flight dedupe; `force` bypasses TTL and avoids joining stale in-flight reads after mutations. |
| `src/components/layout/ui-provider.tsx` | Uses `getCurrentUserDeduped()` | Session bootstrap dedupes overlapping `/me` calls. |
| `src/features/profile/hooks/useUpdateProfile.ts` | Uses `getCurrentUserDeduped({ force: true })` | Post-mutation refresh must not reuse a stale cached `/me`. |
| `src/app/[locale]/(auth)/force-change-password/page.tsx` | Uses `getCurrentUserDeduped({ force: true })` | After password set, always fetch fresh user. |
| `src/features/auth/components/modals/AuthPopup.tsx` | Uses `getCurrentUserDeduped()` | OTP completion benefits from dedupe with concurrent layout hydration. |
| `src/__tests__/useUpdateProfile.test.ts` | Mocks `currentUserRequest` instead of `getCurrentUser` on profile API | Align tests with new import path. |
| `src/features/saved-searches/api/savedSearches.api.ts` | In-flight dedupe for `listSavedSearches()` | Parallel `UiProvider` + page `load()` share one network request. |
| `src/features/saved-searches/hooks/useSavedSearches.ts` | `load(options?: { force?: boolean })`, hydrate guard | Skips refetch when Redux already hydrated for current user; `force` refetches. |
| `src/features/saved-searches/components/SavedSearchesView.tsx` | Retry passes `load({ force: true })` | Error retry must bypass the hydrate guard. |
| `src/features/property-details/hooks/useSimilarProperties.ts` | **Added** shared hook | Module cache + in-flight map per property id; `refresh()` busts cache. |
| `src/features/property-details/components/SimilarProperties.tsx` | Uses `useSimilarProperties` | Single fetch path for main similar strip. |
| `src/features/property-details/components/PropertyDetailsSimilarProperties.tsx` | Uses `useSimilarProperties` | Same hook as other similar UIs. |
| `src/features/property-details/components/PropertyDetailsSimilarPropertiesSection.tsx` | Uses `useSimilarProperties` | Same hook (still available for alternate layouts). |
| `src/features/agent/dashboard/hooks/useLocationTaxonomy.ts` | **Added** | Cached location taxonomy + in-flight dedupe. |
| `src/features/agent/dashboard/hooks/usePropertyTaxonomy.ts` | **Added** | Cached property taxonomy + in-flight dedupe. |
| `src/features/agent/dashboard/components/add-property/steps/LocationStep.tsx` | Uses `useLocationTaxonomy` | Remounting step reuses session cache. |
| `src/features/agent/dashboard/components/add-property/steps/BasicInformationStep.tsx` | Uses `usePropertyTaxonomy` | Same. |
| `DUPLICATE_API_PHASE1_CHECKLIST.md` | Checklist | Phase tracking. |
| `DUPLICATE_API_PHASE1_CHANGE_LOG.md` | This file | Documentation. |

---

## 3. `GET /auth/me` Deduplication

**Previous pattern:** `getCurrentUser()` from `auth.api` / `authService` was invoked independently from `UiProvider`, profile updates, force-password completion, and OTP login in `AuthPopup`, allowing overlapping requests during the same short window.

**New pattern:** `getCurrentUserDeduped` in `src/lib/auth/currentUserRequest.ts` wraps the existing `getCurrentUser` from `authService` (unchanged HTTP). Non-forced calls share an in-flight promise and may return a **3s TTL** cached result. **`force: true`** always hits the network (for correctness after mutations) and does not reuse the non-forced in-flight promise, so a profile PATCH is not followed by a stale `/me` from an earlier parallel request.

**Call sites:** `ui-provider` (no force), `useUpdateProfile` and force-password page (`force: true`), `AuthPopup` OTP path (no force).

---

## 4. Saved Searches Deduplication

**Previous pattern:** `UiProvider` and `SavedSearchesView` both called `listSavedSearches()` on login or page entry, which could duplicate traffic.

**New pattern:** (1) **`listSavedSearches`** dedupes concurrent calls at the API module. (2) **`useSavedSearches.load()`** returns immediately with `{ ok: true }` when `savedSearches.hydratedUserId === user.id` unless **`load({ force: true })`**. The saved-searches **Retry** path uses `refetchNonce > 0` to pass **`force: true`**.

Create/delete/rename flows still call the mutation APIs directly; list content is updated via Redux reducers as before.

---

## 5. Similar Properties Consolidation

**Previous:** Three components each called `fetchSimilarPropertiesById` in their own `useEffect`.

**New:** `useSimilarProperties` centralizes fetch, **in-flight dedupe per property id**, and a **session module cache** of filtered results (excluding the current id). Components **`SimilarProperties`**, **`PropertyDetailsSimilarProperties`**, and **`PropertyDetailsSimilarPropertiesSection`** now use this hook. None were deleted (alternate layouts may still import the section components).

---

## 6. Taxonomy Cache

**Previous:** `LocationStep` and `BasicInformationStep` each fetched on mount; navigating wizard steps could remount and refetch.

**New:** `useLocationTaxonomy` and `usePropertyTaxonomy` keep **module-level success caches** and **in-flight dedupe** for `GET /location-taxonomy` and `GET /property-taxonomy`. Steps map API shapes exactly as before; failed fetch still yields empty lists and fallback behavior in UI.

---

## 7. Validation Results

| Command | Result |
|---------|--------|
| `npm test` | **PASS** — 21 suites, 56 tests |
| `npm run build` | **PASS** — Next.js production build completed |
| `npm run lint` | **Exit code 1** — Pre-existing project issues (e.g. `no-explicit-any`, `set-state-in-effect` in other files, `property-details/types.ts`); **no new errors** reported for the Phase 1 files after fixing `useSimilarProperties` async setState pattern |

---

## 8. Manual Smoke Test Checklist

- [ ] App loads
- [ ] Login / session restore works
- [ ] Auth popup (including OTP path) still works
- [ ] Force password page completes and redirects
- [ ] Saved searches page lists items without obvious double-fetch (network tab)
- [ ] Saved search create/delete/rename and retry after error
- [ ] Property details page loads and similar properties render
- [ ] Add property wizard: location + basic information steps show taxonomy dropdowns
- [ ] Locale routes (`/en/...`, `/ar/...`) still work

---

## 9. Remaining Risks / Follow-ups

- **`getCurrentUser` in `authService.ts`** (e.g. internal refresh helper) still calls the raw HTTP function; only client orchestration sites listed above use the deduped helper. Extending dedupe there would need careful review of refresh semantics (**intentionally not changed** per prompt).
- **Property search query dedupe**, **admin sidebar counts**, **recent views store**, and **RTK Query / SWR** were explicitly out of scope.
- **Lint** still fails repo-wide; treating failing lint as pre-existing unless you want a dedicated cleanup pass.
- **`PropertyDetailsSimilarProperties` / `PropertyDetailsSimilarPropertiesSection`** remain in the tree for reuse; they are not removed.
