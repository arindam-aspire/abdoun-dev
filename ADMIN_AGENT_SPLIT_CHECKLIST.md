# Admin/Agent Split — Execution Checklist

Goal: split former `features/admin-agents` ownership into explicit `features/admin` and `features/agent` boundaries while keeping routes and behavior stable.

## Plan

1. Create `src/features/admin` and `src/features/agent` roots.
2. Move dashboard modules:
   - `admin-dashboard` -> `features/admin/dashboard`
   - `agent-dashboard` -> `features/agent/dashboard`
3. Split API ownership:
   - Admin APIs -> `features/admin/api`
   - Agent APIs/mocks -> `features/agent/api`
4. Move shared admin management UI (`AdminAgents*`, charts, forms) to `features/admin/components`.
5. Rewrite imports globally and flatten nested moved folders.
6. Verify via tests + production build.

## Checklist

- [x] Create `features/admin` and `features/agent` roots
- [x] Move dashboard module trees to their domain roots
- [x] Split API files to domain API roots
- [x] Move remaining `admin-agents/components` into `features/admin/components`
- [x] Rewrite import paths from `@/features/admin-agents/*`
- [x] Flatten nested move artifacts (`.../dashboard/admin-dashboard`, `.../dashboard/agent-dashboard`)
- [x] Run `npm test`
- [x] Run `npm run build`
- [x] Remove now-empty `src/features/admin-agents` (if still exists)

---

Execution is intentionally structure-first. Cross-feature UI dependencies (e.g. shared chart components used by agent dashboard) are preserved for now and can be extracted to a neutral shared location in a follow-up.
