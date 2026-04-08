import { Button } from "@/components/ui";
import { AuthPopupField, OTPVerificationBlock } from "@/components/auth";
import {
  AUTH_POPUP_PRIMARY_BUTTON,
  AUTH_POPUP_STEP_STACK,
} from "@/components/auth/authPopupStyles";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupOneTimeCodeStepProps {
  t: ReturnType<typeof useTranslations>;
  otcStep: "request" | "otp";
  otcIdentifier: string;
  otcIdentifierError?: string;
  otcOtp: string;
  otcOtpError?: string;
  otcDebugOtp?: string | null;
  otcLoading: boolean;
  secondsLeft: number;
  canResend: boolean;
  onChangeOtcIdentifier: (value: string) => void;
  onFocusOtcIdentifier?: () => void;
  onChangeOtp: (value: string) => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onResendCode: () => void;
}

export function AuthPopupOneTimeCodeStep({
  t,
  otcStep,
  otcIdentifier,
  otcIdentifierError,
  otcOtp,
  otcOtpError,
  otcDebugOtp,
  otcLoading,
  secondsLeft,
  canResend,
  onChangeOtcIdentifier,
  onFocusOtcIdentifier,
  onChangeOtp,
  onSendCode,
  onVerifyCode,
  onResendCode,
}: AuthPopupOneTimeCodeStepProps) {
  return (
    <div className={AUTH_POPUP_STEP_STACK}>
      {otcStep === "request" ? (
        <>
          <AuthPopupField
            id="auth-otc-identifier"
            label={t("emailOrPhone")}
            placeholder={t("emailOrPhone")}
            value={otcIdentifier}
            onChange={onChangeOtcIdentifier}
            onFocus={onFocusOtcIdentifier}
            error={otcIdentifierError}
          />
          <Button
            type="button"
            variant="accent"
            size="lg"
            className={AUTH_POPUP_PRIMARY_BUTTON}
            disabled={otcLoading}
            onClick={onSendCode}
          >
            {otcLoading ? t("sendingOtp") : t("sendOtp")}
          </Button>
        </>
      ) : (
        <>
          {otcDebugOtp ? (
            <p className="rounded-[0.7rem] bg-slate-100 px-3 py-2 text-xs text-slate-600">
              Demo OTP: {otcDebugOtp}
            </p>
          ) : null}
          <OTPVerificationBlock
            otp={otcOtp}
            otpError={otcOtpError}
            secondsLeft={secondsLeft}
            canResend={canResend}
            loading={otcLoading}
            onChangeOtp={onChangeOtp}
            onVerify={onVerifyCode}
            onResend={onResendCode}
          />
        </>
      )}
    </div>
  );
}

