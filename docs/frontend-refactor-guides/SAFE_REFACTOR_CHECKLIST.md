# Safe Frontend Refactor Checklist (Next.js Enterprise App)

This checklist defines process and safety practices for executing the feature refactors described in the frontend refactor guides without breaking existing behavior or backend integrations.

## 1. Branch Strategy

- **Create a feature branch per module**:
  - Name format: `refactor/<module-name>` (e.g. `refactor/authentication-access`).
  - Avoid mixing multiple modules’ refactors in a single branch.
- **Short-lived branches**:
  - Keep changes focused and merge frequently to reduce drift.
- **Main branch protection**:
  - Only merge when:
    - Lint, tests, and type-check pass.
    - Manual smoke testing for the affected module is complete.

## 2. Incremental Commits

- **Small, reviewable commits**:
  - Group related changes (e.g., “introduce auth.api.ts”, “switch login page to use useLogin hook”).
  - Avoid large, multi-module refactors in a single commit.
- **Commit messages**:
  - Use descriptive messages like: `refactor(auth): add sessionManager wrapper (no behavior change)`.
- **No behavior changes without explicit note**:
  - If a commit includes an intentional behavior change (e.g., security tightening), clearly mention it in the message and in code comments/TODOs.

## 3. Testing Steps (Per Module Refactor)

Before merging refactors for a module:

- **Automated checks**:
  - `npm run lint`
  - `npm run test` or `npm run test:coverage`
  - `npx tsc --noEmit`
  - `npm run build` (for routing/architecture changes)
- **Manual smoke tests**:
  - Navigate all routes described for the module in `docs/EXISTING_FEATURES.md`.
  - Exercise key flows:
    - Form submissions.
    - Filter changes.
    - Pagination and sorting.
    - Guarded routes (access as allowed and disallowed roles).
  - Confirm UI layout and text match the existing behavior.
- **API validation**:
  - Inspect network calls:
    - Same URLs, methods, and payloads as before.
    - Same response handling and error shapes in the UI.

## 4. Rollback Strategy

- **Per-branch rollback**:
  - If a refactor causes regressions in testing or staging:
    - Revert the problematic commit(s) on the feature branch.
    - Re-run tests and type-checks.
  - Do not merge the branch until issues are resolved.
- **Main branch rollback**:
  - If an issue is discovered after merging:
    - Use `git revert <commit>` to create a new commit that undoes the change.
    - Avoid force-pushing main; favor explicit revert commits.

## 5. Deployment Safety

- **Deploy refactored modules gradually**:
  - Prefer deploying one module refactor at a time when possible.
  - Monitor logs and error reporting closely after each deployment.
- **Feature flags (when available)**:
  - Optionally wrap new code paths behind flags in the frontend only.
  - Keep old and new paths live until the new implementation is verified, then remove the flag and legacy code in a later, separate commit.

## 6. Coordination With Backend Team

- **Communicate assumptions**:
  - For each module, share the refactor scope with backend owners, emphasizing:
    - No API contract changes.
    - No new endpoints.
  - If mapping logic changes (e.g., new UI mappers), confirm that backend responses remain compatible.
- **Avoid backend coupling**:
  - Treat all backend services as external; refactors must not require backend code changes to remain functional.

## 7. Module-Specific Safety Checks

For each module, verify the additional items below:

- **Authentication & Access**:
  - All existing routes and guards allow/deny the same roles as before.
  - Login/logout flows and redirects behave identically.
- **Property Search & Results / Property Details**:
  - URL structures and query parameters are unchanged.
  - Search results and details pages show the same data for a given backend response.
- **Favourites, Comparison, Saved Searches**:
  - Favourites, comparison selections, and saved searches persist across navigation as they did previously.
- **Agent and Admin Modules**:
  - Dashboards, lists, and details load correctly for both roles.
  - Admin-only actions (invites, approvals, deletions) still require admin permissions and work as before.

## 8. Documentation Updates

- After each module refactor:
  - Update the corresponding `*-module-refactor.md` file with:
    - Any deviations from the original plan.
    - Notes about remaining technical debt or follow-ups.
  - If any behavior change was absolutely necessary (e.g., for security), document it clearly and link to relevant commits.

By following this checklist and the per-module guides, the frontend can be refactored to an enterprise-grade architecture while remaining fully compatible with the existing backend and preserving all current user-visible behavior.

