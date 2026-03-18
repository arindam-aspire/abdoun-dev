# User Profile & Account Frontend Refactor Guide

## 1. Current Implementation

The User Profile & Account feature is implemented across:

- **Components**:
  - `src/components/profile/ProfileModal.tsx` – entry point modal opened from the header.
  - `src/components/profile/ProfilePhoto.tsx` – avatar upload/update.
  - `src/components/profile/PersonalInformationTab.tsx` – name, email, phone, etc.
  - `src/components/profile/SignInSecurityTab.tsx` – sign-in and security-related fields.
- **State**:
  - `src/features/profile/profileSlice.ts` stores profile data for the authenticated user.
- **Integration**:
  - The header (`AppHeader`) opens the profile modal.
  - Auth session (`authSlice`, cookies) determines whether the user can access the profile.

Profile actions (e.g. saving profile details, updating phone) call into services or hooks, which in turn rely on backend APIs or mock services.

## 2. Problems Identified

From the audit and plan:

- **Mixed concerns in components**:
  - Profile modal and tabs handle both UI and some orchestration logic (e.g. update operations) directly.
- **Validation and schemas**:
  - Validation logic and form definitions are likely inline, making them harder to share or test.
- **Theme & accessibility**:
  - There is room to more explicitly align modal behavior and accessibility with `theme-agent.mdc`.

## 3. Refactor Objectives

- Separate profile **form schemas and logic** from UI components.
- Introduce dedicated **profile API and hooks**, reusing existing endpoints.
- Ensure the profile modal adheres to **accessibility and theming** guidelines.

## 4. Proposed Folder Structure

```text
src/
  features/
    profile/
      api/
        profile.api.ts
      store/
        profileSlice.ts
      hooks/
        useProfile.ts
        useUpdateProfile.ts
      components/
        ProfileModal.tsx
        ProfilePhoto.tsx
        PersonalInformationTab.tsx
        SignInSecurityTab.tsx
      schemas/
        profileFormSchema.ts
      types.ts
```

Benefits:

- A clear boundary between data (slice + API) and UI.
- Reusable validation schemas and types for any future profile-related flows.

## 5. What Will Change

| Area       | Current                                        | After Refactor                                             |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Components | Handle submission and some API calls directly  | Delegate to hooks (`useUpdateProfile`) and schemas         |
| Validation | Defined inline in components                   | Centralized in `profileFormSchema.ts`                      |
| API Calls  | Performed via ad-hoc services or hooks         | Encapsulated in `profile.api.ts`                           |

## 6. Step-by-Step Safe Refactor Plan

### Step 1 — Introduce Profile API Module

- Create `src/features/profile/api/profile.api.ts`:
  - Wrap existing update endpoints or mock services used for saving profile data.
  - Keep endpoints and payloads exactly as they are today.

### Step 2 — Extract Form Schemas

- Create `profileFormSchema.ts`:
  - Define Zod or similar schemas for personal information and sign-in/security forms.
  - Export types derived from these schemas for use in components and API modules.
- Replace inline validation in `PersonalInformationTab` and `SignInSecurityTab` with imported schemas.

### Step 3 — Add useProfile and useUpdateProfile Hooks

- `useProfile`:
  - Provide current profile data from the slice and derived fields as needed.
- `useUpdateProfile`:
  - Encapsulate update submit handling, calling `profile.api.ts` and dispatching relevant slice actions.
  - Handle success/error toasts using the shared error-handling and toaster patterns.

### Step 4 — Align Modal with Theme & Accessibility Guidelines

- Ensure `ProfileModal`:
  - Uses accessible dialog patterns (focus trapping, ARIA roles, labels).
  - Respects theme and layout tokens for dark/light modes.
  - Uses shared UI components for buttons, inputs, and tabs.

### Step 5 — Tests & Quality Gates

- Add tests for:
  - `profileFormSchema` validation rules.
  - `useUpdateProfile` success and error flows.
- Run `npm run lint`, `npm run test`, and `npx tsc --noEmit`.

## 7. API Safety Rules

- Keep all profile-related endpoints unchanged.
- Do not alter request payload structures for profile updates or security changes.
- Any additional validation must occur on the frontend only and must not rely on changed backend contracts.

## 8. UI Behavior Safety Rules

- Preserve:
  - When and how the profile modal opens from the header.
  - The layout and content of the personal information and security tabs.
  - Validation messages and field-level behavior.
  - Any navigation or side effects after successful updates.

## 9. Testing Checklist

- Profile modal:
  - Opens and closes correctly on all supported routes.
- Personal information tab:
  - Displays current values and saves updates using the same API calls.
  - Shows validation errors as before.
- Security tab:
  - Correctly handles phone or security updates and shows relevant messages.

## 10. Dependencies With Other Modules

- **Authentication & Access module**:
  - Supplies the current authenticated user and session context.
- **Agent/Admin modules**:
  - May display profile-related information (e.g. agent name, avatar); the refactor must keep profile slice fields stable.

---

## Refactor completion notes

- **Done**: Profile API module (`src/features/profile/api/profile.api.ts`) wraps `updateUser`, `getUserById` from userService and re-exports `getCurrentUser`, `toSessionUserForProfile` from auth.api. Same endpoints and payloads.
- **Done**: Form schemas in `src/features/profile/schemas/profileFormSchema.ts` – `validatePhone`, `validateChangePassword`, `PROFILE_ROLE_OPTIONS`; types for personal info and security. No Zod (project has none); same validation rules as before.
- **Done**: `useProfile` in `src/features/profile/hooks/useProfile.ts` returns profile from slice + `saveProfile` (delegates to `useUpdateProfile`). `useUpdateProfile` in `src/features/profile/hooks/useUpdateProfile.ts` encapsulates update submit (profile.api + Redux). `src/hooks/useProfile.ts` re-exports from feature for backward compatibility.
- **Done**: `PersonalInformationTab` uses `PROFILE_ROLE_OPTIONS` from schema. `SignInSecurityTab` uses `validatePhone` and `validateChangePassword` from schema. ProfileModal and ProfileForm unchanged (still use `useProfile()` from hooks; implementation now in feature).
- **Done (tests)**: Jest configured. Unit tests added for `profileFormSchema` and `useUpdateProfile` (API calls mocked).
- **Unchanged**: Profile endpoints, payloads, modal open/close from header, tab layout and content, validation messages, navigation/side effects after updates.

