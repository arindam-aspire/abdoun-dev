# Property Search Dedupe Checklist

## Phase 0 — Current Flow Review
- [x] Search query creation reviewed (`buildPropertySearchRequestQuery` → URLSearchParams string; sort/view stripped; page + pageSize enforced)
- [x] `fetchProperties` thunk reviewed (string arg, no `condition`; `lastQuery` set on pending only)
- [x] Existing search slice state reviewed (`items`, `total`, `page`, `pageSize`, `loading`, `error`, `lastQuery`)
- [x] URL sync behaviour reviewed (`useSearchFilters` + `usePropertySearch`; canonical `budgetMin` / `budgetMax` / `page` / `pageSize`)
- [x] Pagination behaviour reviewed (page and pageSize are part of the built query string → part of dedupe key)
- [x] Duplicate-call cause identified (effect re-runs on same `requestQuery`, Strict Mode double effects, no in-flight / success dedupe)

## Phase 1 — Dedupe Design
- [x] Canonical query key strategy selected (sorted `URLSearchParams` entries — stable string for equivalent params)
- [x] In-flight duplicate strategy selected (`inFlightQueryKey` in slice + thunk `condition`)
- [x] Same-result duplicate strategy selected (`lastSuccessfulQueryKey` + `error === null` guard so failed fetches can retry)
- [x] Pagination/page changes preserved as valid fetches (included in normalized key)
- [x] Filter changes preserved as valid fetches (any param change changes key)

## Phase 2 — Implementation
- [x] Query key helper added (`normalizePropertySearchQueryKey` in `queryStringBuilder.ts`)
- [x] Thunk `condition` added
- [x] State updated (`inFlightQueryKey`, `lastSuccessfulQueryKey`)
- [x] Pending / fulfilled / rejected handlers updated
- [x] Hook behaviour preserved (`usePropertySearch` dispatches when normalized key changes; still sends raw `requestQuery` to API)
- [x] URL behaviour preserved (no param renames)

## Phase 3 — Validation
- [x] npm test passed (58 tests)
- [x] npm run build passed
- [x] npm run lint checked (fails repo-wide for pre-existing issues; no new issues in changed search slice/utils)
- [x] Manual search smoke checklist documented (in change log)

## Phase 4 — Documentation
- [x] Change log created (`PROPERTY_SEARCH_DEDUPE_CHANGE_LOG.md`)
- [x] Remaining risks documented
