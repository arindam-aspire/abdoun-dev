# Agent Listings, Inquiries & Leads Frontend Refactor Guide

## 1. Current Implementation

The Agent Listings, Inquiries & Leads feature is implemented across:

- **Pages**:
  - `src/app/[locale]/(agent)/agent-properties/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`.
  - `src/app/[locale]/(agent)/agent-dashboard/inquiries/page.tsx`, `leads/page.tsx`, `listings/page.tsx`.
- **Components**:
  - `src/components/agent/AgentProperties.tsx`.
  - `src/components/agent/properties/AgentSearch.tsx`, `AgentSearchResults.tsx`, `AgentPropertyEdit.tsx`.
  - `src/components/agent/lead-inquiries/LeadInquiriesPage.tsx`, `LeadInquiryDetailModal.tsx`.
  - `src/components/agent/AgentListingsPage.tsx`.
- **Data**:
  - Agent-specific listing and inquiry data come from services or mock data, separate from public search endpoints.

These pages allow agents to:

- Search and manage their own properties.
- View and edit specific properties.
- See leads and inquiries in an inbox-style view.

## 2. Problems Identified

From the audit and plan:

- **Scattered API usage**:
  - Agent-oriented property and inquiry calls are separate from the public search/property APIs and may be defined ad hoc.
- **State management**:
  - Lists and filters for agent-specific views might not use a consistent pattern, and RTK Query is not yet in place.
- **UI reuse**:
  - Agent property cards and tables are related to public search/result components but may duplicate logic and styling.

## 3. Refactor Objectives

- Introduce dedicated **agent-properties** and **agent-inquiries** API modules.
- Align list and filter behavior with the patterns used in the public search feature.
- Prepare for scalable data loading using RTK Query or similar, while preserving current behavior.

## 4. Proposed Folder Structure

```text
src/
  features/
    agent-properties/
      api/
        agentProperties.api.ts
      hooks/
        useAgentPropertiesSearch.ts
      components/
        AgentPropertiesPage.tsx
        AgentPropertyList.tsx
        AgentPropertyEdit.tsx
      types.ts
    agent-inquiries/
      api/
        agentInquiries.api.ts
      hooks/
        useAgentInquiries.ts
      components/
        LeadInquiriesPage.tsx
        LeadInquiryDetailModal.tsx
      types.ts
```

Benefits:

- Clear separation of agent-specific concerns from public search and admin views.
- A consistent API and state pattern helps with testing and future expansion.

## 5. What Will Change

| Area       | Current                                          | After Refactor                                           |
| ---------- | ------------------------------------------------ | -------------------------------------------------------- |
| API Calls  | Likely spread across services and components     | Centralized in `agentProperties.api.ts`, `agentInquiries.api.ts` |
| State      | Mixed local and slice-based state                | Managed via feature hooks and, optionally, RTK Query     |
| Components | Pages mix layout, queries, and rendering         | Pages orchestrate; lists and tables live in components   |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Extract Agent Properties API Module

- Create `agentProperties.api.ts`:
  - Wrap existing functions that fetch agent-specific listings and details.
  - Ensure URLs, params, and responses remain unchanged.
- Update agent property pages to import and call this module via hooks or thunks rather than directly using services.

### Step 2 — Extract Agent Inquiries API Module

- Create `agentInquiries.api.ts`:
  - Wrap existing inquiry and lead fetching functions.
  - Expose functions like `fetchAgentInquiries(filters)` and `fetchLeadsOverview()`.

### Step 3 — Add Agent-Specific Hooks

- Implement:
  - `useAgentPropertiesSearch` to manage:
    - Filters.
    - Pagination.
    - Loading and error states for agent properties.
  - `useAgentInquiries` to manage inquiry list data and selection for detail modal.
- Refactor pages and list components to use these hooks instead of embedding logic.

### Step 4 — Align UI With Search & Dashboard Patterns

- Reuse shared list, table, and filter components from:
  - Property Search & Results.
  - Agent Dashboard & Analytics.
- Maintain the same fields, columns, and filter controls, but centralize layout and styling in shared UI components when editing.

### Step 5 — Prepare for RTK Query (Optional, Non-Breaking)

- Introduce optional RTK Query endpoints for agent properties and inquiries:
  - Keep existing thunk-based callers and services working.
  - Wire new components or hooks to RTK Query incrementally.

### Step 6 — Tests & Quality Gates

- Add tests for:
  - `useAgentPropertiesSearch` (pagination, filters).
  - `useAgentInquiries` (loading, error, detail selection).
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- All agent-specific endpoints must remain unchanged.
- Do not add new parameters or change payload shapes when wrapping these calls.
- New API modules are thin wrappers around existing HTTP clients.

## 8. UI Behavior Safety Rules

- Preserve:
  - Which properties appear on each agent page for given filters.
  - The ability to edit properties via existing forms and workflows.
  - The appearance and content of inquiry lists and detail modals.

## 9. Testing Checklist

- Agent properties:
  - Search, filter, pagination, and editing work as before.
- Agent inquiries:
  - Lists display the same inquiries, and detail modals show the same information.

## 10. Dependencies With Other Modules

- **Agent Dashboard & Analytics module**:
  - Uses KPIs and quick links that land on these pages.
- **Authentication & Access module**:
  - Ensures only `agent` role users reach these views via guards and middleware.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

