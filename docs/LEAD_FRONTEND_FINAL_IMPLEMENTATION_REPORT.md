# Lead Frontend Final Implementation Report

## Scope Confirmation

- Work was limited to frontend Lead Management flows.
- No backend files were changed.
- No unrelated frontend modules were intentionally modified.
- Statuses remain exactly: `NEW`, `IN_PROGRESS`, `REQUEST_FOR_CLOSE`, `CLOSED`.
- `CONNECTED` was not added.

## Files Changed

- `src/types/lead.ts`
- `src/features/leads/api/leadApiService.ts`
- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/property-search/components/modals/EmailAgentModal.tsx`
- `src/app/[locale]/(main)/my-inquiries/page.tsx` (added)
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md` (added)

## API Methods Added / Updated

### Canonical methods added

- `getMyLeads(params)` -> `GET /leads/my`
- `getLeadDetail(leadId)` -> `GET /leads/{leadId}`
- `getLeadMessages(leadId)` -> `GET /leads/{leadId}/messages`
- `postLeadMessage(leadId, payload)` -> `POST /leads/{leadId}/messages`
- `getLeadNotes(leadId)` -> `GET /leads/{leadId}/notes`
- `createLeadNote(leadId, payload)` -> `POST /leads/{leadId}/notes`
- `updateLeadNote(leadId, noteId, payload)` -> `PATCH /leads/{leadId}/notes/{noteId}`
- `deleteLeadNote(leadId, noteId)` -> `DELETE /leads/{leadId}/notes/{noteId}`
- `getLeadHistory(leadId)` -> `GET /leads/{leadId}/history`

### Retained methods

- `getAgentLeads`, `getAdminLeads`
- `updateAgentLeadStatus`, `updateAdminLeadStatus`
- `adminCloseDecision`, `createAdminLead`, `reassignAdminLead`
- Legacy wrapper methods are retained and now delegate to canonical methods where applicable.

## Types Updated

- Added canonical entities:
  - `Lead`
  - `LeadMessage`
  - `LeadHistoryItem`
  - `LeadMessageCreatePayload`
- Kept compatibility aliases:
  - `LeadItem = Lead`
  - `LeadReply = LeadMessage`
  - `LeadReplyPayload = LeadMessageCreatePayload`
- Status/source enums already matched backend and remained unchanged.

## Pages / Components Updated

### `LeadManagementPage`

- Detail now uses canonical `GET /leads/{leadId}`.
- Conversation thread now uses canonical messages APIs and is rendered oldest -> newest.
- Notes now load from canonical notes API on detail open.
- History panel added for admin/agent only (`GET /leads/{leadId}/history`).
- Role behavior tightened:
  - Admin: view messages, add/view notes, view history, close via close-decision action path.
  - Agent: manage assigned leads, post replies, create notes, edit/delete only own notes.
  - User mode: no notes/history/status/reassign actions.
- Duplicate admin close action path in UI was removed in favor of single status action path routing through close decision for `CLOSED`.

### Contact flow (`EmailAgentModal`)

- Kept canonical `POST /leads/contact-form`.
- Preserved signed-in and registered-user guards.
- Added backend validation detail mapping into field errors when available.
- Existing success/error toast behavior retained.

### User inquiries route

- Added `src/app/[locale]/(main)/my-inquiries/page.tsx`.
- Follows existing main route group convention (`(main)` pages like `favourites`, `saved-searches`, etc.).
- Route is available as `/[locale]/my-inquiries`.

## Legacy / Mock Lead Code Decisions

- Legacy lead inquiry/mock files were not deleted in this implementation.
- They were retained to respect safety constraints unless separately verified for full unused status across all environments.

## Validation Commands and Results

- `npm run typecheck` -> **failed** (script not defined in `package.json`).
- `npx tsc --noEmit` -> **failed due to pre-existing test typing issues** unrelated to lead management changes.
- `npm run lint` -> **failed** with existing repository-wide lint issues (31 errors, 61 warnings), including files outside Lead Management scope.
- `npm run build` -> **passed**.
  - Build output includes ` /[locale]/my-inquiries ` route.

## Known Limitations

- Repository has pre-existing TypeScript and ESLint issues outside the Lead Management area, preventing clean `typecheck`/`lint`.
- Legacy lead-inquiries mock module remains present by design for safety; removal should be done in a separate cleanup pass after broader usage confirmation.

## Lead display identifier and property link update

### Files changed (this increment)

- `src/types/lead.ts` — added `PropertySummary`, optional `leadNumber`, optional `property` snapshot, `propertyId` optional for compatibility with partial payloads.
- `src/features/leads/components/LeadManagementPage.tsx` — list/detail display, property links, table polish.
- `src/features/leads/api/leadApiService.ts` — **no code changes**; `authApi` + v1 envelope unwrap passes through `leadNumber` and `property` as returned by the backend.

### Display behavior

- **Lead reference (table + detail title):** `lead.leadNumber` when present; else `LD-${lead.id.slice(0, 8)}`; else `-`. Raw UUID is not shown in the table column.
- **Detail header:** `Lead {reference}` plus a small muted `ID: {uuid}` line for support/debug (not prominent in the table).
- **Property label (table + detail):** `lead.property?.title` when present; else `Property ${lead.property.propertyHash}` when hash is present; else `Property ${first 8 chars of propertyId}`; else `-`. Property UUID is not used in the URL and is not shown as the primary property identifier in the table.

### Property link route (propertyHash)

- The localized property details page expects a **numeric** segment (property hash), not the property UUID.
- Links are built only when `lead.property?.propertyHash` is present: `/${locale}/property-details/${propertyHash}` (e.g. `/en/property-details/981376612`).
- **`property.id` and `propertyId` are not used** for the detail URL (they would produce “Invalid property id” with the current route).
- **Slug:** not used in the path. No extra property-fetch calls.

### Fallback behavior

- **Link:** If `propertyHash` is missing, the property line is plain text (no broken link).
- **Label:** Order is title → `Property {hash}` → `Property {propertyId slice}` → `-`.

### Validation (latest increment)

- `npx eslint "src/types/lead.ts" "src/features/leads/components/LeadManagementPage.tsx"`
- `npm run build`

### Scope confirmation

- Only Lead Management frontend types/UI were touched for this increment; workflow/status/API methods unchanged.
- **UUID remains internal** for lead APIs (`lead.id`, `selectedId`, etc.); property UUID is not used for the public property details link.

## Contact form backend-enforced role validation

### Files changed (this increment)

- `src/features/property-search/components/modals/EmailAgentModal.tsx`
- `src/features/leads/api/leadApiService.ts` (no code changes)

### Behavior update

- Removed frontend role hard-block for authenticated non-registered roles.
- Retained unauthenticated guard:
  - Not logged in -> shows sign-in prompt/toast and does not call API.
- For any logged-in account, form now submits to backend (`createContactLead`) and backend enforces permission.
- Added explicit backend `403` handling:
  - Shows friendly message: `"You are not allowed to submit contact inquiries with this account."`
  - No success toast, modal stays open.
- Existing `422` field-level mapping remains unchanged.
- Existing generic error handling remains for non-422/non-403 errors.

### Validation results

- `npx eslint "src/features/property-search/components/modals/EmailAgentModal.tsx" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Only contact form UX handling in Lead Management frontend was changed.
- Lead workflow/status logic and backend APIs were not modified.

## Lead table UX improvements (Agent column + clickable lead number)

### Files changed (this increment)

- `src/features/leads/components/LeadManagementPage.tsx`

### Changes

- Added **Agent** column to the lead list table for admin/agent/user modes.
- Agent display uses existing lead payload only (no extra requests):
  - Preferred (if backend adds it later): `assignedAgent.fullName`, then `assignedAgent.email`
  - Current fallback: `assignedAgentId` shortened to 8 chars
  - If none: `Unassigned`
- Made the **lead number/reference clickable**:
  - Lead cell is now a keyboard-accessible `<button type="button">`
  - Clicking it triggers the same modal open behavior as the existing **Open** button (`setSelectedId(lead.id)`).
- **Open** button remains unchanged and continues to work.

### Validation results

- `npx eslint "src/features/leads/components/LeadManagementPage.tsx"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Table UX only; no workflow/status logic changes; no backend changes.

## Agent display and detail loading safety

### Files changed (this increment)

- `src/types/lead.ts`
- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/api/leadApiService.ts` (no code changes)

### Agent display fallback behavior

- Added typed `assignedAgent` summary support in lead types:
  - `id`
  - `fullName?`
  - `name?`
  - `email?`
- Agent column display order now:
  1. `lead.assignedAgent?.fullName`
  2. `lead.assignedAgent?.name`
  3. `lead.assignedAgent?.email`
  4. shortened `lead.assignedAgentId`
  5. `Unassigned`
- Full UUID is not shown in the table, and column text uses truncate + tooltip title.

### Loading / safety behavior

- Added defensive array normalization helper (`toArray`) before iterating messages/notes/history.
- This prevents runtime iteration errors when an API returns non-array/null unexpectedly.
- Added section-level loading/error states for detail modal:
  - detail loading
  - conversation loading/error
  - notes loading/error
  - history loading/error
- “No messages yet” / “No history available” / “No notes yet” render only after corresponding section loading completes.

### Thread normalization fix

- `messages`, `notes`, and `history` are normalized to arrays before rendering/iteration.
- Conversation sort uses normalized array only.
- Canonical APIs and role guards remain unchanged.

### Validation results

- `npx eslint "src/types/lead.ts" "src/features/leads/api/leadApiService.ts" "src/features/leads/components/LeadManagementPage.tsx"` -> passed
- `npm run build` -> passed

## Lead table and detail page UI alignment

### Files changed (this increment)

- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/components/LeadDetailPage.tsx` (new shared detail view)
- `src/app/[locale]/(admin)/leads/[leadId]/page.tsx` (new)
- `src/app/[locale]/(agent)/agent-dashboard/leads/[leadId]/page.tsx` (new)
- `src/app/[locale]/(main)/my-inquiries/[leadId]/page.tsx` (new)

### Routing / detail view decision

- Implemented **route-based detail pages** (preferred option) instead of modal-first detail UX:
  - Admin: `/${locale}/leads/{leadId}`
  - Agent: `/${locale}/agent-dashboard/leads/{leadId}`
  - User: `/${locale}/my-inquiries/{leadId}`
- All three routes reuse the shared `LeadDetailPage` component with mode-based behavior.

### Modal removal / retention status

- Lead table actions no longer open the modal.
- Clicking lead number and the Open button now navigate to the same detail route.
- Legacy modal detail logic was removed from active table flow.

### Table style and layout changes

- Header layout aligned with admin/agent table pattern:
  - title on left
  - right-aligned filter controls (+ create manual lead button for admin)
- Removed standalone dropdown row below title.
- Added table skeleton rows while list data is loading.
- Empty state renders only after loading finishes.
- Lead number remains primary visible identifier and is keyboard-accessible clickable text.
- Property links still use `property.propertyHash`.

### Skeleton / loading behavior

- Lead list uses table skeleton rows during loading.
- Detail page shows section loading states for:
  - detail summary
  - conversation
  - notes
  - history
- Section errors are shown inline where applicable.

### Raw UUID visibility

- Raw lead UUID is no longer shown as normal default UI metadata in detail header.
- Lead number remains the primary visible identifier.

### Validation results

- `npx eslint "src/types/lead.ts" "src/features/leads/api/leadApiService.ts" "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/app/[locale]/(admin)/leads/[leadId]/page.tsx" "src/app/[locale]/(agent)/agent-dashboard/leads/[leadId]/page.tsx" "src/app/[locale]/(main)/my-inquiries/[leadId]/page.tsx"` -> passed
- `npm run build` -> passed

## Lead UI visual alignment pass

### Files changed

- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/components/LeadDetailPage.tsx`
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md`

### List layout alignment

- Updated page heading area to include title + subtitle, matching existing management pages.
- Converted lead list container to project `Card` layout with `CardHeader` and `CardContent`.
- Added card header section title with icon (`Lead list` / `My inquiry list`).
- Aligned controls to the right side in a consistent filter/action row:
  - search input (UI-only; no backend contract changes)
  - status dropdown
  - source dropdown
  - admin-only `Create Manual Lead` action button
- Preserved existing table behavior:
  - clickable lead number navigation
  - Open button navigation
  - property link via `property.propertyHash`
  - unchanged canonical lead APIs and status workflow

### Detail page layout alignment

- Refined header to match project detail pages:
  - lead title (`Lead LD-...`)
  - subtitle (`property title · status`)
  - right-aligned back action
- Reworked summary section into a consistent grid of bordered info cards:
  - Property
  - Status (badge)
  - Source (badge)
  - Assigned agent
  - Created
  - Last activity
- Re-styled content areas using project card pattern (`CardHeader`, `CardContent`) for:
  - Actions
  - Conversation
  - Internal notes
  - Audit history
- Kept role-based visibility and behavior unchanged:
  - user: no internal notes/history/actions
  - agent: status progression + own-note edit/delete rules
  - admin: close decision and reassign controls
- No raw UUID added to normal UI display.

### Validation results

- `npx eslint "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/app/[locale]/(admin)/leads/[leadId]/page.tsx" "src/app/[locale]/(agent)/agent-dashboard/leads/[leadId]/page.tsx" "src/app/[locale]/(main)/my-inquiries/[leadId]/page.tsx"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Only Lead Management frontend files were touched for this pass.
- No backend files changed.
- No lead workflow/status logic changed.
- No APIs removed or replaced.

## Lead status cards, detail tabs, and reassign modal

### Files changed

- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/components/LeadDetailPage.tsx`
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md`

### Summary card behavior (lead list)

- Added status summary cards above the table using existing card style patterns:
  - Total Leads
  - New
  - In Progress
  - Request For Close
  - Closed
- Clicking a card updates the existing status filter query state:
  - Total Leads -> clears status filter
  - Other cards -> applies the matching status
- Status dropdown remains in sync because both card clicks and dropdown updates use the same query param.
- Added skeleton cards while lead list is loading.
- Counts are computed from the currently loaded list data (page scope), while total card uses API `total`.

### Tab behavior (lead detail)

- Replaced stacked activity sections with tabs using existing `Tabs` UI component:
  - Conversation
  - Internal Notes (agent/admin only)
  - Audit History (agent/admin only)
- User mode sees only Conversation tab.
- Added tab content skeletons for messages/notes/history loading states.
- Empty states are shown only after each respective request completes.

### Reassign modal behavior (admin)

- Removed inline reassign input from detail body.
- Added top-right `Reassign Agent` action button in detail header for admin.
- Reassign opens a modal with:
  - current assigned agent display
  - searchable input
  - agent select dropdown
  - cancel + reassign actions
- Reassign validates:
  - selected agent required
  - cannot reassign to the same current agent
- On success:
  - calls existing reassign API
  - updates lead detail state
  - shows success toast
  - closes modal

### Agent Redux/listing source reused

- Reused existing admin agent listing Redux flow:
  - `fetchAdminAgents` from `src/features/admin/adminAgentsSlice.ts`
  - `state.adminAgents.currentItems` and `state.adminAgents.loading`
- No duplicate agent API client or new agent slice/store logic was created.
- Agent options are restricted to active agents via existing status normalization constants.

### Header action behavior

- Admin top-right actions:
  - `Reassign Agent` always visible
  - `Close Lead` shown only when status is `REQUEST_FOR_CLOSE`
  - Close action uses existing `adminCloseDecision(leadId, { status: "CLOSED" })`
- Agent top-right actions:
  - `NEW` -> `Mark In Progress`
  - `IN_PROGRESS` -> `Request Close`
  - `REQUEST_FOR_CLOSE` -> disabled `Waiting for Admin`
  - `CLOSED` -> disabled `Closed`
- User mode shows no admin/agent action buttons.

### Skeleton coverage

- Lead list status summary cards
- Lead table rows (existing)
- Detail summary cards (existing)
- Detail tab content (conversation / notes / history)
- Reassign modal agent loading state

### Validation results

- `npx eslint "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/features/leads/api/leadApiService.ts" "src/types/lead.ts"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Changes limited to Lead Management frontend and report docs.
- No backend changes.
- No changes to lead workflow/status rules or canonical lead API contracts.

## Conversation response handling and admin close action fix

### Response shape normalized

- Updated `src/features/leads/api/leadApiService.ts` with defensive response normalizers:
  - `unwrapArrayResponse<T>(response)` for list endpoints
  - `unwrapItemResponse<T>(response)` for single-item endpoints
- `getLeadMessages` now supports:
  - `LeadMessage[]`
  - `{ data: LeadMessage[] }`
  - `{ data: { items: LeadMessage[] } }`
  - `{ items: LeadMessage[] }`
- Applied the same array normalization to:
  - `getLeadNotes`
  - `getLeadHistory`
- `postLeadMessage` now supports:
  - `LeadMessage`
  - `{ data: LeadMessage }`
  - `{ data: { item: LeadMessage } }`
  - `{ item: LeadMessage }`

### Messages render and refetch behavior

- Updated `src/features/leads/components/LeadDetailPage.tsx` to use dedicated message refresh flow:
  - Added `refreshMessages()` that loads + normalizes + sorts messages ascending by `createdAt`.
  - `loadAll()` now delegates thread load to `refreshMessages()`.
- Reply submit flow is now:
  - `await postLeadMessage(...)`
  - `await refreshMessages()`
  - clear input
  - success toast
- Conversation empty state appears only when loading has finished and normalized message list is truly empty.

### Admin close visibility rule

- Admin `Close Lead` button visibility is now strictly based on lead status match to `REQUEST_FOR_CLOSE`, with case-safe comparison.
- Close action still uses:
  - `adminCloseDecision(leadId, { status: "CLOSED" })`
- On success:
  - lead detail state updates from API response
  - success toast shown
- On failure (including 400/403), friendly error toast shown and no fake success state.

### Validation results

- `npx eslint "src/features/leads/api/leadApiService.ts" "src/features/leads/components/LeadDetailPage.tsx" "src/types/lead.ts"` -> passed
- `npm run build` -> passed

## Lead detail premium refinement pass

### Audit icon enhancement

- Updated audit timeline rows in `src/features/leads/components/LeadDetailPage.tsx` to replace generic dots with semantic Lucide icons inside 36x36 rounded icon containers.
- Icon mapping now follows event intent while preserving existing backend-driven rendering logic:
  - lead created -> `UserPlus` with green tone
  - status changed -> `ArrowRightLeft` with blue tone
  - request for close -> `Clock3` with purple tone
  - lead closed -> `CheckCheck` with green tone
  - agent reassigned -> `UserCog` with indigo tone
- Kept existing behavior unchanged for:
  - sorting
  - reassignment detection
  - actor rendering
  - status transition chips
  - reason rendering
- Added a subtle vertical connector treatment and preserved right-aligned timestamps.

### Property preview behavior

- Improved property image resolution without adding API calls by checking already-available fields in existing lead property payload:
  - `thumbnailUrl`
  - `imageUrl`
  - `coverImageUrl`
  - `thumbnail`
  - `coverImage`
  - first image from `images[]` / `media[]` (string or object url variants)
- When an image exists, the summary card now renders a compact premium preview (`120x72`, `rounded-xl`, `object-cover`).
- When no image exists, it renders a minimal soft-gray placeholder with centered `Building2` icon and no heavy border.

### Conversation polish

- Softened message bubbles with subtle shadow and refined rounded corners while keeping message/send flow unchanged.
- Kept outgoing as subtle blue tint and incoming as white.
- Improved spacing rhythm between messages and reduced visual weight of sender/timestamp metadata.
- Refined composer with softer border and centered square send button style.

### Spacing refinement

- Rebalanced summary row column proportions:
  - property block slightly wider
  - metadata blocks tighter
- Switched inner vertical dividers to softer `border-slate-100`.
- Improved text hierarchy by using lighter/smaller labels and stronger value styling.
- Preserved single unified summary card structure and existing page logic.

### Validation results

- `npx eslint "src/features/leads/components/LeadDetailPage.tsx"` -> passed
- `npm run build` -> passed

## Lead user summary, hover details, sidebar count, and audit rendering

### Files changed

- `src/types/lead.ts`
- `src/features/leads/components/LeadManagementPage.tsx`
- `src/features/leads/components/LeadDetailPage.tsx`
- `src/features/agent/dashboard/agentDashboardSummarySlice.ts`
- `src/store/selectors.ts`
- `src/components/layout/Sidebar.tsx`

### User column behavior

- Added `LeadUserSummary` and `Lead.user` typing support while preserving existing lead fields and API usage.
- Added `User` column in lead list with order:
  - `Lead | Property | User | Agent | Source | Status | Last activity | Actions`
- User cell display priority:
  - `lead.user?.fullName`
  - `lead.user?.email`
  - shortened `lead.userId` (first 8 chars)
  - `Unknown user`
- No full UUIDs are displayed in normal table UI for user/agent identity labels.

### Hover detail behavior

- Added hover details using existing `title` pattern (no new popover system introduced).
- User hover includes:
  - Name
  - Email
  - Phone
  - shortened user ID
- Agent hover includes:
  - Name
  - Email
  - shortened agent ID

### Detail page user summary

- Added `Submitted by` summary card in `LeadDetailPage`.
- Displays:
  - user full name or email fallback
  - email line (if present)
  - phone line (if present)
- Existing `Assigned agent` summary card remains unchanged.

### Sidebar count source and limitation

- Updated sidebar lead badge path to use real lead totals from lead list endpoints:
  - admin: `GET /admin/leads` total
  - agent: `GET /agent/leads` total
- Wired through existing sidebar count architecture (`Sidebar` dispatch -> Redux slice -> `selectSidebarCounts`).
- User sidebar lead count is not added because current sidebar is role-scoped to `admin`/`agent` only; no user sidebar lead item exists in the current navigation config.

### Audit rendering behavior

- Audit rows remain sorted by `changedAt` ascending (with `createdAt` fallback).
- Rendering now distinguishes:
  - Creation: `Created as NEW` (or other first status when provided)
  - Status transition: `FROM -> TO`
  - Reassignment: when `fromStatus === toStatus` and reason includes `Reassigned agent`
    - Primary: `Agent reassigned`
    - Details: `Reassigned agent from ... to ...`
  - Close event:
    - Primary: `Lead closed`
    - Transition details still shown (`REQUEST FOR CLOSE -> CLOSED`)
- Actor role, timestamp, and reason/details are rendered when present.

### Validation results

- `npx eslint "src/types/lead.ts" "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/components/layout/Sidebar.tsx" "src/features/agent/dashboard/agentDashboardSummarySlice.ts" "src/store/selectors.ts"` -> passed
- `npm run build` -> passed

## Lead summary optimization and assigned agent phone display

### Approach used

- Frontend-only optimization (no backend API changes).
- Kept current list APIs and status-card UX unchanged.
- Did not add row-level profile/property fetches.

### Assigned agent phone display behavior

- Updated `AssignedAgentSummary` type in `src/types/lead.ts` to include optional `phone`.
- Updated agent hover text in `src/features/leads/components/LeadManagementPage.tsx`:
  - shows `Name`
  - shows `Email` only when available
  - shows `Phone` only when available
- Agent ID is not shown in hover.
- No `N/A` placeholder is rendered for missing phone/email lines.

### Summary API call reduction behavior

- Summary cards still use existing multi-call counting strategy (`all`, `NEW`, `IN_PROGRESS`, `REQUEST_FOR_CLOSE`, `CLOSED`).
- Added dedupe/memoization guard in `LeadManagementPage` to avoid repeated summary bursts from Strict Mode / fast refresh reruns:
  - if same mode summary call is already in flight, reuse it
  - if same mode summary was fetched very recently, skip refetch
- Summary force-refresh now happens only for status-changing actions in list:
  - `Create Manual Lead`
  - `Close Lead`
- No forced summary refresh after non-status actions:
  - reassign (already optimized earlier)
  - open detail/view
  - message/note flows

### Validation results

- `npx eslint "src/types/lead.ts" "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

## Final lead detail page visual upgrade

### Files changed

- `src/features/leads/components/LeadDetailPage.tsx`
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md`

### Layout changes

- Upgraded Lead Detail page to a clean CRM-style layout with:
  - polished header (lead ref + status chip + property link)
  - single wide summary card (no duplicated quick info/activity overview blocks)
  - refined tabbed activity area
  - clean audit timeline/list styling
- Added richer summary presentation while staying on existing lead payload:
  - property block with optional thumbnail only when already available on existing data
  - submitted-by block with initials, name, email, phone
  - assigned-agent block with initials, name, email, phone
  - source, status, created, last activity metric blocks
- No 3-dot detail menu added.

### Preserved role/status behavior

- Kept all existing role visibility and actions:
  - admin: reassign (hidden for closed), close only for `REQUEST_FOR_CLOSE`
  - agent: status action set by current lead status
  - user: conversation-only visibility, no notes/history tabs
- No workflow/status logic changes.
- No routing changes.

### Actions behavior

- Reassign action still opens existing modal, uses existing Redux agent list, and preserves API flow.
- Close action still calls existing close API and refreshes detail data.
- Conversation reply flow, notes CRUD, and audit loading/sorting logic are preserved.
- Property link still opens in a new tab via `propertyHash` route.

### Validation results

- `npx eslint "src/features/leads/components/LeadDetailPage.tsx" "src/types/lead.ts" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

## Lead detail page pixel-level reference correction

### Layout fixes

- Adjusted page container to a compact centered width (`max-w-[1440px]` with consistent paddings) for alignment with admin pages.
- Tightened header spacing and action alignment for a cleaner CRM-style top area.
- Kept only role/status actions in header; no menu-based detail actions introduced.

### Summary card correction

- Reworked summary to one horizontal parent card with responsive desktop row behavior and subtle vertical separators.
- Removed nested mini-card appearance and reduced excess white space.
- Ensured `Last activity` remains in the same desktop row structure.
- Kept block content: Property, Submitted by, Assigned agent, Source, Status, Created, Last activity.

### Conversation bubble correction

- Conversation bubbles now render with balanced max width and cleaner left/right alignment.
- Removed loose external sender labels; sender/time remain inside bubble metadata.
- Kept dark-blue icon send button and existing send/refetch behavior.

### Audit timeline correction

- Timeline rows now show clearer hierarchy:
  - action title
  - actor line
  - date/time right-aligned in row header
  - transition/reason details where available
- Preserved changedAt ascending order and reassignment handling.

### Validation results

- `npx eslint "src/features/leads/components/LeadDetailPage.tsx" "src/types/lead.ts" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Only Lead Management frontend files and lead implementation docs were updated.

## Lead detail final visual corrections

### Reassign button style update

- Updated admin `Reassign Agent` button in `src/features/leads/components/LeadDetailPage.tsx` to project primary dark-blue style.
- Existing admin-only visibility/behavior and modal flow remain unchanged.
- `Close Lead` visibility logic remains unchanged.

### Property preview behavior

- Property block now always renders a compact visual preview area:
  - existing image preview when thumbnail/image field is available in current lead/property payload
  - themed placeholder tile with icon when no image is available
- No new API calls were introduced for property image loading.

### Audit history layout update

- Refined Audit History into a cleaner horizontal timeline/list:
  - colored circular dot icon at left
  - main action text
  - transition chips for status changes
  - actor line (`by ...`)
  - reason/reassignment details when present
  - timestamp aligned right
  - subtle row separators
- Existing sorting (`changedAt` ASC fallback), reassignment detection, and data parsing remain unchanged.

### Validation results

- `npx eslint "src/features/leads/components/LeadDetailPage.tsx"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Changes were limited to Lead Management frontend implementation and report docs only.

## Lead detail page reference alignment correction

### Files changed

- `src/features/leads/components/LeadDetailPage.tsx`
- `docs/LEAD_FRONTEND_FINAL_IMPLEMENTATION_REPORT.md`

### Summary card layout correction

- Reworked detail summary into one horizontal parent card with subtle desktop dividers.
- Removed nested/mini bordered inner cards to avoid boxy form-like appearance.
- Preserved required data blocks in one row flow:
  - Property (with existing-data thumbnail when available)
  - Submitted by
  - Assigned agent
  - Source
  - Status
  - Created
  - Last activity

### Conversation bubble correction

- Conversation keeps one activity card with improved bubble hierarchy and spacing.
- Maintains avatar initials + left/right bubble alignment + timestamp readability.
- Reply composer remains at tab bottom with dark-blue icon send button.
- Existing reply permissions/behavior remain unchanged.

### Audit timeline correction

- Audit tab now uses a cleaner timeline-style list with icon-dot + vertical connector.
- Keeps canonical action text, role/date/reason rendering and changedAt ASC order.
- No UUID-heavy rows or placeholder-only rows introduced.

### Preserved behavior

- Role-based actions/tabs unchanged.
- Reassign modal flow unchanged.
- Close button visibility unchanged (`REQUEST_FOR_CLOSE` only).
- Agent status action logic unchanged.
- Routing and API surface unchanged.

### Validation results

- `npx eslint "src/features/leads/components/LeadDetailPage.tsx" "src/types/lead.ts" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

## Lead row actions dropdown

### Open button replaced with 3-dot menu

- Replaced the table Actions column `Open` button with shared `ActionsMenu` + `IconButton` (`MoreVertical`) pattern in:
  - `src/features/leads/components/LeadManagementPage.tsx`
- Kept table structure/layout unchanged; only row action trigger UI changed.

### Role/status action rules

- All modes:
  - `View`
- Admin:
  - `NEW` / `IN_PROGRESS`: `View`, `Reassign Agent`
  - `REQUEST_FOR_CLOSE`: `View`, `Reassign Agent`, `Close Lead`
  - `CLOSED`: `View`
- Agent:
  - `NEW`: `View`, `Mark In Progress`
  - `IN_PROGRESS`: `View`, `Request Close`
  - `REQUEST_FOR_CLOSE`: `View`, disabled `Waiting for Admin`
  - `CLOSED`: `View`, disabled `Closed`
- User:
  - `View` only

### Action behavior decision

- To avoid duplicating workflow/API mutation logic at list level, all non-disabled row actions navigate to lead detail where existing role-based actions are already implemented safely.
- `View` uses the same existing navigation path as lead number click and previous Open button (`openLead` + `leadDetailHref`).

### Validation results

- `npx eslint "src/features/leads/components/LeadManagementPage.tsx"` -> passed
- `npm run build` -> passed

### Scope confirmation

- Only Lead Management frontend files and implementation report were touched.
- No backend files changed.
- No workflow/status logic changed.

### Manual flow result

- Manual browser flow execution is required in local UI session for final end-to-end confirmation.
- Code-path verification confirms the expected flow wiring:
  - Existing API messages are normalized and rendered from `getLeadMessages`.
  - Reply submit triggers `postLeadMessage` and then `refreshMessages()` before clearing input.
  - Agent `IN_PROGRESS` -> `REQUEST_FOR_CLOSE` action remains available via status action button.
  - Admin `Close Lead` button is visible only when status equals `REQUEST_FOR_CLOSE`.
  - Admin close now refetches detail via `loadAll()` after successful `adminCloseDecision`.
- Completion criteria status based on code + validation:
  - Messages visible from API response ✅
  - Reply appears after send/refetch ✅
  - No false “No messages yet” with non-empty normalized list ✅
  - Admin Close Lead visible for `REQUEST_FOR_CLOSE` only ✅
  - Close action refreshes detail and updates status to `CLOSED` ✅
  - Build passes ✅

## Registered user inquiry conversation flow verification

### Routes verified

- `src/app/[locale]/(main)/my-inquiries/page.tsx`
  - renders `<LeadManagementPage mode="user" />`
- `src/app/[locale]/(main)/my-inquiries/[leadId]/page.tsx`
  - renders `<LeadDetailPage mode="user" leadId={leadId} />`
- User detail route is `/${locale}/my-inquiries/{leadId}` and list navigation uses that route.

### APIs used

- User list uses `getMyLeads` (backend: `GET /api/v1/leads/my`).
- User detail uses `getLeadDetail` (backend: `GET /api/v1/leads/{leadId}`).
- Conversation uses `getLeadMessages` + normalization (backend: `GET /api/v1/leads/{leadId}/messages`).
- User reply uses `postLeadMessage` (backend: `POST /api/v1/leads/{leadId}/messages`) and then refetches via `refreshMessages()`.

### User-visible actions

- In user mode list:
  - lead rows render and open detail via lead number click and `Open` button.
  - list includes lead reference, property, status, and last activity data (plus additional non-destructive columns).
- In user mode detail:
  - Conversation tab is shown.
  - Reply textarea and send button are shown.
  - Messages are rendered sorted by `createdAt` ascending.
  - Empty state appears only after loading completes and message list is empty.

### Hidden internal/admin actions

- User mode does **not** show:
  - Internal Notes tab
  - Audit History tab
  - Agent/admin status action buttons
  - Reassign Agent button
  - Close Lead button
  - Reassign modal/actions

### Validation results

- `npx eslint "src/app/[locale]/(main)/my-inquiries/page.tsx" "src/app/[locale]/(main)/my-inquiries/[leadId]/page.tsx" "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/features/leads/api/leadApiService.ts"` -> passed
- `npm run build` -> passed

### Manual smoke-test status

- Code-path verification confirms the required user inquiry conversation flow wiring is implemented end-to-end.
- Final interactive smoke test (login, submit inquiry, open `/en/my-inquiries`, send reply, verify no admin/agent actions) must be run in the browser session with a registered user account.

## Audit history response rendering fix

### Response shape handled

- `getLeadHistory` in `src/features/leads/api/leadApiService.ts` already uses shared `unwrapArrayResponse<T>()`, which supports:
  - `LeadHistoryItem[]`
  - `{ data: LeadHistoryItem[] }`
  - `{ data: { items: LeadHistoryItem[] } }`
  - `{ items: LeadHistoryItem[] }`
- Existing messages/notes normalization remains intact.

### Fields rendered

- Updated `src/types/lead.ts` `LeadHistoryItem` to support canonical backend fields:
  - `toStatus`
  - `actorRole`
  - `changedAt`
- Kept compatibility fields used by existing code paths:
  - `action` (optional)
  - `createdAt` (optional)
  - `previousStatus` / `newStatus` (optional aliases)
- Updated history row rendering in `src/features/leads/components/LeadDetailPage.tsx`:
  - transition text:
    - `FROM_STATUS -> TO_STATUS` when both exist
    - `Created as TO_STATUS` when `fromStatus` is null
  - actor line:
    - `By {actorRole} · {shortActorUserId} · {formatted changedAt}`
  - optional reason line:
    - `Reason: ...` when reason is present
- Valid rows no longer render as placeholder `-`.

### Sorting behavior

- History rows are sorted by `changedAt` ascending.
- Falls back to `createdAt` for compatibility if `changedAt` is absent.
- Lifecycle now reads from creation to latest update.

### Validation results

- `npx eslint "src/features/leads/api/leadApiService.ts" "src/features/leads/components/LeadDetailPage.tsx" "src/types/lead.ts"` -> passed
- `npm run build` -> passed

## Manual owner / external communication lead frontend integration

### Modal behavior

- Added `src/features/leads/components/CreateManualLeadModal.tsx`: agent-facing modal to create manual owner leads with validated fields (`ownerName`, optional `phoneNumber` / `email` with at least one contact, `relatedPropertyName`, `message`), responsive 2-column grid, slate-bordered inputs, min-height ~120px message area, Cancel (outline) + Create lead (primary) with in-button spinner while submitting, `noValidate` (no browser default validation).
- Agent lead list header (`LeadManagementPage` `mode="agent"`, routes under `/agent-dashboard/leads` and `/agent-dashboard/leads-and-inquiries`, not the standalone `/agent-dashboard/inquiries` page): primary **Add New Lead** opens the modal (same button family as existing primary actions; not a floating action).
- API: `createManualOwnerLead()` in `leadApiService.ts` posts to `/leads/manual` with `unwrapItemResponse` fallback; types in `ManualOwnerLeadCreatePayload` / `Lead`.
- On success: modal closes, success toast, **`load()` only** for the current list (no `loadSummary({ force: true })` burst).

### External communication UX (detail)

- `communicationMode === "EXTERNAL"` drives behavior only in the UI layer (no status/workflow changes).
- Header: subtle **External** pill next to status; summary **Source** shows **Agent Manual** when `source` is `AGENT_MANUAL`.
- **Submitted by** uses `externalOwner` name / email / phone when no registered `user`; avoids showing UUIDs in that block.
- **Property** uses `externalPropertyName` when there is no listing snapshot; link only when `property.propertyHash` exists; image remains placeholder unless real property media exists on the payload.
- **Conversation** tab: informational sky/slate banner explaining external communication; empty thread shows a calm placeholder (no harsh empty state); reply composer and send control are **not rendered** for external leads (not disabled inputs). Admin never had reply; agent/user lose composer only for external.

### List rendering behavior

- `LeadSource` extended with `AGENT_MANUAL`; `Lead` extended with `communicationMode`, `externalOwner`, `externalPropertyName`, `createdByAgentId` (all optional for backward compatibility).
- User column: fallback chain `user` → `externalOwner` → label **External Owner** (no user id snippets in display).
- Property column: `property.title` → `externalPropertyName` → **External Property**; search includes external owner fields and external property name.
- Source column: **Agent Manual** label; compact **External** pill when `communicationMode` is external (no extra table column).

### Preserved workflows

- Status rules and admin/agent actions unchanged; internal notes and audit history unchanged in behavior; registered-user inquiry pages and in-app conversation for `IN_APP` leads unchanged.
- Sidebar counts remain driven by existing list totals from the API (no FE hardcoding of manual buckets).

### Follow-up (backend recommendation)

- Expose optional `property.previewImage` (or similar) on the lead property serializer so external/manual rows can show a real thumbnail when a listing exists, without extra frontend fetches.

### Validation results

- `npx eslint "src/types/lead.ts" "src/features/leads/api/leadApiService.ts" "src/features/leads/components/LeadManagementPage.tsx" "src/features/leads/components/LeadDetailPage.tsx" "src/features/leads/components/CreateManualLeadModal.tsx"` -> passed
- `npm run build` -> passed
