"use client";

import { OTPVerificationBlock } from "@/components/auth";
import { AUTH_POPUP_STEP_STACK } from "@/components/auth/authPopupStyles";
import type { useTranslations } from "@/hooks/useTranslations";

export interface AuthPopupConfirmEmailStepProps {
  t: ReturnType<typeof useTranslations>;
  email: string;
  otp: string;
  secondsLeft: number;
  canResend: boolean;
  loading: boolean;
  onChangeOtp: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
}

export function AuthPopupConfirmEmailStep({
  t,
  email,
  otp,
  secondsLeft,
  canResend,
  loading,
  onChangeOtp,
  onVerify,
  onResend,
}: AuthPopupConfirmEmailStepProps) {
  return (
    <div className={AUTH_POPUP_STEP_STACK}>
      <p className="text-center text-sm text-slate-600">{t("verifyAccountOtpHint")}</p>
      <p className="break-all text-center text-xs font-medium text-slate-800">{email}</p>
      <OTPVerificationBlock
        otp={otp}
        secondsLeft={secondsLeft}
        canResend={canResend}
        loading={loading}
        onChangeOtp={onChangeOtp}
        onVerify={onVerify}
        onResend={onResend}
      />
    </div>
  );
}
