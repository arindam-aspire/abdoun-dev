# Admin Agent Management Frontend Refactor Guide

## 1. Current Implementation

The Admin Agent Management feature is implemented across:

- **Page**: `src/app/[locale]/(admin)/agents/page.tsx`.
- **Components**:
  - `src/components/dashboard/AdminAgentsPage.tsx`.
  - `src/components/admin/agents/AdminAgentActionsMenu.tsx`.
- **State**:
  - `src/features/admin-agents/adminAgentsSlice.ts`:
    - Stores paginated agent lists, an aggregated `allItems` collection, and invite/approval states.
- **Services**:
  - `src/services/adminAgentApiService.ts`:
    - Implements invite, approve, decline, delete, and grant-admin access calls to the backend.

The admin agents page allows admins to:

- View agents with pagination and status.
- Invite new agents by email.
- Approve, decline, delete, and grant admin access.

## 2. Problems Identified

From the audit and plan:

- **State shape complexity**:
  - `adminAgentsSlice` manages paging, `allItems`, invite feedback, and actions in one place.
- **UI & error feedback**:
  - Invite and approval flows may handle feedback in ad hoc ways; some toast or inline patterns may not be standardized.
- **Permissions**:
  - UI actions may be tied directly to role checks instead of shared permission utilities.

## 3. Refactor Objectives

- Move all agent management API calls into a feature API module.
- Clarify and document the state shape and paging model.
- Use consistent error and success feedback patterns for admin actions.
- Enforce permissions using shared RBAC helpers without changing visible behavior.

## 4. Proposed Folder Structure

```text
src/
  features/
    admin-agents/
      api/
        adminAgents.api.ts
      store/
        adminAgentsSlice.ts
      hooks/
        useAdminAgents.ts
        useInviteAgent.ts
      components/
        AdminAgentsPage.tsx
        AdminAgentActionsMenu.tsx
      types.ts
```

Benefits:

- Agent list logic becomes testable and well-typed.
- UI components delegate business logic to hooks and slices.

## 5. What Will Change

| Area       | Current                                          | After Refactor                                               |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------ |
| API Calls  | `adminAgentApiService` called directly from slice/components | Centralized `adminAgents.api.ts` wraps all HTTP endpoints    |
| State      | Mixed list, paging, and invite state in slice   | Documented types and hooks manage responsibilities clearly   |
| UI Feedback| Inline `message` management per action          | Shared toaster and error handling per `error-handling-agent` |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Create adminAgents.api.ts

- Wrap all functions currently in `adminAgentApiService.ts`, exposing:
  - `inviteAgentByEmail`, `approveAgent`, `declineAgent`, `deleteAgent`, `grantAdminAccess`, `createAgentManually`, etc.
- Keep:
  - URLs.
  - HTTP methods.
  - Request/response payloads identical.

### Step 2 — Update Slice to Use API Module

- Refactor `adminAgentsSlice.ts` thunks or async flows:
  - Replace direct service calls with calls to `adminAgents.api.ts`.
  - No change to public slice actions or selectors.

### Step 3 — Introduce Hooks for Page and Invite Flows

- `useAdminAgents`:
  - Wraps selectors and dispatches for pagination, status filters, and list updates.
- `useInviteAgent`:
  - Encapsulates the invite flow, including loading and feedback states.
- Update `AdminAgentsPage` and `AdminAgentActionsMenu` to use these hooks.

### Step 4 — Standardize Feedback and Permissions

- Apply `error-handling-agent.mdc`:
  - Use the shared toaster for success/error messages for each action.
- Apply `rbac-permission-agent.mdc`:
  - Wrap destructive actions and admin-only operations with `PermissionGuard`/helper checks.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - Slice behavior (approve, decline, delete, invite).
  - Hooks for invites and approvals.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- All admin agent management endpoints are external and must remain unchanged.
- `adminAgents.api.ts` should only wrap them, not change contracts.

## 8. UI Behavior Safety Rules

- Preserve:
  - Table columns, status display, and pagination behavior.
  - Invite, approve, decline, delete, and grant-admin workflows.
  - Any existing confirmation dialogs or warnings.

## 9. Testing Checklist

- Agents list:
  - Loads and paginates correctly.
- Actions:
  - Invite, approve, decline, delete, and grant admin access work as before.
  - Success and error messages appear in the same scenarios.

## 10. Dependencies With Other Modules

- **Admin Dashboard module**:
  - Moderation and KYC metrics link into this list.
- **Authentication & Access module**:
  - Must ensure only admin users can access these actions and pages.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

