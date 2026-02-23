# Authentication API

This document describes the **authentication API contract** used by the Abdoun Real Estate frontend: login, signup (with OTP), token refresh, logout, forgot password, and passwordless one-time code. It aligns with `RestAuthService`, `createClient` (auth interceptor), and the mock flows in `authMockService` / `useAuthForms`.

---

## Overview

| Flow | Description |
|------|-------------|
| **Login** | Email (or identifier) + password → tokens + optional user |
| **Signup** | Manual signup → OTP → verify OTP → optional tokens |
| **Refresh** | Exchange refresh token for new access + refresh tokens |
| **Logout** | Invalidate refresh token; client clears tokens and redirects to login |
| **Forgot password** | Request OTP → verify OTP → reset token → set new password |
| **Passwordless** | Send one-time code → verify code → tokens |

**Base URL:** `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3000` or your API origin).

**Token storage (client):** `localStorage` keys `accessToken` and `refreshToken` (configurable via `accessTokenKey` / `refreshTokenKey` in `createHttpClients`).

**Protected requests:** `Authorization: Bearer <accessToken>`. On 401, the auth client attempts refresh; if refresh fails, it clears tokens and redirects to login (`loginPath`, default `/login`).

---

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Login with email/identifier + password |
| `POST` | `/auth/signup` | No | Register; returns nextStep (otp \| login) and optional challengeId |
| `POST` | `/auth/signup/verify-otp` | No | Verify signup OTP; may return tokens |
| `POST` | `/auth/signup/resend-otp` | No | Resend signup OTP |
| `POST` | `/auth/refresh` | No | Exchange refresh token for new tokens |
| `POST` | `/auth/logout` | No | Invalidate refresh token (body can send refreshToken or null) |
| `POST` | `/auth/forgot-password` | No | Request password-reset OTP |
| `POST` | `/auth/forgot-password/verify-otp` | No | Verify OTP; returns resetToken |
| `POST` | `/auth/forgot-password/reset` | No | Set new password with resetToken |
| `POST` | `/auth/send-code` | No | Send one-time code (passwordless login) |
| `POST` | `/auth/verify-code` | No | Verify one-time code; returns tokens |
| `GET`  | `/auth/me` | Yes | Example: get current user (Bearer token) |

Paths for **refresh** and **logout** are configurable in `RestAuthService`: `refreshPath` (default `/auth/refresh`), `logoutPath` (default `/auth/logout`).

---

## 1. Login

**POST** `/auth/login`

### Request body

Either:

- `email` (string), `password` (string) — used by the standalone login page.

Or:

- `identifier` (string), `password` (string) — used by AuthPopup; `identifier` is email or phone.

### Response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_1",
    "name": "Demo User",
    "email": "user@example.com",
    "phone": "+962600000000",
    "role": "user"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | string | JWT or opaque token; send as `Authorization: Bearer <accessToken>` |
| `refreshToken` | string | Used only for `/auth/refresh` |
| `user` | object | Optional; matches `AuthUser`: id, name, email, phone?, role |

### Error (401)

```json
{ "message": "Invalid credentials." }
```

---

## 2. Signup

### 2.1 Request OTP — POST `/auth/signup`

**Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+962791234567",
  "password": "SecurePass1!"
}
```

Password policy (frontend): min 8 chars, upper, lower, number, symbol.

**Response (200) — OTP required**

```json
{
  "nextStep": "otp",
  "challengeId": "signup_abc123",
  "expiresInSeconds": 60,
  "message": "OTP sent to your email/phone."
}
```

**Response (200) — Account exists**

```json
{
  "nextStep": "login",
  "message": "Account already exists. Please log in."
}
```

Client uses `challengeId` in verify and resend OTP calls.

### 2.2 Verify OTP — POST `/auth/signup/verify-otp`

**Body:**

```json
{
  "challengeId": "signup_abc123",
  "otp": "123456"
}
```

**Response (200)** — Option A: return tokens and user (auto-login):

```json
{
  "success": true,
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "usr_1", "name": "John Doe", "email": "john@example.com", "phone": "+962791234567", "role": "user" }
}
```

Option B: `{ "success": true }` and client redirects to login.

### 2.3 Resend OTP — POST `/auth/signup/resend-otp`

**Body:**

```json
{ "challengeId": "signup_abc123" }
```

**Response (200):** e.g. `{ "expiresInSeconds": 60, "message": "OTP resent." }`

---

## 3. Token refresh

**POST** `/auth/refresh`

Used by the HTTP client when a request returns 401: it calls refresh, stores new tokens, and retries. Not called directly by UI except for testing.

**Body:**

```json
{
  "refreshToken": "<current refresh token>"
}
```

**Response (200)**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Client must persist both tokens (e.g. same localStorage keys). On 4xx or network error, client clears tokens and runs logout (e.g. redirect to login).

---

## 4. Logout

**POST** `/auth/logout`

**Body:**

```json
{
  "refreshToken": "<refresh token or null>"
}
```

**Response:** 200 or 204, no body required.

Client should clear `accessToken` and `refreshToken` and redirect to login regardless of response.

---

## 5. Forgot password

The app’s forgot-password page is currently a stub; the mock service implements the full flow. Backend should support:

### 5.1 Request OTP — POST `/auth/forgot-password`

**Body:**

```json
{
  "email": "user@example.com"
}
```

Or `identifier` (email or phone) if you prefer a single field.

**Response (200)**

```json
{
  "challengeId": "reset_xyz",
  "expiresInSeconds": 60,
  "message": "If an account exists, OTP has been sent."
}
```

### 5.2 Verify OTP — POST `/auth/forgot-password/verify-otp`

**Body:**

```json
{
  "challengeId": "reset_xyz",
  "otp": "123456"
}
```

**Response (200)**

```json
{
  "resetToken": "reset_token_abc123"
}
```

`resetToken` is one-time use and short-lived.

### 5.3 Set new password — POST `/auth/forgot-password/reset`

**Body:**

```json
{
  "resetToken": "reset_token_abc123",
  "password": "NewSecurePass1!"
}
```

**Response (200):** e.g. `{ "success": true }`. Client then redirects to login.

---

## 6. Passwordless (one-time code)

Used by AuthPopup “Login with one-time code”.

### 6.1 Send code — POST `/auth/send-code`

**Body:**

```json
{
  "identifier": "user@example.com"
}
```

`identifier`: email or E.164 phone.

**Response (200)**

```json
{
  "challengeId": "login_otp_abc",
  "expiresInSeconds": 60,
  "message": "If an account exists, a one-time code has been sent."
}
```

### 6.2 Verify code — POST `/auth/verify-code`

**Body:**

```json
{
  "challengeId": "login_otp_abc",
  "otp": "123456"
}
```

**Response (200)**

```json
{
  "success": true,
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "usr_1", "name": "User", "email": "user@example.com", "role": "user" }
}
```

Client stores tokens and redirects as after login.

---

## 7. User object (AuthUser)

Used in login and signup verify responses:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique user id |
| `name` | string | Yes | Display name |
| `email` | string | Yes | Email |
| `phone` | string | No | E.164 or national format |
| `role` | string | Yes | One of: `user`, `agent`, `admin` |

---

## 8. Client behaviour (frontend)

- **Token store:** `LocalStorageTokenStore` — keys default to `accessToken`, `refreshToken`.
- **Auth client:** Requests add `Authorization: Bearer <accessToken>`. On 401, client calls `POST /auth/refresh` with current refresh token, updates stored tokens, retries the request. If refresh fails or no refresh token, it calls `POST /auth/logout` (best effort), clears tokens, and runs `logoutHandler` (redirect to `/login` or localized login).
- **Login page:** Uses email + password; demo currently dispatches Redux `login` with mock user without calling an API.
- **AuthPopup:** Uses mock services for manual login (identifier + password), signup (manual + OTP), passwordless (send code + verify), and social (mock). Replace with real API calls when backend is ready.
- **Forgot password:** Page is stub; mock flow is request OTP → verify OTP → set new password.

---

## 9. Postman collection

- **File:** `postman/Abdoun-Auth-API.postman_collection.json`
- **Variables:** `baseUrl`, `accessToken`, `refreshToken`, `challengeId`, `resetToken`. Test scripts set `challengeId`, `resetToken`, and tokens from responses where applicable.
- **Folders:** Login, Signup, Token (refresh / logout), Forgot password, Passwordless, Protected (example `GET /auth/me`).

Use the same **environment** as the Search API (e.g. `postman/Abdoun-Local.postman_environment.json`) so `baseUrl` is shared.

---

## 10. Summary table

| Action | Endpoint | Body (main fields) | Response (success) |
|--------|----------|--------------------|---------------------|
| Login | `POST /auth/login` | email/identifier, password | accessToken, refreshToken, user? |
| Signup | `POST /auth/signup` | fullName, email, phone, password | nextStep, challengeId?, expiresInSeconds? |
| Verify signup OTP | `POST /auth/signup/verify-otp` | challengeId, otp | success, accessToken?, refreshToken?, user? |
| Resend signup OTP | `POST /auth/signup/resend-otp` | challengeId | expiresInSeconds? |
| Refresh | `POST /auth/refresh` | refreshToken | accessToken, refreshToken |
| Logout | `POST /auth/logout` | refreshToken (or null) | 200/204 |
| Forgot password request | `POST /auth/forgot-password` | email (or identifier) | challengeId, expiresInSeconds, message |
| Forgot password verify | `POST /auth/forgot-password/verify-otp` | challengeId, otp | resetToken |
| Forgot password reset | `POST /auth/forgot-password/reset` | resetToken, password | success |
| Send one-time code | `POST /auth/send-code` | identifier | challengeId, expiresInSeconds, message |
| Verify one-time code | `POST /auth/verify-code` | challengeId, otp | accessToken, refreshToken, user? |
