"use client";

import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { Button, Label } from "@/components/ui";
import { cn } from "@/lib/cn";

const OTP_LENGTH = 6;

interface OTPVerificationBlockProps {
  otp: string;
  otpError?: string;
  secondsLeft: number;
  canResend: boolean;
  loading: boolean;
  onChangeOtp: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
}

export function OTPVerificationBlock({
  otp,
  otpError,
  secondsLeft,
  canResend,
  loading,
  onChangeOtp,
  onVerify,
  onResend,
}: OTPVerificationBlockProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = otp.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);

  const setOtpFromDigits = useCallback(
    (newDigits: string[]) => {
      const value = newDigits.join("").replace(/\s/g, "").slice(0, OTP_LENGTH);
      onChangeOtp(value);
    },
    [onChangeOtp],
  );

  const handleDigitChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setOtpFromDigits(newDigits);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = " ";
      setOtpFromDigits(newDigits);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newDigits = pasted.split("").concat(Array(OTP_LENGTH).fill(" ")).slice(0, OTP_LENGTH);
    setOtpFromDigits(newDigits);
    const nextEmpty = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextEmpty]?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label required>OTP code</Label>
        <div className="flex p-1 gap-2 sm:gap-2.5">
          {Array.from({ length: OTP_LENGTH }, (_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete="one-time-code"
              value={digits[i] === " " ? "" : digits[i]}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={cn(
                "h-12 w-11 rounded-lg border bg-white text-center text-lg font-semibold tabular-nums transition-colors sm:h-14 sm:w-12",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1",
                otpError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-zinc-300 hover:border-zinc-400",
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {otpError ? (
          <p className="text-sm text-red-600" role="alert">
            {otpError}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        <span>
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "You can resend OTP now"}
        </span>
        <button
          type="button"
          className="font-medium text-sky-700 disabled:text-zinc-400"
          disabled={!canResend || loading}
          onClick={onResend}
        >
          Resend OTP
        </button>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={loading || otp.replace(/\s/g, "").length !== OTP_LENGTH}
        onClick={onVerify}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
}
