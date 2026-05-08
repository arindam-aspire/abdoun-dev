# Lead Management API Contract

## 1. Overview

These APIs support lead handling for three actor types:
- **Registered user**: submits contact-form inquiry from property UI.
- **Agent**: views and manages assigned leads (status, replies, notes).
- **Admin**: manages scoped leads for assigned agents (manual creation, reassign, status/close decision).

Flow summary:
- **Contact-form flow**: `POST /api/v1/leads/contact-form` creates lead with `NEW` + `EMAIL_FORM`.
- **Agent workflow**: list/detail + progress to `IN_PROGRESS`, then request close.
- **Admin workflow**: list scoped leads, manual create (`PHONE`/`WHATSAPP`/`MANUAL_ADMIN`), reassign, status updates, close decision.
- **Status lifecycle** is controlled by workflow policy and enforced in service layer.

---

## 2. Authentication & Roles

- Auth mechanism: Bearer token via `Authorization: Bearer <token>`.
- Route guards use `require_role(...)` dependency.
- Roles used by lead routes:
  - `registered_user`
  - `agent`
  - `admin`

Scope limitations:
- **Registered user**: only contact-form create action.
- **Agent**: can access only leads where `assigned_agent_id == current_user.id`.
- **Admin**: can access only leads where assigned agent is actively linked via `admin_agent_assignments`.

---

## 3. Status Lifecycle

Allowed statuses:

```text
NEW
IN_PROGRESS
REQUEST_FOR_CLOSE
CLOSED
```

Allowed transitions:

```text
NEW -> IN_PROGRESS
IN_PROGRESS -> REQUEST_FOR_CLOSE
REQUEST_FOR_CLOSE -> CLOSED
```

Rules:
- `CLOSED` is terminal.
- Agent transitions: `NEW -> IN_PROGRESS`, `IN_PROGRESS -> REQUEST_FOR_CLOSE`.
- Admin can perform scoped transitions and is required for `... -> CLOSED`.
- Service enforces additional guard: non-admin cannot set `CLOSED`.

---

## 4. Shared Models / DTOs

Source: `app/schemas/lead.py`

### ContactFormLeadCreateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `propertyId` | UUID | Yes | UUID | Property being inquired about |
| `name` | string | Yes | min 2, max 20 | Currently validated but not persisted to lead row |
| `email` | string | Yes | min 5, max 255 | Format is frontend/business-validated; schema has length constraints |
| `phoneNumber` | string | Yes | min 8, max 20 | Country-code-aware formatting expected by frontend |
| `message` | string | Yes | min 10, max 1000 | Stored in lead row |

### AdminManualLeadCreateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `propertyId` | UUID | Yes | UUID | Lead property |
| `assignedAgentId` | UUID | Yes | UUID | Must be admin-scoped |
| `source` | string | Yes | `^(PHONE|WHATSAPP|MANUAL_ADMIN)$` | Manual/admin channel |
| `message` | string | Yes | min 10, max 1000 | Lead message |
| `contactUserId` | UUID \| null | No | UUID if provided | Optional user link |

### LeadStatusUpdateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `status` | string | Yes | `^(NEW|IN_PROGRESS|REQUEST_FOR_CLOSE|CLOSED)$` | Must also satisfy transition matrix |
| `reason` | string \| null | No | max 500 | Stored in status history |

### LeadReassignRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `assignedAgentId` | UUID | Yes | UUID | New scoped agent |

### LeadReplyRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `message` | string | Yes | min 1, max 1000 | Creates `lead_messages` row |

### LeadNoteCreateRequest / LeadNoteUpdateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `note` | string | Yes | min 1, max 2000 | Internal note |

### LeadItemResponse

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `id` | UUID | Yes | UUID | Lead ID |
| `propertyId` | UUID \| null | No | UUID if present | |
| `userId` | UUID \| null | No | UUID if present | Requesting user |
| `status` | string | Yes | lifecycle values | |
| `source` | string | Yes | source values | |
| `assignedAgentId` | UUID \| null | No | UUID if present | |
| `assignedByAdminId` | UUID \| null | No | UUID if present | |
| `message` | string \| null | No | | |
| `lastActivityAt` | datetime \| null | No | ISO timestamp | |
| `requestCloseAt` | datetime \| null | No | ISO timestamp | |
| `closedAt` | datetime \| null | No | ISO timestamp | |
| `closedByAdminId` | UUID \| null | No | UUID if present | |
| `createdAt` | datetime | Yes | ISO timestamp | |
| `updatedAt` | datetime | Yes | ISO timestamp | |

### LeadListResponse

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `items` | LeadItemResponse[] | Yes | | |
| `total` | int | Yes | >= 0 | Total matching rows |
| `page` | int | Yes | >= 1 | Page index |
| `pageSize` | int | Yes | >= 1 | Page size |

### LeadNoteResponse

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `id` | UUID | Yes | UUID | |
| `leadId` | UUID | Yes | UUID | |
| `authorUserId` | UUID \| null | No | UUID if present | |
| `note` | string | Yes | | |
| `createdAt` | datetime | Yes | ISO timestamp | |
| `updatedAt` | datetime | Yes | ISO timestamp | |

### LeadReplyResponse

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| `id` | UUID | Yes | UUID | Message ID |
| `leadId` | UUID | Yes | UUID | |
| `senderUserId` | UUID \| null | No | UUID if present | |
| `recipientUserId` | UUID \| null | No | UUID if present | |
| `message` | string | Yes | | |
| `channel` | string | Yes | currently `IN_APP` | |
| `deliveryState` | string \| null | No | | |
| `createdAt` | datetime | Yes | ISO timestamp | |

History DTO:
- Not exposed directly by current API contracts.

---

## 5. API Details

Response envelope (success):

```json
{
  "success": true,
  "data": {},
  "message": null,
  "error": null
}
```

Error envelope:
- For business/auth errors raised by `HTTPException`, FastAPI default shape applies:

```json
{
  "detail": "Error message"
}
```

- For validation (`422`) default FastAPI validation payload applies (`detail` array with field errors).

### POST /api/v1/leads/contact-form

**Purpose:** Create lead from registered-user contact form.  
**Auth:** Bearer token required.  
**Allowed Roles:** `registered_user`.  
**Path Params:** None.  
**Query Params:** None.  
**Request Body:** `ContactFormLeadCreateRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404` (property/agent mapping), `422`, `500`.  
**Frontend Notes:** Backend currently persists `message` and assignment metadata; `name/email/phoneNumber` are validated in request but not stored in lead table.

Example request:

```json
{
  "propertyId": "00000000-0000-0000-0000-000000000001",
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+12025551234",
  "message": "I am interested in this property."
}
```

Example success:

```json
{
  "success": true,
  "data": {
    "id": "11111111-1111-1111-1111-111111111111",
    "propertyId": "00000000-0000-0000-0000-000000000001",
    "userId": "22222222-2222-2222-2222-222222222222",
    "status": "NEW",
    "source": "EMAIL_FORM",
    "assignedAgentId": "33333333-3333-3333-3333-333333333333",
    "assignedByAdminId": null,
    "message": "I am interested in this property.",
    "lastActivityAt": "2026-05-05T14:00:00Z",
    "requestCloseAt": null,
    "closedAt": null,
    "closedByAdminId": null,
    "createdAt": "2026-05-05T14:00:00Z",
    "updatedAt": "2026-05-05T14:00:00Z"
  },
  "message": "Your inquiry has been sent successfully",
  "error": null
}
```

### GET /api/v1/agent/leads

**Purpose:** Paginated lead list for authenticated agent.  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** None.  
**Query Params:** `status?`, `source?`, `page` (>=1), `pageSize` (1..100).  
**Request Body:** None.  
**Success Response:** `StandardResponse<LeadListResponse>`.  
**Error Responses:** `401`, `403`, `422`, `500`.  
**Frontend Notes:** Only assigned leads are returned.

### GET /api/v1/agent/leads/{lead_id}

**Purpose:** Lead detail for assigned agent.  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** None.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** `403` when lead is outside agent scope.

### PATCH /api/v1/agent/leads/{lead_id}/status

**Purpose:** Agent updates status in allowed flow.  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadStatusUpdateRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Invalid transition currently surfaces as server error (`500`) because workflow `ValueError` is not explicitly mapped to `400` yet. **Needs confirmation** for frontend handling.

### POST /api/v1/agent/leads/{lead_id}/reply

**Purpose:** Send lead reply; stores message and emits notification hooks.  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadReplyRequest`.  
**Success Response:** `StandardResponse<LeadReplyResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** If lead status is `NEW`, backend auto-promotes to `IN_PROGRESS`.

### POST /api/v1/agent/leads/{lead_id}/notes

**Purpose:** Add internal note.  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadNoteCreateRequest`.  
**Success Response:** `StandardResponse<LeadNoteResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Notes are internal only.

### PATCH /api/v1/agent/leads/{lead_id}/notes/{note_id}

**Purpose:** Update note (owner/admin scope rule enforced).  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id`, `note_id` UUIDs.  
**Query Params:** None.  
**Request Body:** `LeadNoteUpdateRequest`.  
**Success Response:** `StandardResponse<LeadNoteResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Agent can edit only own notes.

### DELETE /api/v1/agent/leads/{lead_id}/notes/{note_id}

**Purpose:** Delete note (owner/admin scope rule enforced).  
**Auth:** Bearer token required.  
**Allowed Roles:** `agent`.  
**Path Params:** `lead_id`, `note_id` UUIDs.  
**Query Params:** None.  
**Request Body:** None.  
**Success Response:** `StandardResponse<bool>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Returns `data: true` on success.

### GET /api/v1/admin/leads

**Purpose:** Paginated lead list for admin-scoped agents only.  
**Auth:** Bearer token required.  
**Allowed Roles:** `admin`.  
**Path Params:** None.  
**Query Params:** `status?`, `source?`, `page` (>=1), `pageSize` (1..100).  
**Request Body:** None.  
**Success Response:** `StandardResponse<LeadListResponse>`.  
**Error Responses:** `401`, `403`, `422`, `500`.  
**Frontend Notes:** Uses `admin_agent_assignments` scope.

### POST /api/v1/admin/leads

**Purpose:** Create manual lead (e.g., phone/WhatsApp/manual admin source).  
**Auth:** Bearer token required.  
**Allowed Roles:** `admin`.  
**Path Params:** None.  
**Query Params:** None.  
**Request Body:** `AdminManualLeadCreateRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `422`, `500`.  
**Frontend Notes:** `assignedAgentId` must belong to admin scope.

Example request:

```json
{
  "propertyId": "00000000-0000-0000-0000-000000000001",
  "assignedAgentId": "33333333-3333-3333-3333-333333333333",
  "source": "PHONE",
  "message": "Phone inquiry captured by admin",
  "contactUserId": null
}
```

### PATCH /api/v1/admin/leads/{lead_id}/reassign

**Purpose:** Reassign lead to another scoped agent.  
**Auth:** Bearer token required.  
**Allowed Roles:** `admin`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadReassignRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Both lead scope and target agent scope are validated.

### PATCH /api/v1/admin/leads/{lead_id}/status

**Purpose:** Admin status update for scoped lead.  
**Auth:** Bearer token required.  
**Allowed Roles:** `admin`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadStatusUpdateRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Use lifecycle rules; invalid transition handling same caveat as agent status endpoint.

### POST /api/v1/admin/leads/{lead_id}/close-decision

**Purpose:** Close decision action endpoint (currently shares `update_status` service path).  
**Auth:** Bearer token required.  
**Allowed Roles:** `admin`.  
**Path Params:** `lead_id: UUID`.  
**Query Params:** None.  
**Request Body:** `LeadStatusUpdateRequest`.  
**Success Response:** `StandardResponse<LeadItemResponse>`.  
**Error Responses:** `401`, `403`, `404`, `422`, `500`.  
**Frontend Notes:** Expected business use is close decision (`... -> CLOSED`); route technically accepts any allowed status payload. **Needs confirmation** whether frontend should lock to `CLOSED` only.

---

## 6. Contact Form Flow

Frontend flow:
1. User clicks contact option.
2. Validate fields client-side:
   - Name: 2-20 chars
   - Email: valid format + length constraints
   - Phone: country-code-aware project standard
   - Message: 10-1000 chars
3. Call `POST /api/v1/leads/contact-form`.
4. Backend creates `NEW` lead with `EMAIL_FORM` and assigned listing agent.
5. Backend dedupe: same property/user/message within short window returns existing lead instead of inserting duplicate.
6. Handle success message and errors.

---

## 7. Agent Lead Flow

- Fetch list: `GET /api/v1/agent/leads`
- Open detail: `GET /api/v1/agent/leads/{lead_id}`
- Update status: `PATCH /api/v1/agent/leads/{lead_id}/status`
- Reply: `POST /api/v1/agent/leads/{lead_id}/reply`
- Manage notes:
  - create `POST .../notes`
  - update `PATCH .../notes/{note_id}`
  - delete `DELETE .../notes/{note_id}`

Scope rule:
- Agent can access only assigned leads.

Allowed transitions for agent:
- `NEW -> IN_PROGRESS`
- `IN_PROGRESS -> REQUEST_FOR_CLOSE`

---

## 8. Admin Lead Flow

- List scoped leads: `GET /api/v1/admin/leads`
- Create manual lead: `POST /api/v1/admin/leads`
- Reassign lead: `PATCH /api/v1/admin/leads/{lead_id}/reassign`
- Update status: `PATCH /api/v1/admin/leads/{lead_id}/status`
- Close decision: `POST /api/v1/admin/leads/{lead_id}/close-decision`

Scope rule:
- Admin can access only leads tied to agents assigned to that admin.

Admin close rule:
- Admin can apply `REQUEST_FOR_CLOSE -> CLOSED`.

---

## 9. Error Handling Guide for Frontend

- `401 Unauthorized`
  - Missing/invalid token.
  - Action: prompt re-auth.

- `403 Forbidden`
  - Role mismatch or scope violation (e.g., agent accessing unassigned lead).
  - Action: show permission message; avoid retry loops.

- `404 Not Found`
  - Lead/note/property association not found.
  - Action: show not-found state and refresh list.

- `400 Invalid transition`
  - **Current implementation note:** invalid transition may bubble to `500` (needs explicit mapping in service if desired).
  - Action: treat unexpected status-change failures as non-retryable business error.

- `422 Validation Error`
  - Request payload constraint failure.
  - Action: bind field errors to form UI.

- Duplicate submission
  - Contact-form duplicate may return success with existing lead payload (idempotent behavior).
  - Action: treat as success and continue UX flow.

- `500 Internal Server Error`
  - DB or unhandled server error.
  - Action: show generic retry toast and capture telemetry.

---

## 10. Frontend Integration Checklist

- API client methods for all 12 lead endpoints.
- Query/mutation hooks for:
  - contact-form create
  - agent list/detail/status/reply/notes
  - admin list/create/reassign/status/close-decision
- UI pages/components:
  - property contact form
  - agent lead list/detail drawer/modal
  - admin lead management table + actions
- Frontend validation:
  - contact form, status forms, notes/reply lengths
- Status badge mapping:
  - `NEW`, `IN_PROGRESS`, `REQUEST_FOR_CLOSE`, `CLOSED`
- Action visibility:
  - agent vs admin based on role + current status
- Error toast strategy:
  - 401/403/404/422/500 handling
- Pagination/filter wiring:
  - `page`, `pageSize`, optional `status`, `source`
- Role-based UI gating:
  - registered user (contact)
  - agent (assigned leads only)
  - admin (scoped agent leads only)

---

## OpenAPI Verification

Documented endpoints were cross-checked against registered OpenAPI paths.

- Missing from OpenAPI: **none**
- Extra lead-management endpoints in OpenAPI but undocumented: **none**
- Note: `/api/v1/agents/leaderboard` contains lead analytics but is outside Lead Management API scope and intentionally excluded.
