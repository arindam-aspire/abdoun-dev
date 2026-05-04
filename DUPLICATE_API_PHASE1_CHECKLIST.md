# Duplicate API Phase 1 Checklist

## Phase 0 — Inventory
- [x] `GET /auth/me` call sites confirmed
- [x] `GET /saved-searches` call sites confirmed
- [x] Similar properties call sites confirmed
- [x] Taxonomy call sites confirmed

## Phase 1 — `GET /auth/me` Deduplication
- [x] Deduped helper/hook created or existing state reuse implemented
- [x] UiProvider flow preserved
- [x] AuthPopup flow preserved
- [x] Profile refresh flow preserved
- [x] Force-password flow preserved
- [x] Tests/build passed

## Phase 2 — Saved Searches Deduplication
- [x] Hydration/load duplication reviewed
- [x] Guard added
- [x] Forced refresh preserved
- [x] Create/delete flows preserved
- [x] Tests/build passed

## Phase 3 — Similar Properties
- [x] Shared hook/helper created
- [x] Duplicate fetch logic reduced
- [x] Components updated safely
- [x] Unused components documented
- [x] Tests/build passed

## Phase 4 — Taxonomy Cache
- [x] Location taxonomy cache/in-flight dedupe added
- [x] Property taxonomy cache/in-flight dedupe added
- [x] Step loading/error UI preserved
- [x] Tests/build passed

## Phase 5 — Documentation
- [x] Change log created
- [x] Validation results documented
- [x] Manual smoke test checklist added
- [x] Remaining risks documented
