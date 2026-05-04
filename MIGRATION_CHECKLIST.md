# Structure migration — execution checklist

Progress is updated as work completes. Verify with `npm test` and `npm run build` after each phase.

## Phase 1 — Scaffold & docs

- [x] Add `MIGRATION_CHECKLIST.md`
- [x] Add `docs/architecture/structure.md`
- [x] Add placeholder dirs: `src/components/common`, `feedback`, `forms`
- [x] Extract `StandardApiResponse` to `src/lib/http/standardApiResponse.ts` (keeps `lib` free of `features` imports)

## Phase 2 — API / service alignment

- [x] Move `src/services/authService.ts` → `src/features/auth/api/authService.ts`
- [x] Move `src/services/userService.ts` → `src/features/admin-users/api/userService.ts`
- [x] Move `src/services/propertyService.ts` → `src/features/property-search/api/propertyService.ts`
- [x] Move `src/services/adminAgentApiService.ts` → `src/features/admin-agents/api/adminAgentApiService.ts`
- [x] Move `src/services/agentOnboardingApiService.ts` → `src/features/admin-agents/api/agentOnboardingApiService.ts`
- [x] Move mock services → `src/features/admin-agents/api/mocks/`
- [x] Update all `@/services/*` imports
- [x] Move `src/lib/profileApi.ts` → `src/features/profile/api/profileIdentity.ts` and update imports
- [x] Remove empty `src/services/` directory

## Phase 3 — Domain components out of `components/`

- [x] Move admin dashboard screens from `src/components/dashboard/` → `src/features/admin-agents/admin-dashboard/components/legacy-pages/`
- [x] Move `src/components/listing/`, `lead/`, `deal/` → `src/features/admin-agents/admin-dashboard/components/legacy-pages/`
- [x] Move `src/components/search-result/SearchFields.tsx` → `src/features/property-search/components/SearchFieldsCore.tsx` and point barrel to it

## Phase 4 — Cleanup

- [x] Move `src/lib/mocks/mockSearchResults.ts` → `src/features/property-search/mocks/mockSearchResults.ts`
- [x] Move `src/lib/mocks/jordanCities.ts` → `src/lib/constants/jordanCities.ts` (shared static data, not property-search–specific)
- [x] Remove Redux `counter` slice from store
- [x] `npm test` + `npm run build`

## Phase 5 — Large files (incremental)

- [x] Extract static option sets / classNames / `slugify` helpers from `SearchFieldsCore.tsx` → `searchFieldsUiConstants.ts` (further splits optional)

---

_Last updated: migration execution session._
