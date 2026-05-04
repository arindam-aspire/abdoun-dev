# API edge fixes — change log

## Summary

Targeted fixes from the maintenance audit prompt: canonical search budget URL params, HTTP client vs pure-helper module boundaries, auth stack review (no behavioral change), and narrower public API import paths for property search and auth. Backend contracts, pagination, and client singleton behavior were not changed.

---

## Search param fix

**Canonical keys:** `budgetMin`, `budgetMax` (replacing hero usage of `minPrice` / `maxPrice`).

| File | Change |
|------|--------|
| `src/features/public-home/components/HeroSearchCard.tsx` | Search navigation now sets `budgetMin` / `budgetMax`. |
| `src/features/property-search/components/SearchFieldsCore.tsx` | Initial budget state reads `budgetMin`/`budgetMax`, with fallback to legacy `minPrice`/`maxPrice` in the URL. |
| `src/features/property-search/utils/queryStringBuilder.ts` | Documented that budget keys pass through as canonical names (no pagination logic touched). |

**Backward compatibility:** Old bookmarks or shared links with `minPrice`/`maxPrice` still hydrate filters until the user syncs the URL (which writes canonical keys).

---

## HTTP boundary fix

**Removed:** `src/lib/http/index.ts` (previously `"use client"` and re-exported pure helpers).

**Client-only module:** `src/lib/http/clients.ts` now contains `createHttpClients`, `HttpClients` type, and the module-level `publicApi` / `authApi` singletons under `"use client"`.

**Pure helpers (no client directive):** Import directly from:

- `@/lib/http/apiError` — `getApiErrorMessage`
- `@/lib/http/standardEnvelope` — `isFailedV1Envelope`, `peelV1EnvelopeForAxios`, `peelV1EnvelopePayload`, `readV1EnvelopeMessage`, etc.
- `@/lib/http/standardApiResponse` — types

All former `@/lib/http` barrel imports were updated to these paths.

---

## Auth notes (Phase 3 — review only)

- **`RestAuthService`** (`src/lib/auth/adapters/restAuthService.ts`): refresh uses `peelV1EnvelopePayload` on the v1 envelope, consistent with the main client’s envelope handling. It uses a dedicated `axios` instance without the authenticated interceptors by design (avoids refresh recursion).
- **Logout:** simple POST to `logoutPath`; unchanged.
- **No code changes** were required; behavior was not clearly broken relative to the main `createClient` stack.

---

## API surface notes

| Area | Convention |
|------|------------|
| **Property search** | Cross-feature imports use `@/features/property-search/api/propertySearch.api` (re-exports from `propertyService` internally). `propertyService.ts` remains the implementation layer for this feature only. |
| **Auth** | `useAuthForms`, `logoutClient`, and `force-change-password` page now import from `@/features/auth/api/auth.api` instead of `authService.ts`, matching other call sites. `authService.ts` stays the implementation; `auth.api.ts` remains the public facade. |

---

## Validation results

| Command | Result |
|---------|--------|
| `npm test` | Pass (exit 0). |
| `npm run build` | Pass (exit 0). |
| `npm run lint` | **Fail** (exit 1): many pre-existing issues across the repo (tests, charts, hooks rules, unused vars, etc.). No new errors were introduced specifically for the HTTP split or search param edits; `SearchFieldsCore.tsx` still reports an existing unused import warning (`BookmarkPlus`). |

---

## Risks

1. **Bookmarked URLs** with `minPrice`/`maxPrice` rely on fallback read logic until a navigation/sync rewrites the query string.
2. **Import paths:** Any external or stale docs referencing `@/lib/http` as a barrel need updating to `apiError` / `standardEnvelope` / `clients`.
3. **`propertySearch.api` growth:** Re-exports add a thin layer; avoid importing `propertyService` from outside the property-search feature to prevent drift.

---

## Files touched (high level)

- Public home hero search, search fields, query string builder docs.
- `src/lib/http/clients.ts` (expanded); deleted `src/lib/http/index.ts`.
- ~20 call sites: `getApiErrorMessage` / envelope imports.
- Property search API barrel, exclusive/details API wrappers, three property-details components.
- Auth: `useAuthForms`, `logoutClient`, force-change-password page.
