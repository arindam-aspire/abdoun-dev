# Code Structure Standardization Plan

## 1. Current Structure Summary

The project already has strong building blocks (`src/app`, `src/features`, `src/components`, `src/lib`, `src/store`, `src/messages`), but ownership is mixed:

- `src/app` uses App Router route groups well, but many pages are thin wrappers around components from both `features` and legacy `components/*` sections.
- `src/features` contains many domain modules, but one mega-domain (`admin-agents`) currently combines two domains (admin + agent) with deep nesting.
- `src/components` contains true shared UI (`ui`, `layout`) and many domain-specific screens (`dashboard`, `listing`, `lead`, `deal`, `search-result`, `about`, `team`, `our-services`).
- API calls are split across `src/services`, `src/features/*/api`, and `src/lib/profileApi.ts`.
- `src/lib` is mostly infrastructure (good), but also contains domain mock data and a domain-specific API module.
- `src/store` is correctly central, but includes at least one legacy/demo slice (`counter`).

Current state is workable, but there is no single ownership policy for where domain logic should live.

---

## 2. Problems With Current Structure

- **Mixed domain vs section ownership**
  - Example: `src/components/dashboard/*` overlaps with `src/features/admin-agents/*`.
- **API layer fragmentation**
  - Example: `src/services/propertyService.ts` and `src/features/property-search/api/propertySearch.api.ts` coexist.
- **Legacy service dumping**
  - `src/services` is a mixed folder with auth, user, property, onboarding, and mock services.
- **Domain code in shared folders**
  - Domain pages/components in `src/components/listing`, `src/components/lead`, `src/components/deal`, `src/components/search-result`.
- **Cross-cutting folder contains domain concerns**
  - `src/lib/profileApi.ts`, `src/lib/mocks/mockSearchResults.ts`.
- **Very large files mix concerns**
  - UI + orchestration + data mapping + validation in single files (e.g. search/add-property).
- **Over-coupled mega-feature**
  - `src/features/admin-agents` currently hides two distinct bounded contexts.

These patterns increase onboarding time, raise regression risk, and make standards harder to enforce across contributors.

---

## 3. Final Recommended Structure

```text
src/
  app/
    [locale]/
      (public)/
      (auth)/
      (dashboard)/
      layout.tsx
      loading.tsx
      error.tsx
      not-found.tsx

  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    properties/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    profile/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    admin/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    agent/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    compare/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    favourites/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    saved-searches/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

    settings/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/

  components/
    ui/
    layout/
    common/
    feedback/
    forms/

  lib/
    http/
    auth/
    i18n/
    config/
    constants/
    utils/

  store/
  messages/
  types/
```

Notes for this repo:
- Keep route groups in `app/[locale]` as-is functionally, but normalize naming over time to `(public)`, `(auth)`, `(dashboard)`.
- Split current `admin-agents` feature into `admin` and `agent` ownership boundaries.
- Merge fragmented property domains into one `features/properties` root with submodules (search, details, submissions) under it.

---

## 4. Ownership Rules

- **`app`**
  - Route entrypoints only: route composition, metadata, loading/error boundaries, route-level guards.
  - No business logic, no API shape mapping, no long form state machines.

- **`features`**
  - All domain/business code: domain UI, API adapters, hooks, schemas, types, domain utilities.
  - If a component only makes sense for one domain, it must live in that domain.

- **`components`**
  - Truly reusable building blocks only.
  - Must be domain-agnostic (no imports from `features/*`).

- **`lib`**
  - Cross-cutting infrastructure/utilities only (`http`, auth adapters, generic helpers, config parsing).
  - Must not contain domain APIs or domain mocks.

- **`store`**
  - Redux store setup, middleware wiring, root selectors, shared typed hooks only.
  - Feature slices live in `features/<domain>`.

- **`messages`**
  - Locale dictionaries only; consistent namespace policy required across all locales.

- **`types`**
  - Global shared contracts only (rare).
  - Domain types should default to `features/<domain>/types`.

---

## 5. Domain Mapping

| Current Area/File/Folder | Current Problem | Proposed Destination | Risk |
|--------------------------|----------------|----------------------|------|
| `src/services/propertyService.ts` | Global service folder anti-pattern; property logic mixed centrally | `src/features/properties/api/property.api.ts` + `features/properties/utils/*` | Medium |
| `src/services/userService.ts` | User/admin user management in global service | `src/features/admin/api/users.api.ts` (or `features/profile/api` for self profile parts) | Medium |
| `src/services/authService.ts` | Auth APIs outside auth feature | `src/features/auth/api/auth.api.ts` (consolidated) | Medium |
| `src/services/adminAgentApiService.ts` | Admin+agent concerns blended in service layer | Split into `src/features/admin/api/*` and `src/features/agent/api/*` | Medium |
| `src/services/agentOnboardingApiService.ts` | Agent domain API outside feature | `src/features/agent/api/onboarding.api.ts` | Low |
| `src/services/agentDashboardMockService.ts` | Domain mock service in production structure | `src/features/agent/api/mocks/*` (temp) then remove | Low |
| `src/services/leadInquiriesMockService.ts` | Mock in global service | `src/features/agent/api/mocks/*` or `src/mocks/*` | Low |
| `src/services/agentInviteMockService.ts` | Mock invite logic in service root | `src/features/agent/api/mocks/invite.mock.ts` | Low |
| `src/lib/profileApi.ts` | Domain API in cross-cutting lib | `src/features/profile/api/profile.api.ts` | Low |
| `src/lib/mocks/mockSearchResults.ts` | Domain mock data in `lib` | `src/features/properties/mocks/searchResults.mock.ts` or `src/mocks/properties/*` | Low |
| `src/components/dashboard/*` | Domain-specific dashboard screens in shared components | `src/features/admin/components/*` (and `features/agent/components/*` where relevant) | Medium |
| `src/components/listing/ListingsPage.tsx` | Domain page in shared layer | `src/features/agent/components/listings/*` | Medium |
| `src/components/lead/LeadsPage.tsx` | Domain page in shared layer | `src/features/agent/components/leads/*` | Medium |
| `src/components/deal/DealsPage.tsx` | Domain page in shared layer | `src/features/agent/components/deals/*` | Medium |
| `src/components/search-result/SearchFields.tsx` | Huge domain-heavy component in shared folder | `src/features/properties/components/search/SearchFields.tsx` (then split) | High |
| `src/features/admin-agents/*` | Two bounded contexts combined | Split into `src/features/admin/*` and `src/features/agent/*` | High |
| `src/types/auth.ts` (mock credentials constants) | Runtime mock constants mixed with type definitions | Types remain in `types`; mock constants move to `mocks` or test-only fixtures | Medium |

---

## 6. Migration Strategy

### Phase 1 — No-risk cleanup

Focus: establish folder conventions without changing behavior.

1. Create missing top-level structural folders: `components/common`, `components/feedback`, `components/forms`, `lib/config`, `lib/constants`, `lib/utils`.
2. Add architecture README (`docs/architecture/structure.md`) defining ownership rules.
3. Mark legacy folders as transitional (`services`, selected `components/*` domain folders) in docs.
4. Identify and isolate mock-only files list for controlled movement later.

### Phase 2 — Feature API alignment

Focus: API ownership consistency.

1. Move service APIs from `src/services/*` into domain `features/*/api`.
2. Migrate `src/lib/profileApi.ts` into `features/profile/api`.
3. Keep stable re-export shims temporarily to reduce import churn.
4. Standardize naming: `*.api.ts` inside feature API folders.

### Phase 3 — Component ownership cleanup

Focus: move domain UI out of shared layer.

1. Move `components/dashboard`, `listing`, `lead`, `deal`, `search-result` into proper feature domains.
2. Keep `components/ui` and `components/layout` strictly shared.
3. Move domain-specific form widgets from `components/ui` into features when not reusable.
4. Add lint boundary checks (or custom rule) to prevent regressions.

### Phase 4 — Large component split

Focus: maintainability after ownership is clear.

1. Split very large files into presentational subcomponents + hooks + mappers.
2. Prioritize:
   - `src/components/search-result/SearchFields.tsx`
   - `src/features/admin-agents/agent-dashboard/components/add-property/AddPropertyForm.tsx`
   - `src/features/auth/components/modals/AuthPopup.tsx`
3. Enforce soft file-size guardrails (for example, warning above 300-400 LOC).

### Phase 5 — Final cleanup

Focus: remove transitional structure.

1. Remove legacy `src/services` after all usages are migrated.
2. Remove temporary compatibility re-exports.
3. Normalize route groups naming and align app composition paths.
4. Update barrel exports and import paths.
5. Run full regression pass (critical auth, property search/details, admin dashboard, i18n routing).

---

## 7. Import Rules

- Use absolute imports from `@/` only.
- `app` may compose features, but cannot host domain logic.
- Feature-to-feature imports are allowed only through explicit public entrypoints (e.g., `features/<domain>/index.ts`).
- Shared `components/*` must not import from `features/*`.
- `lib/*` must not import from `features/*`.
- `store/*` may import slices/selectors from features, but features should not import from `app/*`.
- `types/*` global types must stay generic; domain-specific contracts stay within each feature.

---

## 8. Do Not Change Yet

These areas are high-risk and should not be moved before deeper dependency review:

- `middleware.ts` and all role/locale redirect contracts.
- `src/lib/http/createClient.ts` and auth refresh queue logic.
- `src/lib/auth/*` adapters and session cookie contract.
- `src/app/[locale]/*` route tree itself (move internals first, routes later).
- `src/store/index.ts` reducer wiring until feature split plan is complete.
- Large admin/agent workflows tied to backend contracts:
  - property submission flows
  - dashboard summary/trends APIs
  - invite/onboarding/auth flows

---

This plan is intentionally incremental: establish ownership first, then move APIs, then move components, then split large files. That ordering minimizes regression risk in this live multilingual project.
