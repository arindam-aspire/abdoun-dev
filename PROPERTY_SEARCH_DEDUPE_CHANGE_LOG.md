# Property Search Dedupe — Change Log

## 1. Executive Summary

Duplicate `GET /properties` calls from the property search flow are reduced by:

1. **Normalized query keys** so equivalent query strings (e.g. different parameter order) dedupe consistently.
2. **`fetchProperties` thunk `condition`** that skips dispatch when the same normalized key is already **in flight** or already **succeeded** with no error (so intentional re-fetch after a failure is still allowed).

No backend, URL param names, pagination normalization, or API client behavior was changed.

---

## 2. Files Changed

| File | Change | Reason |
|------|--------|--------|
| `src/features/property-search/utils/queryStringBuilder.ts` | Added `normalizePropertySearchQueryKey` | Stable string key for dedupe (sorted `URLSearchParams` entries). |
| `src/features/property-search/propertySearchSlice.ts` | `inFlightQueryKey`, `lastSuccessfulQueryKey`, thunk `condition`, reducer updates | Skip redundant in-flight and duplicate successful same-query fetches; handle `meta.condition` aborted `rejected`. |
| `src/__tests__/queryStringBuilder.test.ts` | Tests for normalization | Regression coverage for key stability. |
| `PROPERTY_SEARCH_DEDUPE_CHECKLIST.md` | Checklist | Phase tracking. |
| `PROPERTY_SEARCH_DEDUPE_CHANGE_LOG.md` | This file | Documentation. |

`usePropertySearch.ts` was left with the same `dispatch(fetchProperties(requestQuery))` + `[dispatch, requestQuery]` effect; dedupe is enforced in the thunk.

---

## 3. Query Key Strategy

- **Input:** Raw query string built by `buildPropertySearchRequestQuery` (unchanged).
- **Normalization:** Parse with `URLSearchParams`, sort entries by key with `localeCompare`, re-serialize with `URLSearchParams`. Optional leading `?` is stripped before parsing.
- **Page / pageSize:** Remain ordinary query params, so pagination and page-size changes produce different keys.
- **Empty values:** Empty keys are not special-cased; behavior matches whatever the builder emits (same as before for the wire format).

The **HTTP request** still uses the **raw** `queryString` argument passed to `searchPropertiesByQuery`, not the normalized key.

---

## 4. Thunk Condition

- **Skip** if `normalizePropertySearchQueryKey(queryString) === inFlightQueryKey` (duplicate while the first request is still running).
- **Skip** if normalized key equals `lastSuccessfulQueryKey` **and** `error === null` (already have a successful result for this search and no error state).
- **Do not skip** when `error !== null`, so the same query can be requested again after a failed load.
- On **pending:** set `inFlightQueryKey` to the normalized key (and `lastQuery` to the raw arg, as before).
- On **fulfilled:** clear `inFlightQueryKey`, set `lastSuccessfulQueryKey` to the normalized key.
- On **rejected:** clear `inFlightQueryKey`; if `action.meta.condition` is set (thunk aborted by `condition`), return early and do not clear results or set an error.

---

## 5. Hook / URL Behaviour

- **`usePropertySearch`:** Unchanged effect contract: dispatches when `requestQuery` from `buildPropertySearchRequestQuery` changes.
- **URL / params:** No changes; canonical keys remain `budgetMin`, `budgetMax`, `page`, `pageSize`, etc., per existing builder.

---

## 6. Validation Results

| Command | Result |
|---------|--------|
| `npm test` | **PASS** — 21 suites, 58 tests |
| `npm run build` | **PASS** |
| `npm run lint` | **Exit code 1** — existing project issues elsewhere; **no new findings** on `propertySearchSlice.ts` or `queryStringBuilder.ts` |

---

## 7. Manual Smoke Test Checklist

Recommended checks in the browser (not automated here):

1. [ ] Initial search-result load issues one `GET /properties` (or one per distinct query) for the same params.
2. [ ] Hard refresh on the same search URL does not spam duplicate same-key requests.
3. [ ] Changing **page** issues a new request.
4. [ ] Changing **pageSize** issues a new request.
5. [ ] Changing filters (location, type, budget, etc.) issues a new request.
6. [ ] Rapid identical dispatches (e.g. Strict Mode / double effect) do not multiply in-flight calls for the same key.
7. [ ] Results, loading skeleton, error, and empty states still behave as before.
8. [ ] Localized routes (`/en/...`, `/ar/...`) search still works.

---

## 8. Remaining Risks / Follow-ups

- **Logout / account switch:** `propertySearch` slice is not reset on logout; a long-lived SPA session could theoretically skip a fetch if another user’s session reused the same normalized URL by coincidence. Risk is low; a future improvement could reset search dedupe state on logout if needed.
- **Manual “refresh same query”:** There is no explicit refresh control; after success, the same query is intentionally not refetched until params change or an error clears the success path.
- **Out of scope (unchanged):** Admin sidebar, recent views, similar properties, taxonomy, auth, and HTTP clients.
