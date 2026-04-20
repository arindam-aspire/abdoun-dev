import { Button, LoadingButton } from "@/components/ui";
import { AuthPopupField, OTPVerificationBlock, PasswordPolicyHelper, AuthAlert } from "@/components/auth";
import {
  AUTH_POPUP_PRIMARY_BUTTON,
  AUTH_POPUP_STEP_STACK,
} from "@/components/auth/authPopupStyles";
import type { ForgotPasswordFlowState } from "@/components/auth/popup-steps/types";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupForgotStepProps {
  t: ReturnType<typeof useTranslations>;
  forgot: ForgotPasswordFlowState;
  onFocusIdentifier?: () => void;
  onFocusNewPassword?: () => void;
  onFocusConfirmPassword?: () => void;
}

export function AuthPopupForgotStep({
  t,
  forgot,
  onFocusIdentifier,
  onFocusNewPassword,
  onFocusConfirmPassword,
}: AuthPopupForgotStepProps) {
  return (
    <div className={AUTH_POPUP_STEP_STACK}>
      {forgot.step === "request" ? (
        <>
          <AuthPopupField
            id="forgot-identifier"
            label={t("emailOrPhone")}
            placeholder={t("emailOrPhone")}
            value={forgot.fields.identifier}
            onChange={forgot.actions.setIdentifier}
            onFocus={onFocusIdentifier}
            error={forgot.errors.identifier}
          />
          <LoadingButton
            type="button"
            variant="accent"
            size="lg"
            className={AUTH_POPUP_PRIMARY_BUTTON}
            loading={forgot.loading}
            onClick={forgot.actions.requestOtp}
          >
            {t("sendOtp")}
          </LoadingButton>
        </>
      ) : null}

      {forgot.step === "otp" ? (
        <>
          {forgot.debugOtp ? (
            <p className="rounded-[0.7rem] bg-slate-100 px-3 py-2 text-xs text-slate-600">
              OTP: {forgot.debugOtp}
            </p>
          ) : null}
          <OTPVerificationBlock
            otp={forgot.fields.otp}
            otpError={forgot.errors.otp}
            secondsLeft={forgot.timer.secondsLeft}
            canResend={forgot.timer.canResend}
            loading={forgot.loading}
            onChangeOtp={forgot.actions.setOtp}
            onVerify={forgot.actions.verifyOtp}
            onResend={forgot.actions.resendOtp}
          />
        </>
      ) : null}

      {forgot.step === "reset" ? (
        <>
          <AuthPopupField
            id="reset-password"
            type="password"
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            value={forgot.fields.newPassword}
            onChange={forgot.actions.setNewPassword}
            onFocus={onFocusNewPassword}
            error={forgot.errors.newPassword}
          />
          <PasswordPolicyHelper checks={forgot.passwordChecks} />
          <AuthPopupField
            id="reset-confirm-password"
            type="password"
            label={t("confirmPassword")}
            placeholder={t("confirmPasswordPlaceholder")}
            value={forgot.fields.confirmPassword}
            onChange={forgot.actions.setConfirmPassword}
            onFocus={onFocusConfirmPassword}
            error={forgot.errors.confirmPassword}
          />
          <Button
            type="button"
            variant="accent"
            size="lg"
            className={AUTH_POPUP_PRIMARY_BUTTON}
            disabled={forgot.loading}
            onClick={forgot.actions.setPassword}
          >
            {forgot.loading ? "Updating..." : "Set New Password"}
          </Button>
        </>
      ) : null}

      {forgot.step === "success" ? (
        <AuthAlert
          kind="success"
          message="Password updated. You can now login."
        />
      ) : null}
    </div>
  );
}

