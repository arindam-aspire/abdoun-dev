# Pagination Full Review — Change Log

**Date:** 2026-05-05  
**Scope:** Frontend-only pagination consistency (per `pagination_full_review_fix_prompt.md`). Backend contracts unchanged.

---

## 1. Executive Summary

Admin and agent property list APIs assumed a nested `pagination` object on the response. Documented wire shapes use **flat** `page`, `pageSize`, `total`, `totalPages`, `hasNext`, `hasPrevious` alongside `items`. When `pagination` was missing, `createPaginatedResult` fell back to the **current page item count** as `total`, collapsing `totalPages` to **1** and breaking the pager.

**Fix:** Central helpers `paginationInputFromListPayload` and `createPaginatedResultFromListWire` in `src/lib/api/pagination.ts` prefer nested `pagination` when present, otherwise read flat fields. Admin submissions + drafts and agent properties + drafts use this normalization.

**UI:** `AdminPropertySubmissionsPage` and `AgentListingsPage` show the pagination footer when the **server reports `total > 0`**, even if client-side search/period filters remove all rows on the current page.

**Build unblock:** Three files imported `getApiErrorMessage` from a non-existent `@/lib/http` barrel; imports now use `@/lib/http/apiError`. Optional second argument `fallback` was added to `getApiErrorMessage` to match existing call sites and satisfy TypeScript.

---

## 2. Files Reviewed

| Area | Files Reviewed | Issue Found? | Action |
|------|----------------|--------------|--------|
| Admin submissions list | `adminPropertySubmissions.api.ts`, `AdminPropertySubmissionsPage.tsx` | Yes — flat wire + footer visibility | Fixed |
| Agent properties list | `agentProperties.api.ts`, `AgentListingsPage.tsx` | Yes — same as admin | Fixed |
| Shared pagination | `pagination.ts` | Missing flat-wire helper | Added helpers + tests |
| Admin agents | `adminAgentApiService.ts` | No — different shape (`agents` + nested `pagination`) | None |
| Admin users | `userService.ts`, `AdminUsersPage.tsx` | No change in pass | None |
| Property search | `propertyService.ts` | Different normalization path | None this pass |
| Auth error helper | `apiError.ts`, `force-change-password/page.tsx`, inquiries pages | Broken import / typings | Fixed |

---

## 3. Files Changed

| File | Change | Reason |
|------|--------|--------|
| `src/lib/api/pagination.ts` | `ListPaginationWire`, `paginationInputFromListPayload`, `createPaginatedResultFromListWire` | Support nested **or** flat list pagination |
| `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts` | Wire types; use `createPaginatedResultFromListWire` for list + drafts | Fix metadata when backend sends flat fields |
| `src/features/agent/dashboard/api/agentProperties.api.ts` | Wire types; same normalization for list + drafts | Same |
| `src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx` | `showWhen: totalItems > 0`; removed unused `FETCH_LIMIT` | Footer when server has rows but filters empty current slice |
| `src/features/agent/dashboard/components/AgentListingsPage.tsx` | `showWhen: listPagination.total > 0` | Same |
| `src/__tests__/pagination.test.ts` | New tests for helpers | Regression guard |
| `src/lib/http/apiError.ts` | Optional `fallback` on `getApiErrorMessage` | Align with 2-arg call sites |
| `src/app/[locale]/(auth)/force-change-password/page.tsx` | Import from `@/lib/http/apiError` | Fix missing module |
| `src/features/agent/dashboard/components/AgentInquiriesPage.tsx` | Import from `@/lib/http/apiError` | Fix missing module |
| `src/features/agent/dashboard/components/lead-inquiries/LeadInquiriesPage.tsx` | Import from `@/lib/http/apiError` | Fix missing module |

---

## 4. Response Shape Fixes

- **Nested `pagination`:** Still preferred when present (backward compatible).
- **Flat fields on list payload:** `page`, `pageSize`, `total`, `totalPages`, `hasNext`, `hasPrevious` are merged into the normalizer input when `pagination` is absent.
- **TypeScript:** `AdminSubmissionListWire` / draft wire / agent property wire types describe the peeled API body; exported `AdminSubmissionListResponse` remains `PaginatedResult<...>` (normalized return).

---

## 5. UI Pagination Fixes

- **Footer visibility:** Based on **server `total > 0`**, not `filteredRows.length > 0`.
- **Client-only search/period:** Still applied only to the **current server page** of `items`. Footer “Showing X–Y of Z” remains **server-total semantics** when filters are active — users can still flip pages or clear filters. **No new API params** were added (per instructions).

---

## 6. Validation Results

```bash
npm test   # 22 suites, 62 tests — pass (includes new pagination tests)
npm run build   # pass
npm run lint   # fails with many pre-existing issues across the repo; no new lint focus on changed pagination files
```

---

## 7. Manual Smoke Test Checklist

- [ ] `/[locale]/admin-dashboard/listings` — change page, change page size, totals look sane
- [ ] Same route — type search / period so current page shows zero rows — pager still visible if `total > 0`
- [ ] `/[locale]/agent-dashboard/listings` — same checks
- [ ] Admin users / agents — quick regression (unchanged code paths)
- [ ] Property search — pagination still works
- [ ] Locale-prefixed URLs — `Pagination` still updates `page` / `pageSize` query params

---

## 8. Remaining Risks / Follow-ups

- **Client filters + server totals** on admin/agent listings can still read as misleading (“of Z” is not “matching filter”). Fixing properly needs **backend search/period** or **client-side-only totals** when filters are active.
- **Legacy mock** `ListingsPage` still uses `showWhen: sortedListings.length > 0` (local mock data only).
- **Favourites / saved searches / recent views** may still use non-standard list shapes (per earlier audit); not modified here.
- **`getApiErrorMessage` fallback** is used only when all extraction paths fail; behavior is backward compatible for single-argument callers.
