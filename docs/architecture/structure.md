# Source structure

This project follows a **feature-first** layout:

| Location | Owns |
|----------|------|
| `src/app` | Routes, layouts, loading/error UI, composition only |
| `src/features/<domain>` | Domain UI, hooks, API modules, types, schemas |
| `src/components` | Shared UI only (`ui`, `layout`, `common`, `feedback`, `forms`) |
| `src/lib` | Cross-cutting infrastructure (`http`, `auth` adapters, generic utils, static reference data under `lib/constants`) |
| `src/store` | Redux store wiring only |
| `src/messages` | next-intl JSON catalogs |

**Import boundaries**

- `@/components/*` must not import `@/features/*`.
- `@/lib/*` must not import `@/features/*`.
- Features may import other features only through stable public paths when unavoidable; prefer shared `lib` types for envelopes (e.g. `StandardApiResponse`).

**Legacy transitional folders**

- `src/features/admin/dashboard/components/legacy-pages/` holds migrated admin route screens moved out of old `src/components/*` areas; this remains transitional until fully featureized.
- Shared dashboard/chart primitives used by multiple domains now live in `src/components/common` and `src/components/common/charts`.
