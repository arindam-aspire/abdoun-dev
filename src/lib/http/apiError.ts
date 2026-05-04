/**
 * Extracts a user-facing error message from API/axios errors or standard Error.
 * Handles FastAPI-style detail, validation error arrays, and generic message/error fields.
 * Also accepts plain strings (e.g. RTK `unwrap()` rejection payloads).
 */
export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed) return trimmed;
  }
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: Record<string, unknown> } }).response;
    const data = response?.data;
    if (data && typeof data === "object") {
      const detail = data.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
        return String(detail[0].msg);
      }
      const msg = data.message ?? data.error;
      if (typeof msg === "string") return msg;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (error && typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return "Something went wrong.";
}

/**
 * Message for a rejected RTK `createAsyncThunk` action.
 * Prefers `rejectWithValue` string payload; skips generic "Rejected" placeholder when payload is absent.
 */
export function getThunkRejectedMessage(
  action: { payload: unknown; error: unknown },
  fallback: string,
): string {
  if (typeof action.payload === "string" && action.payload.trim()) {
    return action.payload.trim();
  }
  const msg = getApiErrorMessage(action.error);
  if (msg && msg !== "Rejected") {
    return msg;
  }
  return fallback;
}
