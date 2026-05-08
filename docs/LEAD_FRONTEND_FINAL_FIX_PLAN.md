# Lead Frontend Final Fix Plan

## Scope and Constraints

- Frontend-only lead management alignment with backend canonical APIs.
- No backend edits.
- No unrelated module changes.
- Allowed statuses only: `NEW`, `IN_PROGRESS`, `REQUEST_FOR_CLOSE`, `CLOSED`.
- Prefer canonical lead endpoints for detail/messages/notes/history.

## Current Lead Routes / Pages

- `src/app/[locale]/(admin)/leads/page.tsx` -> uses `LeadManagementPage` in admin mode.
- `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx` -> uses `LeadManagementPage` in agent mode.
- `src/app/[locale]/(agent)/agent-dashboard/leads-and-inquiries/page.tsx` -> alias to `LeadManagementPage` agent mode.
- `src/app/[locale]/(agent)/agent-dashboard/inquiries/page.tsx` -> also mapped to `LeadManagementPage` agent mode.

## Current API Service Methods

From `src/features/leads/api/leadApiService.ts`:

- Implemented:
  - `createContactLead`
  - `getAgentLeads`
  - `getAgentLeadDetail` (agent wrapper endpoint)
  - `updateAgentLeadStatus`
  - `replyToAgentLead` (agent wrapper endpoint)
  - `createAgentLeadNote`
  - `updateAgentLeadNote`
  - `deleteAgentLeadNote`
  - `getAdminLeads`
  - `createAdminLead`
  - `reassignAdminLead`
  - `updateAdminLeadStatus`
  - `adminCloseDecision`
- Missing canonical methods:
  - `getMyLeads`
  - `getLeadDetail`
  - `getLeadMessages`
  - `postLeadMessage`
  - `getLeadNotes`
  - `createLeadNote`
  - `updateLeadNote`
  - `deleteLeadNote`
  - `getLeadHistory`

## Current Mock / Legacy Lead Code

- Legacy mock lead inquiries still present:
  - `src/features/agent/dashboard/components/lead-inquiries/*`
  - `src/features/agent/api/mocks/leadInquiriesMockService.ts`
  - `src/features/agent/dashboard/components/AgentInquiriesPage.tsx`
- This legacy path uses obsolete statuses/sources (`new`, `contacted`, `closed`, `contact_form`, etc.).
- Live navigation for agent/admin lead pages currently uses `LeadManagementPage`, not the legacy lead-inquiries page.

## Gaps vs Backend Canonical APIs

1. Lead detail in `LeadManagementPage` uses `getAgentLeadDetail` for all modes (admin included), not canonical `GET /leads/{lead_id}`.
2. Reply flow uses agent-only wrapper (`POST /agent/leads/{id}/reply`) instead of canonical messages endpoint.
3. Notes are session-only in UI state; no initial notes load from backend.
4. No lead history panel (`GET /leads/{lead_id}/history`) for admin/agent.
5. No user-facing "My Inquiries" page using `GET /leads/my` and canonical thread endpoints.
6. Duplicate admin close/status actions in detail UI can cause conflicting behavior.
7. Type names for message payload/entity are still reply-based (`LeadReply`, `LeadReplyPayload`) instead of canonical message naming.

## Files Impacted

- `src/types/lead.ts`
- `src/features/leads/api/leadApiService.ts`
- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/property-search/components/modals/EmailAgentModal.tsx`
- `src/app/[locale]/(main)/my-inquiries/page.tsx` (new)
- `src/components/layout/sidebar.config.ts` (only if route exposure is needed for current role nav model)
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md` (new final report)

## Cleanup Decisions

- Keep legacy lead-inquiries files for now unless confirmed unused by imports/routes outside lead management scope.
- Remove only conflicting/obsolete lead logic in active lead management surface:
  - agent-only detail/reply usage where canonical endpoints should be used
  - duplicate close decision UI path
  - session-only notes behavior
- Do not delete unrelated legacy files.

## Step-by-Step Checklist

1. **Types alignment**
   - Add/rename canonical lead entity/payload types:
     - `Lead`, `LeadMessage`, `LeadNote`, `LeadHistoryItem`
     - `LeadListResponse`
     - `LeadMessageCreatePayload`
     - `LeadNotePayload`
     - `ContactFormLeadCreatePayload`
     - `AdminManualLeadCreatePayload`
     - `LeadStatusUpdatePayload`
     - `LeadReassignPayload`
   - Keep statuses/sources canonical only.

2. **Lead API service alignment**
   - Add canonical service methods:
     - `getMyLeads`, `getLeadDetail`, `getLeadMessages`, `postLeadMessage`
     - `getLeadNotes`, `createLeadNote`, `updateLeadNote`, `deleteLeadNote`
     - `getLeadHistory`
   - Retain current list/status/admin methods and wrapper methods as compatibility helpers.

3. **Shared lead detail behavior**
   - Update `LeadManagementPage` to use canonical detail/messages/notes/history methods.
   - Load notes/messages/history on detail open.
   - Enforce role-based UI actions through centralized helpers:
     - agent: status transitions + message send + note CRUD + history visible
     - admin: view messages, add notes, view history, close decision path, no message edit/delete
     - user: view + message send only, no notes/history/status/reassign/admin actions

4. **Messages thread**
   - Replace old reply path with canonical message post/get.
   - Render oldest-to-newest ordering in detail dialog.

5. **Notes**
   - Replace session-only notes with backend-loaded notes.
   - Agent can edit/delete notes; admin can add/view only.
   - User notes UI hidden.

6. **History**
   - Add history section for admin/agent detail.
   - Hide history for user.

7. **Contact form flow**
   - Keep existing auth guard and validation.
   - Keep `createContactLead` call to `POST /leads/contact-form`.
   - Improve backend validation error display handling from API response detail when available.
   - Ensure no mailto fallback is used.

8. **My Inquiries page**
   - Add route `src/app/[locale]/(main)/my-inquiries/page.tsx`.
   - Reuse `LeadManagementPage` with `mode="user"` (or equivalent shared component).
   - Use `getMyLeads` + canonical detail/messages.
   - Hide notes/history/internal actions.

9. **Admin and agent fixes**
   - Admin detail must use canonical detail endpoint.
   - Remove admin use of agent-only reply endpoint.
   - Keep admin list/status/close/reassign behavior on retained endpoints.
   - Agent detail/messages/notes/history all via canonical APIs.
   - Keep agent status transitions aligned to allowed lifecycle.

10. **Validation**
   - Run:
     - `npm run typecheck`
     - `npm run lint`
     - `npm run build`
   - Fix introduced issues.

11. **Final documentation**
   - Create `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md` with changed files, endpoint alignment, cleanup decisions, validation results, and scope confirmation.
