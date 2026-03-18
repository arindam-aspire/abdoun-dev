# Admin Dashboard & Analytics Frontend Refactor Guide

## 1. Current Implementation

The Admin Dashboard & Analytics feature is implemented across:

- **Page**: `src/app/[locale]/(admin)/dashboard/page.tsx`.
- **Components**:
  - `src/components/dashboard/AdminDashboardHome.tsx` – main admin dashboard.
  - Shared chart components used also by the agent dashboard (e.g., `InquiryTrendLineChart.tsx`, `SparkBarsChart.tsx`, `DotLineChart.tsx`).
- **Data**:
  - Mock admin dashboard data via `src/services/adminDashboardMockService.ts`.

The admin dashboard:

- Shows KPIs (users, agents, pending approvals, listings, leads).
- Displays charts for growth and lead volume.
- Renders moderation, lead source quality, and top agent panels.

## 2. Problems Identified

From the audit and plan:

- **Code duplication**:
  - Admin and agent dashboards each implement their own card and panel structures, though they share some underlying chart components.
- **Data access**:
  - Admin dashboard uses a mock service directly, mirroring the agent dashboard approach.
- **RBAC enforcement**:
  - Admin dashboard should use standard role/permission checks, but some are currently tied to cookie-based role checks.

## 3. Refactor Objectives

- Introduce a **feature API module** for admin dashboard data.
- Share **UI primitives** for KPI cards and charts with the agent dashboard.
- Adopt consistent RBAC checks for admin-only access without altering routes or layout.

## 4. Proposed Folder Structure

```text
src/
  features/
    admin-dashboard/
      api/
        adminDashboard.api.ts
      hooks/
        useAdminDashboard.ts
      components/
        AdminDashboardPage.tsx
        AdminDashboardMetrics.tsx
        AdminDashboardPanels.tsx
      types.ts
  components/
    ui/
      dashboard/
        MetricCard.tsx
        ChartContainer.tsx
```

Benefits:

- Reuse metric and chart primitives across admin and agent dashboards.
- Easier to evolve admin analytics without duplicating code.

## 5. What Will Change

| Area       | Current                                        | After Refactor                                               |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Components | `AdminDashboardHome` is a monolithic overview  | `AdminDashboardPage` composes metrics and panel components   |
| API Calls  | Mock service invoked directly in components    | `adminDashboard.api.ts` + `useAdminDashboard` manage data    |
| RBAC       | Tied to cookie-based role checks               | Uses shared RoleGuard/permissions while preserving behavior  |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Create Admin Dashboard API Module

- Implement `adminDashboard.api.ts`:
  - Wrap functions from `adminDashboardMockService.ts`.
  - Keep the same data structures exposed to components.
- Update `AdminDashboardHome` to call the API module instead of the service directly.

### Step 2 — Introduce useAdminDashboard Hook

- Create `useAdminDashboard.ts`:
  - Handles loading, error, and data for KPIs, charts, and panels.
  - Exposes a normalized structure for the UI components.
- Refactor `AdminDashboardHome` to use this hook.

### Step 3 — Share Dashboard UI Primitives

- Reuse `MetricCard` and `ChartContainer` from the agent dashboard’s refactor:
  - Replace inline dashboard card code with these shared components.
  - Keep copy, styling, and layout the same.

### Step 4 — Align RBAC Checks

- Ensure the admin dashboard route:
  - Uses shared RoleGuard or permission checks in layouts, not just middleware cookie checks.
  - Continues to redirect non-admins to the same location as before.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `useAdminDashboard` handling typical and error scenarios.
  - Correct rendering of moderation queues and lead source panels.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Do not change the admin dashboard endpoints, if/when they connect to a real backend.
- Internal mapping from backend responses to UI models remains but may move into `adminDashboard.api.ts` or `types.ts`.

## 8. UI Behavior Safety Rules

- Preserve:
  - KPI card labels, values, and delta displays.
  - Chart shapes, labels, and legend behavior.
  - Moderation queue list fields and statuses.
  - Lead source and top agent panel layouts and metrics.

## 9. Testing Checklist

- Admin dashboard:
  - Renders all KPI cards and panels as before.
  - Charts show the same data using mock or real sources.
- RBAC:
  - Only admin-role users can access the admin dashboard; others see the same redirects/blocks as before.

## 10. Dependencies With Other Modules

- **Admin Agent Management module**:
  - Moderation and KYC panels may link into the admin agents list.
- **Admin Property Management module**:
  - Property approval metrics link to admin property search and detail views.
- **Authentication & Access module**:
  - Must ensure that role/permission checks reflected in the admin dashboard match the access model.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

