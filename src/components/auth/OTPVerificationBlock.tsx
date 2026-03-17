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

  // Represent OTP as a fixed-length array of digits/placeholders so indices are stable.
  const digits = (() => {
    const chars = otp.split("").slice(0, OTP_LENGTH);
    while (chars.length < OTP_LENGTH) {
      chars.push(" ");
    }
    return chars;
  })();

  const setOtpFromDigits = useCallback(
    (newDigits: string[]) => {
      const normalized = newDigits
        .map((d) => (d && d !== " " ? d : " "))
        .slice(0, OTP_LENGTH);
      onChangeOtp(normalized.join(""));
    },
    [onChangeOtp],
  );

  const handleDigitChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit || " ";
    setOtpFromDigits(newDigits);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;

    e.preventDefault();
    const newDigits = [...digits];

    if (digits[index]) {
      // Clear current digit and move focus to previous field (if any).
      newDigits[index] = " ";
      setOtpFromDigits(newDigits);
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (index > 0) {
      // When current is already empty, just move focus to previous.
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    const newDigits = Array<string>(OTP_LENGTH).fill(" ");
    for (let i = 0; i < pasted.length && i < OTP_LENGTH; i += 1) {
      newDigits[i] = pasted[i];
    }

    setOtpFromDigits(newDigits);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label required>OTP code</Label>
        <div className="flex w-full justify-between p-1 gap-2 sm:gap-2.5">
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
                "h-12 flex-1 min-w-0 max-w-[3rem] rounded-lg border bg-white text-center text-size-lg fw-semibold tabular-nums transition-colors sm:h-14",
                "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1",
                otpError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-zinc-300 hover:border-zinc-400",
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-size-xs text-zinc-600">
        <span>
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "You can resend OTP now"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="fw-medium text-sky-700 disabled:text-zinc-400 px-0"
          disabled={!canResend || loading}
          onClick={onResend}
        >
          Resend OTP
        </Button>
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

