# Authentication & Access Frontend Refactor Guide

## 1. Current Implementation

The Authentication & Access area is implemented across:

- **Pages**: `src/app/[locale]/(auth)/login/page.tsx`, `agent-login`, `agent-invite` routes.
- **Components**: `src/components/auth/AuthPopup.tsx` and its popup-step components; `src/components/layout/AppHeader.tsx`; `src/components/layout/AgentRouteGuard.tsx`; `src/components/layout/AdminRouteGuard.tsx`.
- **State**: `src/features/auth/authSlice.ts` (userId-based auth state) plus profile data in `profileSlice`.
- **Auth/session helpers**: `src/lib/auth/sessionCookies.ts`, `src/lib/auth/adapters/localStorageTokenStore.ts`, `src/lib/auth/adapters/restAuthService.ts`.
- **HTTP**: `src/lib/http/index.ts` and `createClient.ts` configure Axios clients with token store, refresh logic, and logout handling.
- **Routing protection**: `middleware.ts` checks a role cookie for admin dashboard; client guards read cookies and hydrate Redux if needed.

Auth flows are currently:

- Login and AuthPopup trigger calls into the auth service and/or mock flows, then:
  - Persist tokens via `LocalStorageTokenStore`.
  - Persist session/role in browser cookies with `persistAuthSession`.
  - Dispatch `authSlice.login` and hydrate the profile slice.
- Guards and middleware read the role cookie and session cookie directly to determine access.

## 2. Problems Identified

From the audit and plan:

- **Security issues**:
  - Auth cookies are not `HttpOnly`/`Secure` and are trusted directly by middleware and guards.
  - Access/refresh tokens are stored in `localStorage`, increasing XSS impact.
- **Duplication and coupling**:
  - Session and role are read/written in multiple places (middleware, guards, header, UI provider).
  - Guards duplicate logic for hydrating Redux from cookies.
- **Separation of concerns**:
  - `AuthPopup` mixes complex UI with auth orchestration, Redux updates, cookie persistence, and routing.
  - Auth hooks combine validation, networking, state, and navigation in single functions.
- **API layering**:
  - Auth-related HTTP calls live in `restAuthService.ts` and are used via ad-hoc wiring, not a clearly scoped feature API module.

## 3. Refactor Objectives

- Introduce a **single, composable auth/session abstraction** for reading/writing auth state on the client.
- Keep all **API endpoints and payloads unchanged**, wrapping existing services behind a feature-local API module.
- Ensure **route protection** uses a normalized session/permission model instead of raw cookie checks.
- Gradually **thin down UI components** (especially `AuthPopup`) so they delegate to hooks/services.
- Improve **testability and maintainability** of auth flows while preserving all current user-visible behavior.

## 4. Proposed Folder Structure

```text
src/
  features/
    auth/
      api/
        auth.api.ts
      store/
        authSlice.ts          // current slice moved or re-exported here
      hooks/
        useLogin.ts
        useAgentLogin.ts
      components/
        AuthPopup/
          AuthPopup.tsx
          AuthPopupEmailStep.tsx
          AuthPopupSignupStep.tsx
      types.ts
  lib/
    auth/
      sessionManager.ts       // thin abstraction over cookies + token store
      sessionCookies.ts       // existing implementation, preserved
      adapters/
        localStorageTokenStore.ts
        restAuthService.ts
  permissions/
    model.ts                  // roles/permissions mapping
```

Benefits:

- All auth concerns live under `src/features/auth` and `src/lib/auth`.
- Route guards and middleware depend on higher-level session/permission abstractions rather than raw cookies.
- Hooks and components are easier to test and evolve independently.

## 5. What Will Change

| Area        | Current                                                   | After Refactor                                                   |
| ----------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| Components  | `AuthPopup` mixes UI, auth, routing, cookies             | `AuthPopup` delegates to hooks/services, stays mostly UI         |
| API Calls   | Spread between `restAuthService`, components, and thunks | Centralized in `src/features/auth/api/auth.api.ts`               |
| State       | `authSlice` + scattered cookie reads                     | `authSlice` + `sessionManager` as single auth/session source     |
| Guards      | Direct cookie reads + duplicated hydration logic         | Use `useSession()` and permission helpers from `permissions`     |
| Middleware  | Trusts client-written role cookie                        | Uses normalized session/role from shared helper (behavior same)  |

## 6. Step-by-Step Safe Refactor Plan

### Step 1 — Introduce Auth API Module

- Create `src/features/auth/api/auth.api.ts` that wraps existing calls from `restAuthService` and any login endpoints.
- Export functions like `loginWithPassword`, `refreshTokens`, `logout`, each calling the **same URLs** with the **same payloads** and returning the same shapes.
- Update existing thunks or services to import from this module internally, but do not touch component call sites yet.

### Step 2 — Centralize Session Handling

- Ensure `src/lib/auth/sessionManager.ts` exposes:
  - `getCurrentSession()` – returns `{ user, role, tokens }` by deferring to existing cookie and localStorage utilities.
  - `persistSession(session)` – calls `persistAuthSession` and `LocalStorageTokenStore.setTokens`.
  - `clearSession()` – calls `clearAuthSession` and `LocalStorageTokenStore.clearTokens`.
- Replace scattered reads/writes:
  - In guards and header flows, call `getCurrentSession()` (or a wrapper hook) instead of using `sessionCookies` directly.
  - Keep cookie names and shapes unchanged to preserve backend integration.

### Step 3 — Introduce Permission Model

- Use `src/permissions/model.ts` to:
  - Define `AppRole` (including `public`) and a small set of permission constants.
  - Implement `derivePermissionsFromSession(session)`.
- Introduce basic `RoleGuard`/`PermissionGuard` components in `src/components/ui` (or `src/permissions`) that:
  - Accept required roles/permissions as props.
  - Use the existing Redux/auth state + `sessionManager` under the hood.
  - Render children or nothing/fallback, but do not change existing routes yet.

### Step 4 — Adapt Guards (AgentRouteGuard, AdminRouteGuard)

- Update `AgentRouteGuard` and `AdminRouteGuard` to:
  - Use a common `useSession()` hook that internally calls `getCurrentSession()` and reuses `authSlice`/profile.
  - Avoid re-implementing cookie parsing or token logic.
  - Keep the same redirect paths (`/${locale}`) and “Redirecting…” UI.

### Step 5 — Thin AuthPopup and Login Page

- Introduce hooks such as:
  - `useLogin` (in `src/features/auth/hooks/useLogin.ts`) to encapsulate auth API calls, Redux updates, session persistence, and navigation.
- Refactor `AuthPopup` and login page to:
  - Call these hooks instead of directly performing side effects.
  - Keep the same fields, validation, and navigation targets.

### Step 6 — Tests & Quality Gates

- Add tests under `src/features/auth/__tests__/` for:
  - `authSlice` reducers (`login`, `logout`).
  - `sessionManager` behavior in browser context.
  - `AgentRouteGuard` and `AdminRouteGuard` basic access rules.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit` to ensure no regressions.

## 7. API Safety Rules

- Do **not** change:
  - Auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`, or equivalent).
  - HTTP methods, path parameters, or query params.
  - Request payload field names or response formats.
- The new `auth.api.ts` module is a thin wrapper over existing services, not a new contract layer.

## 8. UI Behavior Safety Rules

- Preserve:
  - All login and signup flows as described in `EXISTING_FEATURES.md`.
  - Redirect targets after login/logout.
  - When the AuthPopup appears, closes, and what it shows.
  - Guard behavior (which roles can see agent/admin routes).
- Any tightening of security (e.g., safer session handling) must **not** remove legitimate access for current roles.

## 9. Testing Checklist

- Login page:
  - Renders correctly in all locales.
  - Accepts credentials and performs the same API calls.
  - Redirects to the same routes after login.
- AuthPopup:
  - Opens from header, handles steps correctly, and closes properly.
- Guards:
  - Authenticated users with correct roles can access protected routes.
  - Others are redirected as before.
- Logout:
  - Clears session and tokens and redirects correctly.

## 10. Dependencies With Other Modules

- **Profile module**: Reads and updates user details; depends on auth session/user identity.
- **Agent Dashboard, Agent Properties, Inquiries & Leads**: Require `agent` role for access.
- **Admin Dashboard, Admin Agents, Admin Properties**: Require `admin` role and permissions.
- **Header and navigation**: Rely on auth state to show profile menu and authenticated links. The refactor must keep these integrations stable.

---

## Refactor completion notes

- **Done**: Auth API module (`src/features/auth/api/auth.api.ts`) wraps `authService`; same endpoints and payloads.
- **Done**: `sessionManager.ts` provides `getCurrentSession()`, `persistSession()`, `clearSession()`, `getStoredTokens()`.
- **Done**: `permissions/model.ts` defines `AppRole`, `PERMISSIONS`, `derivePermissionsFromSession()`.
- **Done**: `useSession()` hook hydrates Redux from session; `AgentRouteGuard` and `AdminRouteGuard` use it.
- **Done**: `useLogin()` hook provides `loginAndPersist` and `persistSessionAndLogin`; `AuthPopup` and `UiProvider` use auth API/sessionManager.
- **Done (tests)**: Jest configured. Unit tests added for `authSlice`, `sessionManager`, `permissions/model`, `useLogin`, `useSession`.
- **Unchanged**: Login page (demo flow), API contracts, redirect paths, guard redirect UI, cookie names and shapes.

