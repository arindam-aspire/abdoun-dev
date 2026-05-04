# Codebase maintenance audit

Maintenance-focused review of **abdoun_website** (Next 16, React 19, Redux Toolkit, axios). Grounded in the repository layout under `src/` and verified on the highest-impact items.

---

## Executive summary

The app uses a **central HTTP layer** (`src/lib/http`) and feature-oriented folders. The largest risks are **duplicated or diverging contracts** (especially **search URL parameters** and **auth vs main axios**), plus a **`"use client"` HTTP barrel** that can limit reuse of pure utilities from server or shared modules.

---

## High risk

### 1. Search budget query keys differ between home hero and search UI

| Location | URL keys |
|----------|----------|
| `src/features/public-home/components/HeroSearchCard.tsx` | `minPrice` / `maxPrice` |
| `src/features/property-search/components/SearchFieldsCore.tsx` | `budgetMin` / `budgetMax` (read + write in URL sync) |

A user who sets a budget on the **hero** and lands on search may not get the same budget state as someone using **search filters**, unless another layer normalizes those keys. This is easy to miss in review and hard to debug in production.

### 2. `@/lib/http/index.ts` is a client module

The file starts with `"use client"` and wires browser auth + `createClient`. Re-exporting `getApiErrorMessage`, envelope helpers, and types from the same entry means **any import from `@/lib/http` carries the client boundary**. Pure helpers (envelope parsing, error text) are harder to reuse from server code without pulling in the client graph.

### 3. Auth refresh path vs main API client

`RestAuthService` (`src/lib/auth/adapters/restAuthService.ts`) uses its **own** `axios.create` and envelope handling, while the rest of the app goes through `createClient` and shared interceptors. **401 / refresh / error shape** can drift between auth and other calls unless they are treated as one policy and tested together.

---

## Medium risk

| Area | What varies |
|------|---------------|
| **Feature API surface** | Endpoints appear behind `*Service.ts`, `*.api.ts`, and sometimes both—“where is this call defined?” has several correct answers. |
| **Errors** | Mix of `getApiErrorMessage`, `getIdentityErrorMessage`, `isFailedV1Envelope`, and some hand-rolled `AxiosError` / status checks (e.g. auth forms). |
| **Search query building** | Logic split across `queryStringBuilder`, `SearchFieldsCore`, and `propertyService`—rules for what goes on `/properties` can diverge. |
| **Data flow** | Redux thunks in many features vs hooks that call services directly elsewhere—two patterns for where server data lives. |
| **Transport** | **axios** for API; **fetch** for presigned S3 upload and similar—reasonable, but worth a short team convention so new code does not add a third path casually. |

---

## Lower risk

- **Imports**: Mostly `@/`; some relative paths in agent add-property and a few UI files.
- **File naming**: Mix of PascalCase and kebab-case under `components/ui`; `useS3Upload` under `components/...` instead of `hooks/`.
- **Env**: `process.env.NEXT_PUBLIC_*` in a few files rather than a single `env` module.
- **App Router usage**: Many pages are client wrappers; data fetching is largely client-side with Redux—consistent today, but different from a future RSC-heavy layout.
- **`any` / eslint**: Not widespread; charts and some types are the main non-test callouts.

---

## Prioritized recommendations

1. **Unify search budget URL params** (or add a single normalization step mapping `minPrice`/`maxPrice` → canonical `budgetMin`/`budgetMax` before URL sync and API calls).
2. **Split the HTTP package**: client-only `httpClients` (or keep `index` client-only) vs server-safe exports for `apiError` / `standardEnvelope` from paths without `"use client"`.
3. **Align `RestAuthService` with `createClient`** (shared instance/interceptors) or document and test the two stacks as one HTTP policy.
4. **Pick one public API entry per feature** (`*.api.ts` *or* `*Service.ts` as the only import surface) and keep the other internal.
5. **Short team note** on when `fetch` is allowed (e.g. S3 / blobs only) so the stack stays two-lane.

---

## Relation to existing standardization work

This aligns with **API standardization** docs in the repo (e.g. `API_INTEGRATION_STANDARDIZATION_CHECKLIST.md`). Remaining work is **enforcement at the edges**: hero search params, auth axios, and the HTTP barrel boundary.

---

## Stack reference (from `package.json`)

- Next **16.1.6**, React **19.2.3**
- **axios**, **@reduxjs/toolkit**, **react-redux**
- HTTP clients: `src/lib/http/clients.ts` → `createHttpClients` from `src/lib/http/index.ts`
