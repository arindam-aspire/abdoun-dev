# Codebase Audit Report — Abdoun Next.js Frontend

**Audit date:** 2026-04-30  
**Scope:** Read-only review of structure, Next.js usage, React/TS patterns, API/i18n/auth, styling, tests, and delivery risks.  
**Method:** Repository scan (`src/`, configs, messages); no code changes were made.

---

## 1. Executive Summary

The project is a **Next.js 16 App Router** application with **next-intl** (`localePrefix: "always"`), **Redux Toolkit** for global client state, and **Axios** behind a small HTTP layer (`createClient`, envelope peeling, token refresh). The architecture is **capable and partially modular** (`features/*`, `components/*`, `lib/*`), but **several “scaffold / demo” paths remain wired into customer-facing flows**: mock listings, mock dashboards, mock credentials branches, and large single-file UI modules. **Non-English locales are materially incomplete** versus English (~177 missing leaf keys in `ar` and `es` by automated comparison). **TypeScript strict mode is on**, with limited production use of `any` outside tests and Chart.js plugin code.

**Overall health:** **Moderate — shippable core exists**, but **inconsistency, mock leakage, i18n gaps, and oversized components** undermine a polished, professional handover unless addressed in a focused cleanup pass.

---

## 2. Key Risks Before Customer Delivery

1. **Mock data and dev shortcuts in live routes** — Compare, admin/agent search UIs, listings/inquiries pages, and auth popup paths still reference mock modules or constants; this reads as unfinished and can diverge from real API behavior.
2. **Incomplete translations** — `ar` / `es` (and to a lesser extent `fr`) are missing many keys present in `en`; users will see missing-message behavior or English fallbacks depending on next-intl configuration.
3. **Security / session model clarity** — Role-based middleware relies on **client-readable cookies** (`abdoun_role`, `abdoun_user`); this is convenient for edge middleware but is **not a server-only session** and should be reviewed for XSS and tampering expectations alongside the real backend auth model.
4. **Maintainability hotspots** — Very large components (e.g. **~2000+ lines** in search UI) increase regression risk for any change and signal “AI/live-coded” accumulation.
5. **No checked-in env documentation** — No `.env.example` was found; onboarding and deployment are error-prone (`NEXT_PUBLIC_API_BASE_URL`, maps key, feature flags in sidebar/header config).

---

## 3. Inconsistency Inventory

| Area | Current Observation | Example Files | Risk | Recommended Standard |
|------|---------------------|---------------|------|----------------------|
| **Folder / module layout** | Feature slices coexist with legacy `services/*`, `components/*` dashboards, and `lib/*` API helpers; boundaries are fuzzy. | `src/services/propertyService.ts`, `src/features/*/api/*.api.ts`, `src/lib/profileApi.ts` | Medium — hard to know “the one way” to add an endpoint | **Single rule:** domain API in `features/<domain>/api/`; thin wrappers only; deprecate duplicate `lib/*` API files over time. |
| **API client lifecycle** | Each module calls `createHttpClients()` locally → **new Axios instances** per import site (same config, separate interceptors/queues). | `src/features/favourites/api/favourites.api.ts`, `src/services/authService.ts`, many `*.api.ts` | Low–Medium — subtle bugs, duplicated interceptors | **One shared module** exporting `publicApi` / `authApi` (or a factory called once per app lifetime on client). |
| **HTTP vs fetch** | Most calls use Axios; **presigned S3 / blob** uses `fetch`. | `src/features/admin-agents/agent-dashboard/api/uploads.api.ts`, `src/features/profile/api/profilePicture.api.ts` | Low — justified for uploads | Document: **Axios for JSON API; fetch only for binary / presigned URLs**. |
| **Server vs client components** | Most route `page.tsx` files are **`"use client"`**; limited use of RSC for data/metadata. | `src/app/[locale]/(main)/page.tsx`, many under `src/app/[locale]/` | Medium — larger client bundles, less SEO leverage on some pages | Use **server pages + client islands** where data is public and static metadata matters; keep client for dashboards. |
| **Metadata** | **Global** `metadata` in root layout only; child routes do not define `generateMetadata`. | `src/app/layout.tsx` | Medium — weak per-page SEO/social | Add **per-route metadata** for marketing pages and property detail when stable slugs/IDs exist. |
| **i18n namespaces** | Wrapper `useTranslations` constrains namespaces but allows `(string & {})`, so **typos are not caught**. | `src/hooks/useTranslations.ts` | Low — DX / consistency | Prefer **typed namespaces** or codegen; align with `messages/*.json` structure. |
| **Translation completeness** | **`ar` / `es`: ~177 fewer leaf keys than `en`**; `fr` has a small extra subtree (`WhyChooseUs.*`) not in `en`. | `src/messages/en.json` vs `ar.json`, `es.json`, `fr.json` | **High** for multilingual delivery | **Sync keys** across locales; CI check for parity; define fallback policy. |
| **Hardcoded UI strings** | Some guards and UI use **literal English** (not only translations). | `src/components/layout/AuthenticatedRouteGuard.tsx` (“We’re checking your session…”) | Medium — unprofessional in non-EN locales | Move to `common` or `auth` namespace. |
| **Styling** | Mostly **Tailwind**; some **`style={{ }}`** and raw `<img>` with eslint disables. | Various; `src/components/ui/avatar.tsx`, `src/features/profile/components/ProfileForm.tsx` | Low–Medium — inconsistent optimization/a11y | Prefer **`next/image`** where possible; centralize exceptions. |
| **Forms** | **`react-hook-form` is barely used** (dependency present); much validation is **manual state**. | `package.json`; only `ProfileForm.tsx` / `PhoneNumberInputField.tsx` import it | Medium — inconsistent validation UX | Standardize on **RHF + zod** (or one pattern) for new forms. |
| **State** | **Redux** for domains + **`counter` slice registered but unused** in app code. | `src/store/index.ts`, `src/features/counter/counterSlice.ts` | Low — noise / bundle | Remove demo slice when safe. |
| **Auth / guards** | **Middleware** (cookie role) + **client guards** (`AgentRouteGuard`, `AdminRouteGuard`, `AuthenticatedRouteGuard`). | `middleware.ts`, `src/components/layout/*Guard.tsx` | Medium — duplicated rules can drift | Document matrix: **middleware vs client** responsibilities; single source of truth for role checks. |
| **Testing** | Jest configured with **narrow `collectCoverageFrom`** and comment **“mid-refactor”**; many areas untested. | `jest.config.js` | Medium — regression risk | Expand coverage for auth, HTTP envelope, and one critical user journey. |
| **Config / env** | **No `.env.example`** in repo; env usage scattered. | `src/lib/http/index.ts`, `src/components/map/LocationPicker.tsx`, sidebar/header config | Medium | Add **`.env.example`** + short README section. |

---

## 4. Pattern Comparison

The same concern is often implemented **more than one way**:

| Concern | Variations observed |
|---------|---------------------|
| **API access** | `services/*.ts` (large), `features/*/api/*.api.ts` (thin wrappers), `lib/profileApi.ts` (parallel client), direct `createHttpClients()` per file. |
| **Error messages** | `getApiErrorMessage`, `isFailedV1Envelope` / `readV1EnvelopeMessage`, ad-hoc `isAxiosError` checks in components. |
| **Loading / empty / error** | Shared pieces exist (`LoadingScreen`, `ListEmpty`, `ListError`, skeletons) but usage is **not uniform** across admin/agent pages. |
| **Listings / search results** | **Live API** (`propertyService`, feature APIs) vs **`MOCK_SEARCH_RESULTS`** (`lib/mocks/mockSearchResults.ts`) in admin/agent result components and compare page. |
| **Dashboard / leads / deals** | **`agentDashboardMockService`**, **`leadInquiriesMockService`** used alongside real API modules. |
| **Auth login UX** | Real OTP/password flows via `features/auth/api/auth.api.ts` **plus** **`MOCK_AGENT_CREDENTIALS` / `MOCK_ADMIN_CREDENTIALS`** in `AuthPopup.tsx`. |
| **i18n** | `next-intl` + custom `useTranslations` wrapper; some pages use translations heavily, others hardcode English. |
| **Property cards** | Multiple card implementations (`PropertyCard`, `PropertyCardNew`, list/grid variants) — similar UI with duplicated layout logic. |
| **Date / currency / formatting** | Not fully audited line-by-line; risk of **inline formatting** vs shared helpers (recommend verifying `property-details` and search cards). |
| **Pagination** | `Pagination` UI component exists; confirm all list endpoints use one pagination contract (not verified endpoint-by-endpoint). |

---

## 5. Recommended Project Standards

| Topic | Standard |
|-------|----------|
| **Folder structure** | Keep **`src/app`** routes thin; **`src/features/<domain>`** owns UI + hooks + api + types; **`src/components/ui`** for primitives; **`src/lib`** for cross-cutting infra only (http, auth adapters). Migrate legacy `services/*` into features incrementally. |
| **Component structure** | **&lt; 300 lines** per file as a soft cap; extract subcomponents and hooks when exceeded. |
| **API client** | **Single module** exporting configured `publicApi` / `authApi`; feature files import instances, not `createHttpClients()` each time. |
| **Error handling** | **Always** map Axios/envelope errors through **`getApiErrorMessage`** (and envelope helpers where applicable); avoid duplicate parsing in pages. |
| **Loading / empty / error** | Pick **one pattern** per list page: skeleton → data → `ListError` / toast; document it in a short internal guideline. |
| **i18n usage** | **No user-visible literals** in JSX for supported locales; keys **parity-checked** across `en`, `ar`, `es`, `fr`. |
| **TypeScript models** | **DTO types next to API** (`features/.../types.ts`); avoid `any` in domain models (`media?: any` in property types should become a concrete union/interface). |
| **Styling** | **Tailwind + existing CSS variables**; reserve inline styles for unavoidable dynamic values; **`next/image`** for content images unless documented exception. |
| **Forms** | **react-hook-form + zod** (or one chosen stack) for new work; migrate high-traffic forms first. |
| **Auth** | Treat **middleware** as coarse routing; **server-validated session** (or documented cookie contract) for sensitive actions; remove mock credential paths from production builds via env flag. |
| **Environment variables** | **`NEXT_PUBLIC_*` only** for truly public config; **`.env.example`** listing all required vars; no secrets in client bundles. |

---

## 6. Refactoring Roadmap

### Phase 1 – Must Fix Before Delivery

| Item | Priority | Change risk | Suggested order |
|------|----------|-------------|-----------------|
| Remove or **gate mock data** (compare, admin/agent search, listings, inquiries, deals) behind explicit `NEXT_PUBLIC_USE_MOCKS` default **false** | High | Medium | 1 |
| Remove or **build-flag mock admin/agent login** in `AuthPopup` | High | Medium | 2 |
| **Sync translation keys** across locales; verify UI in `ar` / `es` / `fr` | High | Low | 3 |
| Add **`.env.example`** and verify `NEXT_PUBLIC_API_BASE_URL` / maps / toggles documented | High | Low | 4 |
| Replace hardcoded guard strings (e.g. session redirect copy) with translations | Medium | Low | 5 |

### Phase 2 – Code Quality Cleanup

| Item | Priority | Change risk | Suggested order |
|------|----------|-------------|-----------------|
| **Split mega-files** (`SearchFields.tsx`, `AddPropertyForm.tsx`, large admin pages) | High | Medium | 1 |
| Consolidate **HTTP client** singletons; reduce duplicate `createHttpClients()` | Medium | Medium | 2 |
| Merge **`lib/profileApi`** into `features/profile/api` (single import path) | Medium | Medium | 3 |
| Remove unused **`counter`** slice from store | Low | Low | 4 |
| **Console logging** cleanup in production paths (or use a logger with levels) | Medium | Low | 5 |
| **Commented-out code** (e.g. recently-viewed handlers) — delete or finish | Low | Low | 6 |

### Phase 3 – Long-Term Architecture Improvement

| Item | Priority | Change risk | Suggested order |
|------|----------|-------------|-----------------|
| Introduce **server components** for public marketing pages + **per-route metadata** | Medium | Medium | 1 |
| Unify **property card** variants into one parameterized component | Low | Medium | 2 |
| Expand **Jest** coverage beyond current “phase” list; add API/envelope tests | Medium | Low | 3 |
| **Accessibility** pass on modals, tables, and forms (Headless UI + custom components) | Medium | Medium | 4 |
| Evaluate **cookie-based role middleware** vs server session for long-term security posture | High | High | 5 (planning only until backend alignment) |

---

## 7. Files Requiring Attention (First Pass)

**Highest impact / clearest cleanup targets:**

- `src/components/search-result/SearchFields.tsx` — **~2091 lines**; primary maintainability risk.
- `src/features/admin-agents/agent-dashboard/components/add-property/AddPropertyForm.tsx` — **~1674 lines**.
- `src/features/auth/components/modals/AuthPopup.tsx` — **mock credentials**, complex flow, long file.
- `src/app/[locale]/(main)/compare/page.tsx` — **`MOCK_SEARCH_RESULTS`** in route.
- `src/features/admin-agents/admin-dashboard/components/admin-properties/AdminSearchResults.tsx`, `src/features/admin-agents/agent-dashboard/components/agent-properties/AgentSearchResults.tsx` — **mock listings**.
- `src/features/admin-agents/agent-dashboard/components/AgentListingsPage.tsx`, `src/components/listing/ListingsPage.tsx`, `src/features/admin-agents/agent-dashboard/components/AgentInquiriesPage.tsx`, `src/components/lead/LeadsPage.tsx`, `src/components/deal/DealsPage.tsx` — **mock services**.
- `src/features/admin-agents/admin-dashboard/components/property-details/AdminPropertyDetailsMain.tsx`, `src/features/admin-agents/agent-dashboard/components/agent-properties/AgentPropertyDetails.tsx` — **inline mock property/stats**.
- `src/messages/ar.json`, `es.json`, `fr.json` — **key parity** vs `en.json`.
- `src/hooks/useTranslations.ts` — tighten namespace typing when messages stabilize.
- `src/store/index.ts` — remove unused `counter` when approved.

---

## 8. Do Not Change Yet (Without Deeper Review)

- **`middleware.ts` route regexes and role redirects** — Easy to break deep links and admin/agent navigation; needs a **route matrix** and QA before edits.
- **`src/lib/http/createClient.ts`** — Token refresh queue, 401 handling, and **`peelV1EnvelopeForAxios`** are central; changes affect **all APIs**.
- **Auth cookie contract** (`sessionCookies.ts`) — Must stay aligned with backend and middleware assumptions.
- **Redux slices wired to many pages** — Wide blast radius; prefer incremental refactors with tests.
- **Property submission / upload pipeline** (presigned URLs, S3) — High regression cost; any abstraction change should be staged.

---

## Appendix – Scan Notes

- **App Router only** (no `pages/` router observed under `src/app`).
- **Packages:** React 19, Next 16, next-intl 4, RTK 2, Axios 1, Tailwind 4, RHF present but minimally adopted.
- **Tests:** Jest + Testing Library; coverage scope explicitly limited in `jest.config.js`.
- **Console usage (non-test):** Small set of `console.log` / `console.warn` calls (e.g. invite validation, maps permission, avatar refresh).
- **`any` (non-test):** Notably `src/features/property-details/types.ts` (`media?: any`), Chart.js plugin typings in `SparkBarsChart.tsx`.

---

*End of report.*
