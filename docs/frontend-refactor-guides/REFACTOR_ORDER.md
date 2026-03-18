# Frontend Refactor Order (Safe Sequence)

This document suggests a safe, incremental order for refactoring feature modules, based on their dependencies and impact. Each step should be completed (including tests and quality gates) before moving to the next.

1. **Authentication & Access**
   - Foundation for guards, sessions, and role-based layouts.
   - Other modules depend on a stable auth/session model.

2. **User Profile & Account**
   - Builds on the authenticated user model; limited routing impact.

3. **Public Home & Marketing Pages**
   - High-traffic, but mostly presentational; good to align early with UI rules.

4. **Property Search & Results**
   - Core user journey; centralizes querystring and property search behavior.

5. **Property Details**
   - Depends on property identifiers and links from search; shares mapping utilities.

6. **Favourites & Comparison**
   - Uses property cards and IDs from search/results; relies on auth.

7. **Saved Searches**
   - Depends on the canonical search querystring format; interacts with search routes.

8. **Agent Dashboard & Analytics**
   - Agent entry point; relies on auth and some shared dashboard UI.

9. **Agent Listings, Inquiries & Leads**
   - Builds on agent dashboard links and property data; touches multiple agent routes.

10. **Agent Property Creation & Onboarding**
    - Complex forms but limited surface area; builds on agent property types.

11. **Admin Dashboard & Analytics**
    - Uses shared dashboard UI; depends on a stable admin auth/permissions model.

12. **Admin Agent Management**
    - Critical for RBAC; depends on admin dashboard and stable permissions.

13. **Admin Property Management**
    - Depends on public/admin property models and search/details utilities.

For each step:

- Keep all APIs, routes, and visible behavior unchanged.
- Follow the corresponding module’s refactor guide in `docs/frontend-refactor-guides/*-module-refactor.md`.
- Run lint, tests, type-check, and (when relevant) build before proceeding. 

