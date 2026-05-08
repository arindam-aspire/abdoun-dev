# Lead Frontend Implementation Report

## 1) Understanding + Planning Snapshot

- Reused existing FE conventions: `authApi`, shared axios interceptors, `getApiErrorMessage`, `Pagination`, `Toast`, route guards in `middleware.ts`.
- Likely-change surface identified: lead routes, sidebar mapping, email/contact modal submit behavior, new lead API/types foundation.
- Main risk areas:
  - Contract has no "list notes" endpoint; note update/delete can only operate on notes created in current UI session unless backend later exposes a fetch endpoint.
  - Existing repo has pre-existing lint rule failures unrelated to lead changes.
  - Build was started and reached page-data collection but was manually backgrounded before completion.
- Role mapping decision:
  - Frontend role `user` maps to API role `registered_user`.
  - Added centralized helper in `src/lib/auth/roleMapping.ts`.
- Planned phases executed:
  1. Foundation (types + API + role mapping)
  2. Contact form integration
  3. Agent/admin route and UI activation
  4. Validation pass and implementation documentation

## 2) Files Changed

- `src/types/lead.ts` (new)
- `src/lib/auth/roleMapping.ts` (new)
- `src/features/leads/api/leadApiService.ts` (new)
- `src/features/leads/components/LeadManagementPage.tsx` (new)
- `src/features/property-search/components/modals/EmailAgentModal.tsx`
- `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`
- `src/app/[locale]/(agent)/agent-dashboard/inquiries/page.tsx`
- `src/app/[locale]/(agent)/agent-dashboard/leads-and-inquiries/page.tsx`
- `src/app/[locale]/(admin)/leads/page.tsx`
- `src/components/layout/sidebar.config.ts`

## 3) Components/Pages Created or Modified

- Created unified lead management page:
  - `LeadManagementPage` supports:
    - agent mode
    - admin mode
    - list + filters + pagination
    - detail dialog
    - status actions with role/status gating
    - reply and note mutations
    - admin manual-create/reassign/close decision actions
- Activated previously under-development agent lead routes by rendering `LeadManagementPage` (agent mode).
- Replaced admin legacy leads route with `LeadManagementPage` (admin mode).

## 4) API Service Methods Added

In `src/features/leads/api/leadApiService.ts`:

- Contact:
  - `createContactLead`
- Agent:
  - `getAgentLeads`
  - `getAgentLeadDetail`
  - `updateAgentLeadStatus`
  - `replyToAgentLead`
  - `createAgentLeadNote`
  - `updateAgentLeadNote`
  - `deleteAgentLeadNote`
- Admin:
  - `getAdminLeads`
  - `createAdminLead`
  - `reassignAdminLead`
  - `updateAdminLeadStatus`
  - `adminCloseDecision`

## 5) Types Added

In `src/types/lead.ts`:

- `LeadStatus`
- `LeadSource`
- `LeadItem`
- `LeadListResponse`
- `ContactFormLeadCreatePayload`
- `AdminManualLeadCreatePayload`
- `LeadStatusUpdatePayload`
- `LeadReassignPayload`
- `LeadReplyPayload`
- `LeadNotePayload`
- `LeadNote`
- `LeadReply`
- `LeadListParams`

## 6) State / Hooks / UI Behavior

- Implemented UI-state-driven management in `LeadManagementPage` for:
  - list load state
  - detail selection
  - reply/note form state
  - admin manual-create/reassign state
  - toast/error state
- Replaced `mailto:` flow in `EmailAgentModal` with API-backed lead creation (`POST /leads/contact-form` through `authApi` base path conventions).
- Contact form constraints enforced in modal:
  - name `2..20`
  - email format + max length
  - phone length `8..20`
  - message `10..1000`

## 7) Routes / Sidebar Changes

- Activated routes:
  - `/[locale]/agent-dashboard/leads`
  - `/[locale]/agent-dashboard/inquiries`
  - `/[locale]/agent-dashboard/leads-and-inquiries`
  - `/[locale]/leads` (admin)
- Sidebar:
  - Removed admin under-development block for `leadsAndInquiries`.
  - Added admin path mapping to `/leads`.

## 8) Validation / Tests Run

- `npm test -- --runInBand` ✅ passed (22/22 suites).
- `ReadLints` on changed lead files ✅ no linter errors in modified lead files.
- `npm run lint` ❌ repo has many pre-existing errors unrelated to this lead implementation.
- `npm run build` ▶ started successfully (compiled + TS passed; reached page-data phase) but command was manually backgrounded before completion status was captured.

## 9) Known Limitations

- Contract does not document a "list notes" endpoint; current note update/delete UX operates on notes created in current page session.
- Lead management page currently uses generic English labels (not fully localized with message keys yet).
- Full Redux slice/thunk integration for leads is not yet added; current implementation is service-backed component state with existing project utilities.

## 10) Backend Assumptions

- `authApi` base path behavior remains consistent with existing services.
- `POST /api/v1/leads/contact-form` is valid for authenticated frontend role `user` (mapped to backend `registered_user`).
- Invalid transition may surface as `500`; UI maps status mutation failures to business-friendly messaging.

## 11) Manual Smoke Checklist

- [ ] As authenticated `user`, submit contact form from property email modal and verify success toast.
- [ ] As unauthenticated user, attempting contact prompts sign-in requirement.
- [ ] As agent, open leads route and verify list/filter/page works.
- [ ] As agent, verify status actions:
  - `NEW -> IN_PROGRESS`
  - `IN_PROGRESS -> REQUEST_FOR_CLOSE`
  - no invalid action buttons for terminal states.
- [ ] As admin, open leads route and verify manual create/reassign/status/close-decision actions.
- [ ] Verify close decision is shown for `REQUEST_FOR_CLOSE`.
- [ ] Verify sidebar links navigate to active lead pages for agent/admin roles.
