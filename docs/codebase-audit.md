### 1️⃣ Critical Issues (Must Fix)

- **File**: `src/lib/auth/sessionCookies.ts`  
  - **Problem**: Auth cookies are not `HttpOnly` or `Secure`.  
  - **Why it is risky**: Session and role cookies written by `persistAuthSession` are fully readable and writable from JavaScript and lack the `Secure` flag. Any XSS vulnerability would allow an attacker to read/modify these cookies, impersonate users, and escalate privileges by changing the `role`. Without `Secure`, cookies may also be sent over non-HTTPS in some setups.  
  - **Recommendation**: Move sensitive auth/session state to server-managed, `HttpOnly`, `Secure`, `SameSite` cookies (or a server-side session mechanism) and ensure role/identity are derived from server-verified tokens rather than client-writable values.

- **File**: `middleware.ts`  
  - **Problem**: Admin route protection trusts a client-modifiable role cookie.  
  - **Why it is risky**: The middleware reads `AUTH_ROLE_COOKIE_NAME` from request cookies and treats `role === "admin"` as sufficient to access `/[locale]/dashboard`. Because this role cookie is currently set on the client and not cryptographically protected, an attacker can locally edit the cookie and gain admin access. This undermines the entire RBAC model.  
  - **Recommendation**: Base admin authorization on server-verifiable identity (e.g. JWT claims or server session) that cannot be forged by the client. Use signed/validated tokens or backend-side session lookup rather than trusting raw cookie values.

---

### 2️⃣ Medium Priority Issues

- **File**: `src/lib/auth/adapters/localStorageTokenStore.ts`  
  - **Problem**: Access and refresh tokens are stored in `localStorage`.  
  - **Impact**: Storing long-lived tokens in `localStorage` makes them directly accessible to any injected script, substantially increasing the blast radius of XSS. Refresh tokens here are particularly sensitive because they can be used to mint new access tokens.  
  - **Recommendation**: Prefer `HttpOnly` cookies or, at minimum, limit refresh token lifetime and harden CSP/content sanitization. Consider a server-centric session model where the browser never sees long-lived secrets.

- **File**: `src/components/layout/AgentRouteGuard.tsx`  
  - **Problem**: Agent-only checks rely on client-side state and non-HttpOnly cookies.  
  - **Impact**: Because this guard runs only on the client and trusts `readAuthSessionFromBrowser()` (which reads writable cookies), an attacker who can tamper with cookies or disable JS could bypass or confuse client-only protection. Sensitive agent data behind this guard is not robustly protected.  
  - **Recommendation**: Treat client guards as UX helpers only; enforce real authorization using middleware or server-side checks that derive role from trusted server-side session or signed tokens.

- **File**: `src/components/layout/AdminRouteGuard.tsx`  
  - **Problem**: Duplicate admin guard logic with same cookie trust issue as middleware.  
  - **Impact**: There are two sources of truth for admin access (middleware and this client guard), both depending on the same client-controlled cookie. This duplication complicates reasoning about auth flows, and cookie tampering may cause inconsistent or insecure behavior.  
  - **Recommendation**: Centralize admin auth decisions in a server-trusted layer and keep client guards as thin wrappers around a single, authoritative source of auth state.

- **File**: `src/components/layout/ui-provider.tsx`  
  - **Problem**: `UiProvider`’s `useEffect` mixes multiple responsibilities (auth bootstrap, cookie sync, token checks, redirects, forced password change).  
  - **Impact**: This large, side-effect-heavy hook is difficult to reason about and change safely. Bugs in one concern (e.g. password-change handling) risk impacting others (navigation or cookie persistence), and adding new auth behaviors may introduce regressions.  
  - **Recommendation**: Gradually factor this effect into smaller, focused helpers or hooks (e.g. auth bootstrap, password-change enforcement, cookie sync) while keeping the observable behavior and API contracts unchanged.

- **File**: `src/components/auth/AuthPopup.tsx`  
  - **Problem**: Component tightly couples UI, auth orchestration, state, and routing.  
  - **Impact**: With many responsibilities (login/signup/OTP flows, Redux updates, cookie persistence, navigation), this component is hard to test and extend. Any change to auth semantics or routing requires touching a large, complex component, increasing bug risk.  
  - **Recommendation**: Keep the current behavior, but over time move auth orchestration, API calls, and navigation decisions into dedicated hooks/services, leaving `AuthPopup` primarily responsible for presentation and wiring.

- **File**: `src/hooks/useAuthForms.ts`  
  - **Problem**: Hooks blend form state management with networking and navigation.  
  - **Impact**: These hooks are less reusable across different UIs and harder to test in isolation because they directly call APIs, dispatch Redux, and trigger routing. This tight coupling makes refactors of auth flows more complex.  
  - **Recommendation**: Keep the public API of these hooks stable but incrementally separate pure form concerns from side-effectful auth orchestration behind internal helpers or services.

- **File**: `src/lib/auth/adapters/restAuthService.ts`  
  - **Problem**: Asymmetric payloads between `refresh` and `logout`.  
  - **Impact**: `refresh` uses `{ refresh_token, username }` while `logout` uses `{ refreshToken }`. If backend expectations differ, logout may silently fail or not properly revoke tokens, leading to confusing behavior and potential security gaps.  
  - **Recommendation**: Confirm backend contracts and, if necessary, align field names and shapes consistently across auth endpoints while preserving the current logical flow.

- **File**: `src/components/layout/ui-provider.tsx`, `src/components/layout/AdminRouteGuard.tsx`, `src/components/layout/AgentRouteGuard.tsx`, `src/lib/auth/sessionCookies.ts`  
  - **Problem**: Auth/session logic and role checking are spread and duplicated across multiple layers.  
  - **Impact**: Having overlapping concerns about cookies, Redux state, and redirects in several places increases the chance of divergence and subtle bugs (e.g. one layer treating a partially authenticated user differently from another).  
  - **Recommendation**: Introduce a single, well-defined auth/session service as the internal authority and have UI/provider/guards delegate to it, without changing the current public API shape.

---

### 3️⃣ Minor Improvements

- **File**: `src/lib/http/index.ts`  
  - **Observation**: HTTP clients are defined in a `"use client"` module and depend directly on `LocalStorageTokenStore`.  
  - **Suggested improvement**: Factor out an environment-agnostic core HTTP configuration so it can be reused in server components and tests, while keeping browser-specific token storage in thin adapters.

- **File**: `src/components/map/LocationPicker.tsx`  
  - **Observation**: Uses `navigator.geolocation` and `window.google.maps` with minimal error reporting and only logs failures.  
  - **Suggested improvement**: Surface user-friendly error states (e.g. “location unavailable”) and avoid relying solely on `console.log`, without changing the public API or behavior of callbacks.

- **File**: `src/components/dashboard/AgentDashboardHome.tsx`  
  - **Observation**: `useEffect` calls `Promise.all([...])` without `.catch`, so rejected promises can cause unhandled rejections and leave `loading` stuck.  
  - **Suggested improvement**: Wrap the async call in try/catch or attach `.catch` to set an error state and ensure `loading` is cleared in failure scenarios.

- **File**: `src/components/property/property-details/PropertyDetailsMain.tsx`  
  - **Observation**: Large component combining data fetching, transformation, tab state, scroll/observer logic, and layout.  
  - **Suggested improvement**: Gradually move data transformation and helper logic into utilities or hooks, keeping the component focused on rendering and event wiring.

- **File**: `src/lib/http/createClient.ts`  
  - **Observation**: Refresh-and-retry interceptor rethrows errors, relying on callers for UX.  
  - **Suggested improvement**: Ensure calling code consistently catches and converts these errors into standardized user-facing messages so users understand why they were logged out or a request failed.

- **File**: General (auth forms, popup, dashboard components)  
  - **Observation**: Some components and hooks have grown long and multi-responsibility, which can obscure edge case handling and slightly violate SRP.  
  - **Suggested improvement**: When touching these areas in future work, favor extracting clearly scoped helpers rather than extending already-large functions or hooks.

---

### 4️⃣ Code Quality Score (1–10)

- **Architecture**: **7/10**  
- **Code Quality**: **7/10**  
- **Performance**: **7/10**  
- **Security**: **4/10** (primarily due to client-controlled auth cookies and token storage)  
- **Maintainability**: **6/10**

---

### 5️⃣ Summary

Overall, the codebase shows solid Next.js/TypeScript practices with a clear modular structure, centralized HTTP/auth layers, and reasonably well-typed, idiomatic React components. The main systemic risk is in the security model: roles and tokens are stored in client-accessible cookies and `localStorage` and then trusted for authorization, which should be hardened before production. Code quality and performance are generally good, though some large, multi-responsibility auth and layout components would benefit from progressive internal decomposition as features evolve. With improved auth storage/verification and some consolidation of auth/session logic, the project can reach a robust production-grade standard.

