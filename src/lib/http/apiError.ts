/**
 * Extracts a user-facing error message from API/axios errors or standard Error.
 * Handles FastAPI-style detail, validation error arrays, and generic message/error fields.
 */
export function getApiErrorMessage(error: unknown): string {
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
  return error instanceof Error ? error.message : "Something went wrong.";
}
