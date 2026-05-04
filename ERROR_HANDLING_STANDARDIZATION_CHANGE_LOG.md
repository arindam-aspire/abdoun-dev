# Error handling standardization — change log

## 1. Executive summary

Frontend error handling is aligned around **`getApiErrorMessage`** from `@/lib/http/apiError`, plus a new **`getThunkRejectedMessage`** helper for Redux Toolkit rejected actions. Redux **`extraReducers`** no longer read raw **`action.error.message`** (which is often the generic `"Rejected"` when using `rejectWithValue`). Auth signup **409** handling and listing-delete **status-specific** messages are unchanged by design. API helpers that catch and rethrow now preserve the original error via **`{ cause: error }`**.

---

## 2. Standard error handling policy

| Layer | Pattern |
|-------|---------|
| **Thunk body** | `catch (error) { return rejectWithValue(getApiErrorMessage(error)); }` (already standard; unchanged). |
| **Thunk rejected state** | `getThunkRejectedMessage(action, "…fallback…")` — prefers string payload, then meaningful serialized error message, skips placeholder `"Rejected"`. |
| **Components / forms** | `getApiErrorMessage(error)` (with existing copy fallbacks where product requires `|| "…"`). |
| **Special cases** | Branch on **HTTP status** or **field-level** API shapes first; use **`getApiErrorMessage`** for the generic path or fallback text. |
| **API catch + rethrow** | `throw new Error(getApiErrorMessage(error), { cause: error });` |

---

## 3. Files updated

| File | Previous pattern | New pattern | Notes |
|------|------------------|-------------|--------|
| `src/lib/http/apiError.ts` | Single-path extraction | Handles **string** errors; **`Error`**, then plain **`{ message }`** (e.g. serialized errors); adds **`getThunkRejectedMessage`**. | Supports RTK `unwrap()` strings and `SerializedError`. |
| `src/features/admin/dashboard/adminDashboardSummarySlice.ts` | `payload \|\| action.error.message \|\| fallback` | **`getThunkRejectedMessage`** | |
| `src/features/admin/dashboard/adminUserGrowthTrendsSlice.ts` | Same | **`getThunkRejectedMessage`** | |
| `src/features/agent/dashboard/agentDashboardSummarySlice.ts` | Same | **`getThunkRejectedMessage`** | |
| `src/features/admin/adminAgentsSlice.ts` | `payload \|\| fallback` only | **`getThunkRejectedMessage`** | Summary, list, invite errors. |
| `src/features/admin-users/adminUsersSlice.ts` | `payload \|\| fallback` | **`getThunkRejectedMessage`** | |
| `src/features/property-search/propertySearchSlice.ts` | Same | **`getThunkRejectedMessage`** | |
| `src/features/property-details/propertyDetailsSlice.ts` | Same | **`getThunkRejectedMessage`** | |
| `src/features/exclusive-properties/exclusivePropertiesSlice.ts` | Same | **`getThunkRejectedMessage`** | |
| `src/features/admin/components/AdminAgentActionsMenu.tsx` | Manual `response.data.detail` / `message` | **`getApiErrorMessage`** in `catch` | |
| `src/features/admin/dashboard/components/legacy-pages/AdminUserActionsMenu.tsx` | `typeof err === "string"` | **`getApiErrorMessage(err)`** | |
| `src/features/agent/dashboard/components/AgentDashboardHome.tsx` | `error instanceof Error ? error.message : …` | **`error ?? tAgent(…)`** | `error` is store string; `instanceof` was incorrect. |
| `src/features/agent/dashboard/components/AgentTrendsPage.tsx` | Same | **`error ?? t(…)`** | |
| `src/features/agent/dashboard/hooks/useAgentDashboard.ts` | `error: unknown` | **`error: string \| null`** | Matches actual return value; fixes typing for UI. |
| `src/hooks/useAuthForms.ts` | `error instanceof Error ? error.message : …` | **`getApiErrorMessage`** (+ fallbacks) | **409** signup still reads **`detail`** when present. |
| `src/features/admin/dashboard/api/adminDashboard.api.ts` | `throw new Error(getApiErrorMessage(error))` | Adds **`{ cause: error }`** | 4 catch sites. |
| `src/features/agent/dashboard/api/agentDashboard.api.ts` | Same | **`{ cause: error }`** | 2 sites. |
| `src/features/agent/api/agentOnboardingApiService.ts` | Same | **`{ cause: error }`** | |
| `src/features/admin/api/adminAgentApiService.ts` | Same | **`{ cause: error }`** | `validateInviteToken` only. |
| `ERROR_HANDLING_STANDARDIZATION_CHECKLIST.md` | — | Created | Audit + progress. |

---

## 4. Redux thunks updated

Thunk **`try/catch`** bodies were already using **`getApiErrorMessage`** and **`rejectWithValue`**. This work standardizes **`.rejected`** **`extraReducers`** to **`getThunkRejectedMessage`** in the slices listed in §3.

---

## 5. Components updated

**AdminAgentActionsMenu**, **AdminUserActionsMenu**, **AgentDashboardHome**, **AgentTrendsPage** — see §3. Other components with **`catch`** blocks were not bulk-edited to avoid scope creep and regressions; they can adopt the same pattern incrementally.

---

## 6. Forms / auth exceptions

| Location | Behavior |
|----------|----------|
| **`useAuthForms`** — manual signup | **409**: still prefers **`response.data.detail`** when it is a string; otherwise **`getApiErrorMessage(axiosError)`** then default copy. |
| **`createClient` / session** | Not modified (per project rules). |
| **`profileIdentity` / `getIdentityErrorMessage`** | Unchanged; wraps **`getApiErrorMessage`** where appropriate. |

---

## 7. Upload exceptions

No changes to **S3 presign**, **MediaDocumentsStep**, or **useS3Upload** error strings in this pass — upload-specific messaging preserved.

---

## 8. Validation results

```bash
npm test   # pass (21 suites, 56 tests)
npm run build   # pass
npm run lint   # fail — many pre-existing issues (e.g. react-hooks/set-state-in-effect on AgentDashboardHome, tests `any`, etc.)
```

Lint still reports **`react-hooks/set-state-in-effect`** on **`AgentDashboardHome`** (and similar patterns elsewhere); those predate this change. **`AdminAgentActionsMenu`** still has an **`exhaustive-deps`** warning on a `useMemo`.

---

## 9. Remaining risks / follow-ups

1. **`getApiErrorMessage` + `|| "fallback"`** — The helper always returns a non-empty string today, so **`||`** only distinguishes from empty string (not used). Fallbacks remain for product copy consistency.
2. **Broader component sweep** — Many **`catch`** blocks in profile, settings, and admin property submissions still use ad hoc parsing; migrate opportunistically.
3. **Tests** — Consider a small unit test file for **`getThunkRejectedMessage`** (payload vs `"Rejected"` vs fallback) if regressions become a concern.
