"use client";

import { createHttpClients, getApiErrorMessage } from "@/lib/http";
import type { StandardApiResponse } from "@/services/userService";

export type ChangeEmailPayload = {
  new_email: string;
  confirm_email: string;
};

/**
 * Requests an email change (backend may send a confirmation link). Same pattern as other feature APIs.
 */
export async function requestEmailChange(
  payload: ChangeEmailPayload,
): Promise<void> {
  const { authApi } = createHttpClients();
  try {
    const response = await authApi.post<StandardApiResponse<unknown>>(
      "/auth/change-email",
      {
        new_email: payload.new_email,
        confirm_email: payload.confirm_email,
      },
    );
    const body = response.data;
    if (body && body.success === false) {
      const message =
        (typeof body.error === "string" && body.error) ||
        (typeof body.message === "string" && body.message) ||
        "Request failed";
      throw new Error(message);
    }
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}
