# EP-007 → US-012 — Understanding Document

**Story:** Register User Property Listing — Reuse the Agent Add‑Property Flow
**Author:** Engineering review of the change request
**Date:** 2026-05-07
**Status:** Pre‑implementation analysis (no code changes yet)

---

## 1. What the change request is asking for

Allow a **Registered User (Owner / Landlord)** to list a property using the **same** workflow Agents already use, with **minimum new code**.

End‑to‑end flow expected:

1. User signs in.
2. User clicks **“List Your Property”** in the header.
3. User is taken to a listings management page (same look/feel as the Agent listings page).
4. From there the user clicks **Add New Property** and uses the **existing multi‑step Add Property wizard**.
5. The submission goes through the **existing moderation workflow**.
6. **Admin** reviews / edits / publishes / assigns an agent (already implemented).

**Hard constraint:** Reuse — no new wizard, no new APIs, no new Redux slices, no new listings UI. Only extend permissions, routing, and a few small props/configs.

---

## 2. What already exists in the codebase (good news)

The following pieces are already production‑ready and role‑agnostic enough to reuse:

| Concern | Existing Implementation | Reuse status |
|---|---|---|
| Multi‑step wizard | `src/features/agent/dashboard/components/add-property/AddPropertyWizard.tsx` | Reuse as‑is |
| Wizard host page (sidebar + stepper + leave‑guard) | `src/features/agent/dashboard/components/add-property/AddPropertyPage.tsx` (already supports `mode: "agent" \| "admin"`) | Reuse, extend `mode` to include `"user"` |
| Wizard Redux state | `addPropertyWizardSlice.ts` (already models `wizardMode`) | Reuse, extend the union type |
| Submission API (create / patch draft / submit / get / delete) | `src/features/agent/dashboard/api/propertySubmissions.api.ts` (uses shared `authApi`, token‑scoped) | Reuse 1:1 |
| Listings page (table + drafts + filters + sorting + pagination) | `src/features/agent/dashboard/components/AgentListingsPage.tsx` | Reuse with a new `mode` prop |
| Header “List Your Property” button visibility | `src/components/layout/app-header.nav.json` (`actions.listProperty.roles = ["guest", "user"]`) | Already correct |
| Authenticated route gating | `src/components/layout/AuthenticatedRouteGuard.tsx` | Reuse for the new user routes |
| Admin moderation queue | `src/app/[locale]/(admin)/property-submissions/...` and `(admin)/admin-dashboard/listings/...` | Already implemented |

This means **most of US‑012 is routing + small parameterization**, not new screens.

---

## 3. What is missing or blocking

| Gap | Where | Why it blocks |
|---|---|---|
| `role === "user"` is redirected off any protected route | `middleware.ts` | Today users can’t access dashboards/listings; we need a user‑accessible listings route. |
| “List Your Property” button opens an empty placeholder modal | `src/components/layout/AppHeader.tsx` (`isListPropertyModalOpen`) | Needs to actually navigate users to the new listings page. |
| `AddPropertyWizardMode` only allows `"agent" \| "admin"` | `addPropertyWizardSlice.ts` | Need a `"user"` mode so the page can render user‑specific copy/links without forking the component. |
| `AgentListingsPage` hard‑codes `/agent-dashboard/...` URLs and uses `AgentRouteGuard` indirectly via the `(agent)` layout | `AgentListingsPage.tsx`, `(agent)/layout.tsx` | URLs and guard need to be parameterized so the same component can serve users. |
| Listings page references mock services (`agentDashboardMockService`) | `AgentListingsPage.tsx` | When the user uses this page, it must never read mocks (audit risk). |
| No user route shells exist | `src/app/[locale]/(main)/...` | Need two thin route files to host the reused components. |
| i18n keys for the user surface | `src/messages/{en,ar,es,fr}.json` | Audit flagged `ar`/`es` parity already; new keys must land in all four locales. |

---

## 4. Reuse strategy (1‑page summary)

We treat “user” as **a third mode of the existing flow**, not a parallel system.

```
              role === "user"                role === "agent"            role === "admin"
                    │                              │                          │
   /{locale}/my-listings   ─────►  AgentListingsPage(mode="user"|"agent"|"admin")
                    │                              │                          │
   /{locale}/my-listings/add-property ─►  AddPropertyPage(mode="user"|"agent"|"admin")
                    │                              │                          │
                    ▼                              ▼                          ▼
                          propertySubmissions.api.ts (single API surface)
                                            │
                                            ▼
                                  Admin moderation queue (existing)
```

- **One component, two URL spaces** for the listings page (`/agent-dashboard/listings` and `/my-listings`).
- **One wizard, three modes**: `agent`, `admin`, `user` — only “Manage Listings” back link and rejected‑banner copy differ.
- **Same APIs** — they are already authenticated and scoped to the caller.

---

## 5. Concrete change set (to be executed in Phase 1)

### 5.1 Type / state
- `addPropertyWizardSlice.ts` → extend:
  ```ts
  export type AddPropertyWizardMode = "agent" | "admin" | "user";
  ```

### 5.2 Components (no new components — extend existing)
- `AddPropertyPage.tsx`
  - Add `"user"` branch in the `listingsHref` mapping → `/{locale}/my-listings`.
  - Add `"user"` branch to the leave‑guard pathname check (`/my-listings/add-property`).
- `AgentListingsPage.tsx`
  - Accept `mode?: "agent" | "user"` (default `"agent"`).
  - Replace hard‑coded routes with mode‑driven values for: add‑property URL, edit URL (`?submission=...`), and the “Add new property” button.
  - Gate any mock branches (`agentDashboardMockService`) to `mode === "agent"` only.

### 5.3 New thin route shells (only “new files” needed)
- `src/app/[locale]/(main)/my-listings/page.tsx` → wraps `AuthenticatedRouteGuard` + `<AgentListingsPage mode="user" />`.
- `src/app/[locale]/(main)/my-listings/add-property/page.tsx` → wraps `AuthenticatedRouteGuard` + `<AddPropertyPage mode="user" />`.

### 5.4 Header
- `AppHeader.tsx` → make “List Your Property” call `router.push('/{locale}/my-listings')` for `user`; remove the empty placeholder dialog (or keep state but route on click).
- `app-header.nav.json` → add a `userListings` profile menu entry for `roles: ["user"]`, path `/my-listings`.

### 5.5 Middleware (preferred: do nothing)
- Keep `agentRoutePattern` / `adminRoutePattern` exactly as‑is.
- `/my-listings/*` is intentionally **not** in either regex, so middleware won’t redirect users away from it. Auth gating is handled by `AuthenticatedRouteGuard`.
- Optional follow‑up: add a `userRoutePattern` only for the unauthenticated → login redirect case.

### 5.6 i18n
- Add keys (and translations) to all four locales: `common.myListings`, `myListings.title`, `myListings.subtitle`, optional `myListings.addNew`.

---

## 6. Backend / API expectations

No new endpoints. The existing endpoints in `propertySubmissions.api.ts` already use `authApi` and so authenticate any role. Backend assumptions to confirm:

- `POST /property-submissions` and `POST /property-submissions/submit` accept submitters whose role is `registered_user`.
- `GET /agent/properties` (and drafts) is scoped by **submitter**, not by role. If currently agent‑only, ask backend for a small filter change so the same endpoint serves users (or an alias `me/properties`).
- Admin moderation queue surfaces submissions from `registered_user` (no UI change needed if the queue already lists by submission status).

---

## 7. Permission matrix

| Capability | guest | user (new) | agent | admin |
|---|---|---|---|---|
| See header **List Your Property** | yes (opens auth) | yes (routes) | no | no |
| Open `/my-listings` | no | yes | redirected (handled by guard) | redirected |
| Open `/my-listings/add-property` | no | yes | redirected | redirected |
| Submit property | no | yes | yes | yes |
| Moderate / publish / assign agent | no | no | no | yes |

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Cookie‑based middleware drift | Don’t touch existing regexes; gate at the client guard for the new path. Track tighter middleware as a follow‑up (already on the audit roadmap). |
| Mock data leakage into user flow | Hard‑gate all mock branches in `AgentListingsPage` to `mode === "agent"`; audit before merge. |
| i18n gaps | Land new keys in all four locales in the same PR; `ar`/`es` already lag per audit. |
| Coupling of `AgentListingsPage` to two domains | Acceptable short term; planned move to `features/properties/listings/ListingsPage.tsx` per the Structure Plan as a non‑blocking follow‑up. |
| Backend filtering assumption | Confirm with backend that `/property-submissions` lists are submitter‑scoped before declaring done. |

---

## 9. Out of scope for US‑012

- Splitting mega files (`SearchFields.tsx`, `AddPropertyForm.tsx`, `AuthPopup.tsx`) — covered by Phase 2 of the audit.
- Removing global mocks from compare/admin/agent search pages — separate item.
- Restructuring `features/admin-agents` into `features/admin` + `features/agent` — already partially done; not required here.
- Moving `AgentListingsPage` to `features/properties/...` — recommended follow‑up, not a blocker.

---

## 10. Acceptance criteria

- Logged‑in user clicking **List Your Property** lands on `/{locale}/my-listings` (no placeholder dialog).
- `/my-listings` lists the user’s own properties and drafts via existing endpoints; mocks never appear in `mode === "user"`.
- **Add New Property** opens the existing wizard at `/{locale}/my-listings/add-property` and submits via the same API path used by agents.
- Resubmitting a `rejected` user submission behaves exactly like the agent path.
- Admin can review / edit / publish / assign an agent for user‑submitted records using the existing admin pages.
- Agents and admins do not see the **List Your Property** action; if they navigate to `/my-listings` they are redirected (by auth guard or layout).
- All new i18n keys have parity across `en`, `ar`, `es`, `fr`.

---

## 11. Phased rollout

**Phase 1 — Frontend reuse (low risk, no backend dependency)**
Type extension, props, two route shells, header rewire, nav.json entry, i18n keys.

**Phase 2 — Backend confirmation**
Validate (or request) submitter‑scoped filtering on `/agent/properties` and admin queue inclusion of `registered_user` submissions.

**Phase 3 — Polish & follow‑ups**
Localize copy with `myListings.*`, optional middleware hardening, optional move of `AgentListingsPage` into `features/properties/listings/`.

---

## 12. Summary verdict

The request is **feasible with minimal code**. The Add Property wizard, submissions API, and admin moderation are already role‑agnostic. The work for US‑012 is essentially:

1. One enum extension (`"user"` mode).
2. Two component prop additions (route URLs).
3. Two thin route files.
4. One header button rewire.
5. One nav.json entry + i18n keys.
6. One small backend confirmation.

This satisfies the “avoid duplication, reuse APIs/slices/listing tables” constraint of the change request.
