# Error Handling Standardization Checklist

## 1. Inventory

- [x] Redux thunks using raw `error.message` — **None in thunk bodies**; several `extraReducers` used `action.error.message` as fallback (admin dashboard, agent dashboard, user growth).
- [x] Components manually parsing Axios errors — **AdminAgentActionsMenu** (`response.data.detail` chain); **AgentListingsPage** / **AddPropertyWizard** use `isAxiosError` for **status-specific** messages (409/404) — **kept** as special cases with `getApiErrorMessage` fallback.
- [x] Forms manually reading `response.data.detail` — **useAuthForms** signup 409 branch uses `detail` explicitly — **kept** for conflict copy; outer catches updated to `getApiErrorMessage`.
- [x] API files throwing inconsistent errors — Several `throw new Error(getApiErrorMessage(error))` without `cause`; aligned to **`{ cause: error }`** where catches wrap.
- [x] Upload flows with custom errors — **MediaDocumentsStep**, **useS3Upload** paths not flattened; preserve upload-specific copy.
- [x] Auth flows with specialized error handling — **409 signup**, **AgentListingsPage** delete status codes — **documented** in change log.
- [x] Existing helpers identified — **`getApiErrorMessage`** (`src/lib/http/apiError.ts`); **`getIdentityErrorMessage`** (profile identity) unchanged.
- [x] Cases intentionally left unchanged documented — See **ERROR_HANDLING_STANDARDIZATION_CHANGE_LOG.md** §6–§7.

## 2. Implementation Plan

- [x] Standard thunk pattern defined — `rejectWithValue(getApiErrorMessage(error))` (already in place); rejected state uses **`getThunkRejectedMessage(action, fallback)`**.
- [x] Standard component async handler pattern — **`getApiErrorMessage(error)`** with existing toast/state; status-specific branches first where needed.
- [x] Standard form submit error pattern — **`getApiErrorMessage(error)`** with preserved field/special cases.
- [x] Standard API-layer throw pattern — **`throw new Error(getApiErrorMessage(error), { cause: error })`** when rethrowing.
- [x] Special auth/upload exceptions documented — In change log.

## 3. Implementation Progress

- [x] Phase 1 completed — Redux thunks / **extraReducers** (`getThunkRejectedMessage`, **`getApiErrorMessage`** improvements).
- [x] Phase 2 completed — **AdminAgentActionsMenu**, **AdminUserActionsMenu**, **AgentDashboardHome**, **AgentTrendsPage**.
- [x] Phase 3 completed — **useAuthForms** (preserve 409 signup handling).
- [x] Phase 4 completed — API layer **`cause`** on rethrow (targeted files).
- [x] Phase 5 completed — **ERROR_HANDLING_STANDARDIZATION_CHANGE_LOG.md**.

## 4. Validation

- [x] `npm test` passed (2026-05-01).
- [x] `npm run build` passed (2026-05-01).
- [x] `npm run lint` checked — **fails** with many pre-existing repo issues; no new errors required fixing in touched files for this task (see change log §8).
