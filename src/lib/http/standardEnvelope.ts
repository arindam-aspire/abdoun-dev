import type { AxiosResponse } from "axios";
import type { StandardApiResponse } from "@/lib/http/standardApiResponse";

/** Attached by the HTTP client when a v1 envelope carried a top-level `message` (success path). */
export type AxiosResponseV1Augmented<T = unknown> = AxiosResponse<T> & {
  v1EnvelopeMessage?: string | null;
};

export function isFailedV1Envelope(data: unknown): data is StandardApiResponse<unknown> {
  return (
    data != null &&
    typeof data === "object" &&
    "success" in data &&
    (data as StandardApiResponse<unknown>).success === false
  );
}

/**
 * If `raw` is a successful v1 `{ success: true, data, ... }`, returns inner `data`.
 * Otherwise returns `raw` unchanged (legacy shapes, errors, non-JSON).
 */
export function peelV1EnvelopePayload(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object") return raw;
  const o = raw as Record<string, unknown>;
  if (typeof o.success !== "boolean" || !("data" in o)) {
    return raw;
  }
  if (o.success !== true) {
    return raw;
  }
  return o.data;
}

/**
 * Mutates Axios `response`: replaces `response.data` with the inner payload on v1 success;
 * preserves full envelope when `success !== true`.
 * Optionally sets `v1EnvelopeMessage` from the envelope (for callers that need it after unwrap).
 */
export function peelV1EnvelopeForAxios(response: AxiosResponse): void {
  const raw = response.data;
  if (raw == null || typeof raw !== "object") return;
  const o = raw as Record<string, unknown>;
  if (typeof o.success !== "boolean" || !("data" in o)) {
    return;
  }
  if (o.success !== true) {
    return;
  }
  const aug = response as AxiosResponseV1Augmented;
  if ("message" in o) {
    aug.v1EnvelopeMessage =
      typeof o.message === "string" || o.message === null ? (o.message as string | null) : undefined;
  }
  response.data = o.data as typeof response.data;
}

export function readV1EnvelopeMessage(response: AxiosResponse): string | null | undefined {
  return (response as AxiosResponseV1Augmented).v1EnvelopeMessage;
}
