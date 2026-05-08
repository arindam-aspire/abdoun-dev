# Lead Management Audit Report (Current State)

Last updated: 2026-05-06  
Repo: `abdoun_website`

## Scope

This document audits the **current frontend implementation and user/data flow** for Lead Management:

- **Admin leads management UI** (list, status update, manual lead creation, reassignment, close decision)
- **Agent leads management UI** (list, status update, reply, internal notes CRUD)
- **Public/consumer entry point** that creates leads (contact/inquiry form modal)
- **Legacy lead inquiries UI** still present in the codebase (not the same system as current lead management)

This audit is based on the code in:

- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/api/leadApiService.ts`
- `src/types/lead.ts`
- `src/features/property-search/components/modals/EmailAgentModal.tsx`
- `src/components/layout/sidebar.config.ts`
- Legacy: `src/features/agent/dashboard/components/lead-inquiries/*` and `src/features/agent/api/mocks/leadInquiriesMockService.ts`

## Executive summary (what exists today)

- **Unified leads UI**: `LeadManagementPage` is used for both Admin and Agent modes.
- **Real API-backed leads service**: `leadApiService.ts` calls role-scoped endpoints under `/admin/leads`, `/agent/leads`, plus `/leads/contact-form`.
- **Lead lifecycle model**: `LeadStatus = NEW → IN_PROGRESS → REQUEST_FOR_CLOSE → CLOSED` (with role-based transitions).
- **Lead creation (public)**: a signed-in, registered user can submit an inquiry via `EmailAgentModal`, which calls `POST /leads/contact-form`.
- **Legacy inquiries UI still exists**: `LeadInquiriesPage` uses a **mock service** and does not integrate with the real leads API.

## Primary routes and navigation

### App routes

- **Admin Leads**: `src/app/[locale]/(admin)/leads/page.tsx`  
  Renders `<LeadManagementPage mode="admin" />`

- **Agent Leads**: `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`  
  Renders `<LeadManagementPage mode="agent" />`

- **Agent “Leads and Inquiries”**: `src/app/[locale]/(agent)/agent-dashboard/leads-and-inquiries/page.tsx`  
  Currently renders `<LeadManagementPage mode="agent" />` (i.e., it is effectively an alias/redirect to the new page)

### Sidebar navigation

In `src/components/layout/sidebar.config.ts`:

- Sidebar item `leadsAndInquiries` points agents to `/agent-dashboard/leads-and-inquiries`
- `adminPath` for that item is `/leads` (which corresponds to the admin leads route under the admin layout)

## Data model (frontend types)

From `src/types/lead.ts`:

### Core entities

- **Lead**
  - `id`
  - `propertyId` (nullable)
  - `userId` (nullable)
  - `status`: `NEW | IN_PROGRESS | REQUEST_FOR_CLOSE | CLOSED`
  - `source`: `EMAIL_FORM | PHONE | WHATSAPP | MANUAL_ADMIN`
  - `assignedAgentId` (nullable)
  - `assignedByAdminId` (nullable)
  - `message` (nullable)
  - `lastActivityAt`, `requestCloseAt`, `closedAt` (nullable timestamps)
  - `closedByAdminId` (nullable)
  - `createdAt`, `updatedAt`

- **LeadNote**
  - `id`, `leadId`
  - `authorUserId` (nullable)
  - `note`, `createdAt`, `updatedAt`

- **LeadReply**
  - `id`, `leadId`
  - `senderUserId`, `recipientUserId` (nullable)
  - `message`, `channel`, `deliveryState`, `createdAt`

### List/pagination contracts

- `LeadListResponse` is paginated: `{ items, total, page, pageSize }`
- `LeadListParams` supports filtering: `status`, `source`, `page`, `pageSize`

## API integration (frontend service calls)

All “current” leads API calls are implemented in `src/features/leads/api/leadApiService.ts` and use `authApi`.

### Public lead creation

- `POST /leads/contact-form`  
  `createContactLead(payload: ContactFormLeadCreatePayload)`

### Agent endpoints

- `GET /agent/leads` (paginated/filterable)  
  `getAgentLeads(params?: LeadListParams)`

- `GET /agent/leads/:leadId`  
  `getAgentLeadDetail(leadId)`

- `PATCH /agent/leads/:leadId/status`  
  `updateAgentLeadStatus(leadId, { status, reason? })`

- `POST /agent/leads/:leadId/reply`  
  `replyToAgentLead(leadId, { message })`

- `POST /agent/leads/:leadId/notes`  
  `createAgentLeadNote(leadId, { note })`

- `PATCH /agent/leads/:leadId/notes/:noteId`  
  `updateAgentLeadNote(leadId, noteId, { note })`

- `DELETE /agent/leads/:leadId/notes/:noteId`  
  `deleteAgentLeadNote(leadId, noteId)`

### Admin endpoints

- `GET /admin/leads` (paginated/filterable)  
  `getAdminLeads(params?: LeadListParams)`

- `POST /admin/leads`  
  `createAdminLead(payload: AdminManualLeadCreatePayload)`

- `PATCH /admin/leads/:leadId/reassign`  
  `reassignAdminLead(leadId, { assignedAgentId })`

- `PATCH /admin/leads/:leadId/status`  
  `updateAdminLeadStatus(leadId, { status, reason? })`

- `POST /admin/leads/:leadId/close-decision`  
  `adminCloseDecision(leadId, { status, reason? })`

## Current lead lifecycle and role-based state transitions

### Status values (current system)

`NEW → IN_PROGRESS → REQUEST_FOR_CLOSE → CLOSED`

### Agent transitions (implemented in UI logic)

In `LeadManagementPage.tsx`:

- `NEW` can move to `IN_PROGRESS`
- `IN_PROGRESS` can move to `REQUEST_FOR_CLOSE`
- No agent-driven transitions exist beyond `REQUEST_FOR_CLOSE` (agent cannot close directly)

### Admin transitions (implemented in UI logic)

- Admin can close when status is `REQUEST_FOR_CLOSE`
- Admin can also update status via `PATCH /admin/leads/:leadId/status` (UI exposes limited actions for admin in the current component; see gaps below)

## Frontend implementation flow (current system)

### A) Public “Contact / Email Agent” → lead creation

Component: `src/features/property-search/components/modals/EmailAgentModal.tsx`

Flow:

1. User opens modal from a property/listing context (receives `listing` and optional `propertyId`).
2. On submit:
   - Requires **signed-in user** (`selectCurrentUser`)
   - Requires **registered frontend role** (`isRegisteredFrontendUserRole`)
   - Validates fields (name/email/phone/message) with length + regex constraints
3. Calls `createContactLead()` → `POST /leads/contact-form`
4. On success: shows a success toast and closes the modal

Notes:

- The checkbox “keep me informed” is currently **UI-only**; it is not sent in the payload.
- `propertyId` used for the payload is `propertyId ?? String(listing.id)`.

### B) Agent lead management (list → open detail → act)

Page: `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`  
Component: `LeadManagementPage` with `mode="agent"`

List view:

- Query params drive list state:
  - `status`, `source`, `page`, `pageSize`
- Calls `getAgentLeads({ page, pageSize, status?, source? })`
- Renders a table and `Pagination` component.

Detail view (Dialog):

- When user clicks “Open”, sets `selectedId`
- Fetches detail with `getAgentLeadDetail(selectedId)`
- Agent actions:
  - **Status transition**: `PATCH /agent/leads/:id/status`
  - **Reply**: `POST /agent/leads/:id/reply`
  - **Notes**:
    - Create: `POST /agent/leads/:id/notes`
    - Update: `PATCH /agent/leads/:id/notes/:noteId`
    - Delete: `DELETE /agent/leads/:id/notes/:noteId`

### C) Admin lead management (list → open detail → act)

Page: `src/app/[locale]/(admin)/leads/page.tsx`  
Component: `LeadManagementPage` with `mode="admin"`

List view:

- Same query param model as Agent mode
- Calls `getAdminLeads({ page, pageSize, status?, source? })`

Admin actions in the current UI:

- **Create manual lead** (dialog):
  - Inputs: `propertyId`, `assignedAgentId`, `source` (PHONE/WHATSAPP/MANUAL_ADMIN), `message`, optional `contactUserId`
  - Calls `POST /admin/leads`
- **Reassign lead** (in detail dialog):
  - Takes a raw agent id string
  - Calls `PATCH /admin/leads/:id/reassign`
- **Close decision** (when status is `REQUEST_FOR_CLOSE`):
  - Calls `POST /admin/leads/:id/close-decision` with `{ status: "CLOSED" }`
- **Status update**:
  - `onStatusChange` calls `PATCH /admin/leads/:id/status` but the currently computed `availableStatusActions` for admin is limited (see gaps).

## Legacy lead inquiries (separate system)

There is an older “Lead Inquiries” implementation under:

- `src/features/agent/dashboard/components/lead-inquiries/*`

Key points:

- It uses `src/features/agent/api/mocks/leadInquiriesMockService.ts` which is an in-memory mock store.
- Status values there are **different**: `"new" | "contacted" | "closed"`
- Sources are **different**: `"contact_form" | "email" | "phone" | "whatsapp"`
- This legacy system supports filters (period/month/source/status), notes, responses, and status updates — but all mocked.

In navigation, agents see “Leads and Inquiries” but that currently renders the **new** `LeadManagementPage`, not the legacy inquiries UI.

## Findings (implementation gaps / risks / inconsistencies)

### 1) Admin detail fetch uses agent endpoint

In `LeadManagementPage.tsx`, the detail fetch is always:

- `getAgentLeadDetail(selectedId)`

Even when `mode === "admin"`.

**Risk**: If the backend enforces role-based access strictly, admin users may fail to load lead detail (or load a different projection than intended). If there is an intended admin detail endpoint (e.g. `/admin/leads/:id`), it is not used here.

### 2) Admin reply uses agent endpoint

The “Reply” action calls:

- `replyToAgentLead(selected.id, ...)` → `/agent/leads/:id/reply`

Even in Admin mode. If admins should be able to reply, this likely needs an admin endpoint or different behavior.

### 3) Notes are never loaded in the current leads detail dialog

`LeadManagementPage` maintains `notes: LeadNote[]`, but there is **no call** that fetches notes when a lead is opened.

As implemented:

- Notes only appear in the UI if they are created in the current session in that dialog.
- Editing assumes existing notes are already present in state.

**Impact**: Notes UX will feel broken/incomplete for existing leads.

### 4) Admin status actions are inconsistent/duplicated

Admin close is represented in two ways:

- `availableStatusActions` includes `["CLOSED"]` when status is `REQUEST_FOR_CLOSE`
- UI also conditionally renders a separate “Close decision” button that calls `adminCloseDecision()`

Additionally:

- `onStatusChange()` for admin uses `updateAdminLeadStatus()` (PATCH)  
  but “Close decision” uses `adminCloseDecision()` (POST)

**Risk**: Multiple code paths for effectively the same outcome can drift and cause inconsistent backend audit trails.

### 5) Lead source naming differs between current and legacy systems

Current `LeadSource`:

- `EMAIL_FORM | PHONE | WHATSAPP | MANUAL_ADMIN`

Legacy sources:

- `contact_form | email | phone | whatsapp`

**Impact**: If both UIs/flows are expected to represent the same data, the inconsistency indicates two systems or a migration in progress.

### 6) “Keep me informed” is not persisted

`EmailAgentModal` captures `keepInformed` but does not send it to the backend. If required, this should be added to the API contract.

## Current “as-is” end-to-end flow diagram (text)

### Contact lead creation (customer)

Customer (signed in, registered)  
→ `EmailAgentModal`  
→ `POST /leads/contact-form`  
→ backend persists lead (source likely `EMAIL_FORM`)  
→ lead appears in:
- Agent list (`GET /agent/leads`) for assigned agent (backend-defined)
- Admin list (`GET /admin/leads`)

### Agent processing

Agent opens `/agent-dashboard/leads` (or `/agent-dashboard/leads-and-inquiries`)  
→ list fetched via `GET /agent/leads` (filters/pagination)  
→ open lead: `GET /agent/leads/:id`  
→ transitions:
- `NEW → IN_PROGRESS` via `PATCH /agent/leads/:id/status`
- `IN_PROGRESS → REQUEST_FOR_CLOSE` via `PATCH /agent/leads/:id/status`
→ agent can:
- reply via `POST /agent/leads/:id/reply`
- create/update/delete notes via `/agent/leads/:id/notes/*`

### Admin decisioning

Admin opens `/leads` (admin layout)  
→ list fetched via `GET /admin/leads`  
→ open lead (currently fetched using agent detail endpoint)  
→ admin can:
- create manual lead: `POST /admin/leads`
- reassign: `PATCH /admin/leads/:id/reassign`
- close decision (when requested): `POST /admin/leads/:id/close-decision`

## Recommendations (to make lead management complete and consistent)

### Must-fix for “complete” lead management UX

- **Add notes fetching** when opening lead detail
  - Define and implement: `GET /agent/leads/:id/notes` (and/or `/admin/leads/:id/notes`) in `leadApiService.ts`
  - Load notes in the `useEffect` that reacts to `selectedId`

- **Use role-correct detail endpoint in Admin mode**
  - Define `getAdminLeadDetail(leadId)` if backend supports it
  - Update `LeadManagementPage` to call the correct detail fetch based on `mode`

### Clarify/normalize action endpoints

- Decide whether closing should be:
  - only `POST /admin/leads/:id/close-decision`, or
  - `PATCH /admin/leads/:id/status` with status `CLOSED`
- Remove duplicated buttons/logic once the canonical path is chosen.

### Consolidation / migration cleanup

- If the legacy `LeadInquiriesPage` is obsolete:
  - Remove navigation to it (already effectively replaced)
  - Consider deleting the mock service and components after confirming no routes use them
- If legacy must remain:
  - Implement real API equivalents and map the types/statuses/sources to the current model.

## Quick verification checklist (manual)

- **Public inquiry**
  - Submit inquiry as a signed-in registered user and verify `POST /leads/contact-form` succeeds.
  - Confirm new lead appears in admin list and intended agent list.

- **Agent**
  - Can filter by `status` and `source`
  - Can open detail, transition statuses `NEW → IN_PROGRESS → REQUEST_FOR_CLOSE`
  - Can send reply successfully
  - Can create note (and, once implemented, see existing notes)

- **Admin**
  - Can filter and paginate admin leads list
  - Can create manual lead and see it in list
  - Can reassign to another agent
  - Can close a lead in `REQUEST_FOR_CLOSE`

