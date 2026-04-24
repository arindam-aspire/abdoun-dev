"use client";

import { useCallback, useState } from "react";
import { requestEmailChange } from "@/features/email/api/email.api";

type UseChangeEmailState = {
  updateEmail: (payload: { newEmail: string; confirmEmail: string }) => Promise<void>;
  isSubmitting: boolean;
};

/**
 * Submits a change-email request; errors propagate to the form / caller.
 */
export function useChangeEmail(): UseChangeEmailState {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEmail = useCallback(
    async (payload: { newEmail: string; confirmEmail: string }) => {
      setIsSubmitting(true);
      try {
        await requestEmailChange({
          new_email: payload.newEmail.trim().toLowerCase(),
          confirm_email: payload.confirmEmail.trim().toLowerCase(),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { updateEmail, isSubmitting };
}
