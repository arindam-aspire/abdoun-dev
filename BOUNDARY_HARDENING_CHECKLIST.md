# Boundary Hardening Checklist

Goal: remove cross-domain coupling where `agent` depends on `admin` internals for reusable UI.

- [x] Identify shared admin components used by agent domain
- [x] Move shared chart primitives to neutral shared location (`src/components/common/charts`)
- [x] Move shared wrappers (`ChartContainer`, `MetricCard`) to `src/components/common`
- [x] Rewrite all imports to shared paths
- [x] Verify no remaining imports from `@/features/admin/components/shared-charts` outside admin feature internals
- [x] Run `npm test`
- [x] Run `npm run build`
- [x] Update architecture doc to reflect hardened boundaries
