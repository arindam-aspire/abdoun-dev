# Cursor AI Implementation Prompt
# Feature: EP-007 → US-012
# Register User Property Listing Reuse Flow

You are working on an existing production codebase.

Your task is to implement:
"Registered User Property Listing using the SAME Agent Listing + Add Property flow"

IMPORTANT:
- Reuse existing implementation
- DO NOT create duplicate components
- DO NOT create duplicate APIs
- DO NOT create duplicate Redux slices
- DO NOT rewrite existing workflows
- Implement incrementally
- Create TODOs first
- Complete one task at a time
- Test after every task
- Fix errors immediately before moving forward

You MUST follow the implementation plan below strictly.

---

# HIGH LEVEL GOAL

When a logged-in Registered User clicks:

```txt
List Your Property
```

they should:

```txt
Redirect to:
/[locale]/my-listings
```

Then:
- use the SAME listings page as agents
- use the SAME Add Property wizard
- use the SAME APIs
- use the SAME moderation workflow

Only:
- routing
- permissions
- mode handling
should change.

---

# CRITICAL RULES

## DO NOT
- Create new Add Property components
- Create new listing components
- Create new Redux slices
- Create new submission APIs
- Duplicate agent logic
- Create parallel workflows

## MUST REUSE
- AddPropertyPage.tsx
- AddPropertyWizard.tsx
- AgentListingsPage.tsx
- addPropertyWizardSlice.ts
- propertySubmissions.api.ts

---

# DEVELOPMENT STRATEGY

You MUST:

1. Analyze current implementation
2. Create a TODO checklist
3. Implement ONE task at a time
4. Run tests after EACH task
5. Fix errors immediately
6. Commit mentally before next task
7. After all tasks:
   - run full lint
   - run typecheck
   - run tests
   - verify routes
   - verify UI flow
   - verify permissions
8. Fix all issues found
9. Only finish when everything works

DO NOT batch all changes blindly.

---

# IMPLEMENTATION TASKS

# TASK 1 — ANALYZE CURRENT IMPLEMENTATION

Inspect and understand:

## Frontend
- AddPropertyPage.tsx
- AddPropertyWizard.tsx
- AgentListingsPage.tsx
- addPropertyWizardSlice.ts
- propertySubmissions.api.ts
- AppHeader.tsx
- app-header.nav.json
- middleware.ts
- route guards

## Backend
- property_submissions.py
- submission ownership validation
- listing filtering

Before coding:
- understand route flow
- understand listing flow
- understand edit flow
- understand submission flow

After analysis:
Create a TODO checklist.

DO NOT START CODING YET.

---

# TASK 2 — EXTEND MODE TYPES

Update all relevant types.

Add:
```ts
"user"
```

to:
```ts
"agent" | "admin"
```

Requirements:
- no type errors
- no regressions

TEST:
- run typecheck
- fix all TS errors

Only continue when clean.

---

# TASK 3 — CREATE USER ROUTES

Create thin wrapper routes ONLY.

Create:
```txt
src/app/[locale]/(main)/my-listings/page.tsx
```

Use:
```tsx
<AgentListingsPage mode="user" />
```

Create:
```txt
src/app/[locale]/(main)/my-listings/add-property/page.tsx
```

Use:
```tsx
<AddPropertyPage mode="user" />
```

Requirements:
- no duplicated logic
- only wrappers

TEST:
- route loads correctly
- authenticated access works
- unauthorized users blocked

Fix issues before continuing.

---

# TASK 4 — UPDATE HEADER FLOW

Update:
```txt
AppHeader.tsx
```

Current behavior:
- placeholder modal opens

New behavior:
- authenticated user → redirect to `/[locale]/my-listings`
- guest user → open login/auth flow

Requirements:
- preserve existing behavior for guests
- remove broken placeholder logic

TEST:
- guest click
- authenticated click
- locale-aware navigation

Fix issues before continuing.

---

# TASK 5 — REUSE AGENT LISTINGS PAGE

Update:
```txt
AgentListingsPage.tsx
```

Requirements:
- support:
```ts
mode="user"
```

Replace hardcoded:
```txt
/agent-dashboard/*
```

with dynamic routes.

Dynamic behavior:
- add property URL
- edit listing URL
- back navigation
- breadcrumbs if applicable

DO NOT duplicate component.

TEST:
- user listings page loads
- add property button works
- edit flow works
- drafts visible
- pagination works

Fix issues before continuing.

---

# TASK 6 — REUSE ADD PROPERTY FLOW

Update:
```txt
AddPropertyPage.tsx
```

Requirements:
- support:
```ts
mode="user"
```

Update:
- listingsHref
- navigation handling
- leave guards
- route checks

DO NOT duplicate wizard logic.

TEST:
- add property opens
- draft save works
- edit draft works
- rejected resubmit works
- submit works

Fix issues before continuing.

---

# TASK 7 — VERIFY API REUSE

Reuse ONLY:
```http
POST /property-submissions
PATCH /property-submissions/{id}
POST /property-submissions/{id}/submit
GET /property-submissions/{id}
```

DO NOT CREATE NEW APIs.

Verify:
- authenticated user can create drafts
- authenticated user can submit
- ownership filtering works

If backend permission issue exists:
- minimally extend authorization
- DO NOT rewrite services

TEST:
- draft create
- patch
- submit
- fetch own submission
- edit rejected

Fix issues before continuing.

---

# TASK 8 — VERIFY SECURITY

Ensure:
- user can only access own listings
- user cannot edit others’ listings
- approved listings locked
- verified listings locked

Verify backend ownership checks.

TEST:
- manual URL tampering
- direct API access
- unauthorized edit attempts

Fix all vulnerabilities immediately.

---

# TASK 9 — REMOVE/GATE MOCK DATA

Inspect:
```txt
AgentListingsPage.tsx
```

Requirements:
- no mock data in user mode
- no fake listings
- no mock service usage

If mocks exist:
- disable for:
```ts
mode === "user"
```

TEST:
- only real API data appears

Fix issues before continuing.

---

# TASK 10 — ADD I18N KEYS

Add translations for:
- English
- Arabic
- French
- Spanish

Keys:
```json
{
  "myListings": "",
  "listYourProperty": "",
  "addNewProperty": ""
}
```

Requirements:
- no missing translations
- RTL support preserved

TEST:
- all locales
- RTL layout

Fix issues before continuing.

---

# TASK 11 — FULL FLOW TESTING

Test COMPLETE FLOW:

## Guest Flow
```txt
Guest
→ Click List Your Property
→ Auth/Login
```

## Registered User Flow
```txt
Login
→ My Listings
→ Add Property
→ Save Draft
→ Edit Draft
→ Submit
→ View Submitted Status
```

## Rejected Flow
```txt
Rejected Listing
→ Edit
→ Resubmit
```

## Locked Flow
```txt
Approved Listing
→ Cannot Edit
```

---

# TASK 12 — FINAL QA

Run:
- lint
- typecheck
- build
- tests

Verify:
- no console errors
- no hydration issues
- no route issues
- no permission regressions
- no duplicated code introduced

Fix EVERYTHING found.

---

# FINAL VALIDATION CHECKLIST

Before completion verify:

- Registered user sees "List Your Property"
- User redirected to `/my-listings`
- Existing listing page reused
- Existing wizard reused
- Existing APIs reused
- Existing moderation flow reused
- No duplicate components created
- No duplicate APIs created
- Draft flow works
- Edit flow works
- Submit flow works
- Rejected flow works
- Admin moderation still works
- Mobile works
- RTL works
- Typecheck passes
- Lint passes
- Build passes

---

# IMPORTANT ENGINEERING REQUIREMENT

This implementation MUST:
- minimize code changes
- maximize reuse
- avoid regressions
- avoid architecture duplication

Prefer:
- parameterization
- prop-driven behavior
- route wrappers

over:
- forks
- copies
- rewrites

DO NOT finish until the full flow is tested and working end-to-end.
