# Agent Dashboard & Analytics Frontend Refactor Guide

## 1. Current Implementation

The Agent Dashboard & Analytics feature is implemented across:

- **Pages**: `src/app/[locale]/(agent)/agent-dashboard/page.tsx`, `trends/page.tsx`, `view-rate/page.tsx`, `leads/page.tsx`, `inquiries/page.tsx`, `listings/page.tsx`.
- **Components**:
  - `src/components/dashboard/AgentDashboardHome.tsx` – main overview dashboard.
  - `src/components/agent/AgentTrendsPage.tsx` – inquiry trends.
  - Chart components: `InquiryTrendLineChart.tsx`, `PerformanceBarChart.tsx`, and related chart utilities.
- **Data**:
  - Mock dashboard data is provided via `src/services/agentDashboardMockService.ts`.

The dashboard:

- Displays metric cards (listings, leads, deals, property views).
- Renders charts showing inquiry trends and property performance.
- Exposes quick actions linking to agent properties, inquiries, and leads pages.

## 2. Problems Identified

From the audit and plan:

- **Uncaught promises**:
  - `AgentDashboardHome` calls mock services via `Promise.all` inside `useEffect` without a `.catch`, risking unhandled promise rejections.
- **Monolithic components**:
  - Dashboard overview mixes layout, data fetching, and chart wiring.
- **Limited reuse**:
  - Charts and metric cards are strongly tied to this page, but admin dashboard also needs similar components.

## 3. Refactor Objectives

- Introduce a **feature API module** for dashboard data to support eventual backend integration.
- Split the dashboard page into **reusable UI building blocks** (cards, chart containers).
- Centralize error handling and loading behavior for metrics and charts.

## 4. Proposed Folder Structure

```text
src/
  features/
    agent-dashboard/
      api/
        agentDashboard.api.ts
      hooks/
        useAgentDashboard.ts
      components/
        AgentDashboardPage.tsx
        AgentDashboardMetrics.tsx
        AgentDashboardCharts.tsx
      types.ts
  components/
    ui/
      dashboard/
        MetricCard.tsx
        ChartContainer.tsx
```

Benefits:

- Clear separation between data (API + hooks) and presentation (dashboard UI).
- Shared dashboard UI primitives for both agent and admin dashboards.

## 5. What Will Change

| Area       | Current                                          | After Refactor                                              |
| ---------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Components | `AgentDashboardHome` handles everything          | `AgentDashboardPage` composes metrics and charts components |
| API Calls  | Mock services called directly in components      | `agentDashboard.api.ts` and `useAgentDashboard` manage data |
| Errors     | Unhandled fetch errors possible                  | Standardized error handling and fallback UI                 |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Create Agent Dashboard API Module

- Implement `src/features/agent-dashboard/api/agentDashboard.api.ts`:
  - Wrap existing mock service functions (`getDashboardData`, `getPerformanceComparison`) and expose them with identical semantics.
- Update `AgentDashboardHome` to import and call this module, not the mock service directly.

### Step 2 — Introduce useAgentDashboard Hook

- Create `useAgentDashboard.ts`:
  - Manage loading, error, and data state for agent dashboard metrics and charts.
  - Internally call the new API module; catch errors and provide a stable interface to components.
- Refactor `AgentDashboardHome` to use this hook instead of handling promises inside `useEffect`.

### Step 3 — Extract Dashboard UI Components

- Introduce `MetricCard` and `ChartContainer` in `src/components/ui/dashboard/`:
  - Move repeated layout/styling code out of agent-specific components.
  - Maintain the same look and feel.
- Adapt agent dashboard components to use these primitives.

### Step 4 — Share With Admin Dashboard (Non-Breaking)

- Refactor admin dashboard components (`AdminDashboardHome.tsx`) to reuse the shared UI where it makes sense.
- Keep admin-specific fields and panels intact.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `useAgentDashboard` loading and error handling.
  - Chart components rendering baseline data.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- `agentDashboard.api.ts` must:
  - Use the same mock data and, later, same external endpoints as existing code.
  - Not change request/response structures.
- When connecting to a real backend, keep the wrapper functions’ signatures stable and adapt internal mapping only.

## 8. UI Behavior Safety Rules

- Preserve:
  - All metric values and labels.
  - Chart configurations and visuals.
  - Links and quick actions to other agent pages.
  - Loading spinners and any current error messages.

## 9. Testing Checklist

- Dashboard overview:
  - Renders metric cards and charts with the same initial data.
  - Handles simulated errors gracefully (if introduced for testing).
- Trends and performance subpages:
  - Continue to display charts and labels as before.

## 10. Dependencies With Other Modules

- **Agent Properties module**:
  - Linked from dashboard quick actions.
- **Agent Listings and Inquiries modules**:
  - Use metrics and links surfaced by the dashboard.
- **Admin Dashboard module**:
  - Can reuse UI primitives developed here for consistency.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

