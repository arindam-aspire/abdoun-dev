# Admin `/admin-dashboard/listings` pagination — investigation report

**Date:** 2026-05-05  
**Scope:** Identify why pagination misbehaves on the admin listings route; compare with other paginated screens. **No code changes** in this pass.

---

## 1. What route actually renders

The App Router page at `src/app/[locale]/(admin)/admin-dashboard/listings/page.tsx` renders **`AdminPropertySubmissionsPage`**, not the legacy mock `ListingsPage`.

```1:5:src/app/[locale]/(admin)/admin-dashboard/listings/page.tsx
import { AdminPropertySubmissionsPage } from "@/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage";

export default function AdminListingsRoute() {
  return <AdminPropertySubmissionsPage />;
}
```

All findings below refer to **`AdminPropertySubmissionsPage.tsx`** and **`fetchAdminSubmissions`** in `adminPropertySubmissions.api.ts`.

---

## 2. Likely primary cause: response shape vs normalizer (`pagination` nested vs flat)

### 2.1 What the frontend does today

`fetchAdminSubmissions` always normalizes the list through `createPaginatedResult`, passing **`payload.pagination`** as the pagination input:

```208:222:src/features/admin/dashboard/api/adminPropertySubmissions.api.ts
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await authApi.get<AdminSubmissionListResponse>(
    "/admin/property-submissions",
    {
      params: {
        status: params.status ?? "",
        page,
        pageSize,
        ...(params.include_deleted ? { include_deleted: true } : {}),
      },
    },
  );
  const payload = response.data;
  return createPaginatedResult(payload.items, payload.pagination, { page, pageSize });
```

### 2.2 What project documentation says the wire shape is

`docs/refractor/Pagination/PAGINATION_FE_CLEANUP.md` defines **`AdminSubmissionListResponse`** **without** a nested `pagination` object: `items`, `page`, `total`, `pageSize`, `totalPages`, `hasNext`, `hasPrevious` are **top-level** fields on the response.

If the live backend matches that document, then **`payload.pagination` is `undefined`** at runtime.

### 2.3 How that breaks totals and page count

`createPaginatedResult` delegates to `normalizePagination`. When the pagination argument is missing or empty, **`total` falls through to `itemsLength` (length of the current page’s array)**, not the real dataset total:

```54:66:src/lib/api/pagination.ts
  const totalCandidate =
    toFiniteNumber(input?.total) ??
    toFiniteNumber(input?.totalItems) ??
    toFiniteNumber(input?.count) ??
    toFiniteNumber(fallback.total) ??
    fallback.itemsLength ??
    0;
  const total = Math.max(0, Math.floor(totalCandidate));
  const totalPages = Math.max(
    1,
    Math.floor(
      toFiniteNumber(input?.totalPages) ?? Math.ceil(total / pageSize),
    ),
  );
```

With e.g. 10 rows on the current page and no valid `input`, **`total` becomes 10** and **`totalPages` becomes 1**, regardless of how many submissions exist in the database. Symptoms match “pagination not loading properly”: footer shows a single page, wrong “Showing X–Y of Z”, next page never appears or does nothing useful.

### 2.4 Type vs runtime mismatch

`AdminSubmissionListResponse` is typed as `PaginatedResult<AdminSubmissionListItem>`, i.e. it **claims** there is always a nested `pagination` object. That contradicts the **flat** shape documented in `PAGINATION_FE_CLEANUP.md`, so TypeScript will not flag the bug if the backend only sends top-level fields.

**Recommended verification:** In DevTools → Network, inspect `GET .../admin/property-submissions` JSON. Check whether totals live under `pagination` or on the root. If they are root-only, the normalizer is dropping them.

---

## 3. Secondary UX / logic issues (same page)

These can confuse pagination even when the API is correct.

### 3.1 Server pagination + client-only search and period filters

The list request sends **`status`** to the API, but **`query` (search)** and **`periodFilter`** are applied only in the browser on the **current page’s `items`**:

```294:304:src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx
      const res = await listAdminPropertySubmissions({
        page: currentPage,
        pageSize,
        status: statusFilter,
      });
      setItems(res.items);
      setListPagination(res.pagination);
```

```328:357:src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((row) => {
      if (periodFilter !== "all") {
        // ...
      }
      if (!normalizedQuery) return true;
      // ...
    });
  }, [items, periodFilter, query]);
```

Effects:

- **Row count on screen** can be lower than **pageSize** after filtering, while **“Showing … of Z”** still uses **server `listPagination.total`** (full list for that status, not “matching search”).
- Changing page fetches another **server** slice, then the **same** client filters run again — easy to see “empty” pages that still have a non‑empty total in the footer, or the opposite.

This is the same **pattern** as **`AgentListingsPage`** (server `page`/`pageSize` + local query/period/status filtering). It is not unique to admin listings, but it **does** mean pagination metadata and visible rows can disagree whenever search/period are used.

### 3.2 Hiding pagination when the filtered view is empty

Pagination is only mounted when there is at least one row **after** client filtering:

```887:890:src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx
          pagination={{
            // Show the footer whenever we have results, even if it is a single page,
            // so the "Showing X–Y of Z results" line matches the agent listings table.
            showWhen: !loading && !error && paginatedRows.length > 0,
```

If the user filters so that **all rows on the current API page** are removed, **`paginatedRows.length === 0`** → pagination disappears entirely, even if the server reports more pages. That can look like “pagination broke.”

---

## 4. Comparison across other pages (how pagination is driven)

| Area | Component / API | How `total` / `totalPages` are obtained | Notes |
|------|-----------------|------------------------------------------|--------|
| **Admin listings (this bug report)** | `AdminPropertySubmissionsPage` + `fetchAdminSubmissions` | From `res.pagination` after `createPaginatedResult(..., payload.pagination, ...)` | If wire shape is flat, meta is wrong (section 2). |
| **Agent listings** | `AgentListingsPage` + `fetchAgentProperties` | `setListPagination(propertiesRes.pagination)` | API uses same `createPaginatedResult(payload.items, payload.pagination, ...)`; **also** vulnerable to flat-vs-nested mismatch, with the same client-filter caveats (section 3). |
| **Admin agents** | `AdminAgentsPage` + `listAdminAgents` | Redux slice; `createPaginatedResult(items, payload.pagination, ...)` | Backend contract in docs still uses a **`pagination` sub-object** for agents; if aligned, works. |
| **Admin users** | `AdminUsersPage` + `fetchAdminUsers` | Heuristic: `listTotal`, `hasNextPage`, `Math.ceil(totalItems / pageSize)` | Different pattern; documented as “legacy inference” in `API_HANDLING_AUDIT_REPORT.md`. |
| **Admin view rate** | `AdminViewRatePage` | Uses API + local state (`totalCount`, etc.) | Standalone `Pagination` usage with URL params. |
| **Legacy mock listings** | `ListingsPage` (agent mock) | Pure client: slice full in-memory list | Not used for admin route; different semantics. |
| **Property search (admin)** | `AdminSearchResults` | Search URL + API | Separate flow. |

**Takeaway:** Admin submissions and agent properties lists are **coupled to the same normalization helper** and the same assumption about **`payload.pagination`**. Agents directory is documented with an explicit nested `pagination` object. **Submissions vs agents may legitimately differ on the wire**; the submissions path does not currently map flat fields into `normalizePagination`.

---

## 5. Minor note

`FETCH_LIMIT = 200` is declared in `AdminPropertySubmissionsPage.tsx` but **not referenced** anywhere in that file (dead constant). It does not explain pagination by itself but suggests an incomplete or abandoned fetch strategy.

---

## 6. Suggested next steps (for a fix pass — not done here)

1. **Confirm actual JSON** for `GET /admin/property-submissions` (nested `pagination` vs flat fields).  
2. If flat: **map root-level `total`, `page`, `pageSize`, `totalPages`, `hasNext`, `hasPrevious`** into `createPaginatedResult` (or build `PaginationMeta` explicitly), and align `AdminSubmissionListResponse` TypeScript with the wire.  
3. Decide product behavior for **search/period**: push to API (consistent totals) or keep client-only and adjust footer copy / hide totals / or fetch-all when filters active.  
4. Revisit **`showWhen`** so users can still change page when the current slice filters to zero rows (if product requires it).

---

## 7. References in repo

- `src/features/admin/dashboard/components/property-submissions/AdminPropertySubmissionsPage.tsx` — UI, URL `page` / `pageSize`, filters, `CustomTable` pagination props.  
- `src/features/admin/dashboard/api/adminPropertySubmissions.api.ts` — `fetchAdminSubmissions` / `listAdminPropertySubmissions`.  
- `src/lib/api/pagination.ts` — `createPaginatedResult` / `normalizePagination` fallback behavior.  
- `docs/refractor/Pagination/PAGINATION_FE_CLEANUP.md` — intended **`AdminSubmissionListResponse`** shape (flat).  
- `API_HANDLING_AUDIT_REPORT.md` — broader pagination inventory and “mixed models” note.
