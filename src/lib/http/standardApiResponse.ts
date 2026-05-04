/**
 * Shared v1 API envelope shape used across HTTP helpers and domain services.
 * Lives in `lib` so infrastructure (e.g. envelope peeling) does not depend on features.
 */
export type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  /** Legacy string or structured error when `success` is false; `null` on success after BE envelope migration. */
  error?: string | null | Record<string, unknown>;
  /** Optional; list endpoints may include `pagination`. */
  meta?: Record<string, unknown>;
};
