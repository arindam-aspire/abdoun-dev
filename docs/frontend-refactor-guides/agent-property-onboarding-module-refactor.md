# Agent Property Creation & Onboarding Frontend Refactor Guide

## 1. Current Implementation

The Agent Property Creation & Onboarding feature is implemented across:

- **Page**: `src/app/[locale]/(agent)/agent-dashboard/add-property/page.tsx`.
- **Components**:
  - `src/components/agent/add-property/AddPropertyForm.tsx` – large multi-section form.
  - `PropertyFormSection.tsx`, `DocumentUploadField.tsx`, `MediaUploadField.tsx`.
  - `src/components/map/LocationPicker.tsx` for map-based location selection.
- **Services**:
  - `src/services/agentDashboardMockService.ts` handles property creation via mock endpoints.

The form collects:

- Listing basics (purpose, category, type, title, description, exclusive flag).
- Owner information (multiple owners).
- Location, property details, pricing, amenities, media, and documents.

## 2. Problems Identified

From the audit and plan:

- **Large multi-responsibility component**:
  - `AddPropertyForm` holds many sections, local states, and submission logic.
- **Validation and schemas**:
  - For such a complex form, validation logic needs to be centralized and clearly defined.
- **Map and media handling**:
  - LocationPicker relies on browser APIs and Google Maps with minimal error feedback.

## 3. Refactor Objectives

- Break the onboarding form into smaller **sub-forms and hooks** for each logical section.
- Centralize validation schemas and types for the property creation payload.
- Improve robustness of map and media handling without changing the visible behavior.

## 4. Proposed Folder Structure

```text
src/
  features/
    agent-properties/
      api/
        addProperty.api.ts
      hooks/
        useAddPropertyForm.ts
        usePropertyOwnerForm.ts
        usePropertyLocationForm.ts
      components/
        AddPropertyForm.tsx
        sections/
          ListingBasicsSection.tsx
          OwnersSection.tsx
          LocationSection.tsx
          DetailsSection.tsx
          PricingSection.tsx
          AmenitiesSection.tsx
          MediaSection.tsx
          DocumentsSection.tsx
      schemas/
        addPropertySchema.ts
      types.ts
```

Benefits:

- Each sub-form and hook has a single responsibility (SRP).
- Validation and typing are easier to keep consistent with backend contracts.

## 5. What Will Change

| Area       | Current                                      | After Refactor                                              |
| ---------- | -------------------------------------------- | ----------------------------------------------------------- |
| Components | `AddPropertyForm` is a large, multi-section  | `AddPropertyForm` composes smaller section components       |
| Validation | Implicit or scattered                        | Centralized `addPropertySchema.ts`                          |
| API Calls  | Submitted via mock service directly          | Wrapped by `addProperty.api.ts` with identical payload      |

## 6. Step-by-Step Safe Refactor Plan

## Refactor progress notes (implementation status)

Status: **Not started** (guide only; no changes applied yet).

### Step 1 — Create Add Property API Module

- Implement `addProperty.api.ts`:
  - Wrap the existing mock submission logic, exporting `submitProperty(payload)`.
  - Map the form model to the same payload shape used today.

### Step 2 — Define Schema and Types

- Create `addPropertySchema.ts`:
  - Capture all form fields and constraints currently enforced.
  - Generate a `NewPropertyPayload` type used by the API module and hooks.

### Step 3 — Introduce useAddPropertyForm Hook

- Implement `useAddPropertyForm`:
  - Orchestrates overall form state and submission.
  - Delegates to smaller hooks for specific sections.
- Implement section hooks (`usePropertyOwnerForm`, `usePropertyLocationForm`, etc.) where logic is concentrated today.

### Step 4 — Split AddPropertyForm Into Sections

- Create section components in a `sections/` subfolder:
  - Each receives props (values, errors, handlers) from `useAddPropertyForm`.
  - Renders a sub-part of the form without owning business logic.

### Step 5 — Improve LocationPicker Robustness

- Without changing visible behavior:
  - Add explicit error messages when geolocation fails (using the existing toast or inline messaging system).
  - Guard against missing `window.google.maps` more gracefully.

### Step 6 — Tests & Quality Gates

- Add tests for:
  - `addPropertySchema` correctness for required fields and formatting.
  - `useAddPropertyForm` submission behavior with valid and invalid data.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Keep the property creation endpoint URL, HTTP method, and payload structure unchanged.
- Ensure `addProperty.api.ts` transforms form state into the same payload the backend already expects (or the mock service uses).

## 8. UI Behavior Safety Rules

- Preserve:
  - The step order and layout of the form.
  - Required fields and validation messages.
  - Navigation and return behavior after successful submission or cancel.
  - How location is picked and displayed in the UI.

## 9. Testing Checklist

- End-to-end flow:
  - Filling out the form and submitting still results in the same calls and navigation.
- Validation:
  - Same fields are required, with the same error messages.
- Map/location:
  - Works as before, but with clearer error feedback when the browser blocks geolocation.

## 10. Dependencies With Other Modules

- **Agent Dashboard & Analytics module**:
  - Quick actions may link directly to the add-property page; keep the route and entry point stable.
- **Admin Property Management module**:
  - May later inspect properties created here; field naming and mapping must remain compatible with admin views.

---

## Refactor completion notes

- **Done**: (fill in after implementation)
- **Unchanged**: Routes, API contracts, and visible UI behavior

