"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { inputNativeControlClassName } from "@/components/ui/input-classes";

const LENGTH = 6;

function sanitizeDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, LENGTH);
}

export interface OtpSixDigitInputProps {
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Prefix for input ids: `${idPrefix}-${index}` */
  idPrefix: string;
  /** Accessible name for the group (each box also gets “digit i of 6”). */
  groupLabel: string;
  className?: string;
  /** Focus first cell when mounted (e.g. modal opened to OTP step). */
  autoFocus?: boolean;
}

/**
 * Six single-digit fields with paste support, arrow keys, and predictable Backspace/Delete.
 */
export function OtpSixDigitInput({
  value,
  onChange,
  disabled,
  invalid,
  idPrefix,
  groupLabel,
  className,
  autoFocus,
}: OtpSixDigitInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = sanitizeDigits(value);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    queueMicrotask(() => {
      refs.current[0]?.focus();
    });
  }, [autoFocus, disabled]);

  const focusIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(LENGTH - 1, i));
    queueMicrotask(() => refs.current[clamped]?.focus());
  };

  const applyDigits = (next: string) => {
    onChange(sanitizeDigits(next));
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const pasted = sanitizeDigits(e.clipboardData.getData("text/plain"));
    if (!pasted) return;
    e.preventDefault();
    applyDigits(pasted);
    focusIndex(Math.min(pasted.length, LENGTH - 1));
  };

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    const cleaned = sanitizeDigits(raw);
    if (cleaned.length > 1) {
      applyDigits(cleaned);
      focusIndex(Math.min(cleaned.length, LENGTH - 1));
      return;
    }
    if (cleaned.length === 0) {
      const next = digits.slice(0, index) + digits.slice(index + 1);
      applyDigits(next);
      return;
    }
    const digit = cleaned[0] ?? "";
    const next = (digits.slice(0, index) + digit + digits.slice(index + 1)).slice(0, LENGTH);
    applyDigits(next);
    if (digit && index < LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (digits[index]) {
        e.preventDefault();
        applyDigits(digits.slice(0, index) + digits.slice(index + 1));
        return;
      }
      if (index > 0) {
        e.preventDefault();
        applyDigits(digits.slice(0, index - 1) + digits.slice(index));
        focusIndex(index - 1);
      }
      return;
    }
    if (e.key === "Delete") {
      if (digits[index]) {
        e.preventDefault();
        applyDigits(digits.slice(0, index) + digits.slice(index + 1));
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(index - 1);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  return (
    <fieldset className={cn("border-0 p-0 m-0 min-w-0", className)}>
      <legend className="sr-only">{groupLabel}</legend>
      <div
        dir="ltr"
        className="flex flex-wrap justify-center gap-2 sm:justify-start"
        role="group"
        aria-label={groupLabel}
      >
        {Array.from({ length: LENGTH }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idPrefix}-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            name={i === 0 ? "one-time-code" : undefined}
            aria-label={`${groupLabel} — ${i + 1} / ${LENGTH}`}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            value={digits[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={inputNativeControlClassName({
              error: invalid ? " " : undefined,
              className:
                "h-12 w-10 min-w-10 shrink-0 px-0 text-center text-base font-medium tabular-nums tracking-wide",
            })}
          />
        ))}
      </div>
    </fieldset>
  );
}
