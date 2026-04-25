import { cn } from "@/lib/cn";

/**
 * Same conditional as `Input` when `error` is set — reused by the phone composite shell.
 */
const INPUT_CONTROL_ERROR_CLASS = "border-red-500 ring-2 ring-red-500/20";

/**
 * **Single source of truth** for the native `<input>` in `Input` (`input.tsx`).
 * Do not duplicate these strings elsewhere.
 */
export function inputNativeControlClassName(options: {
  error?: string;
  rightAdornment?: boolean;
  className?: string;
}): string {
  const { error, rightAdornment, className } = options;
  return cn(
    "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-size-sm text-zinc-900 shadow-sm transition-colors",
    "placeholder:text-zinc-400",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
    "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
    error && INPUT_CONTROL_ERROR_CLASS,
    rightAdornment && "pe-10",
    className,
  );
}

/**
 * Phone country + digits wrapper: same border, shadow, typography, error ring, and
 * primary focus ring as `inputNativeControlClassName`, using `focus-within` so either
 * segment can focus the control. Layout-only extras: `min-w-0 items-center gap-2`, no `py-2` on the shell (inner field uses `py-2`).
 */
export function compositeInputShellClassName(options: {
  error?: boolean;
  disabled?: boolean;
  className?: string;
}): string {
  const { error, disabled, className } = options;
  return cn(
    "flex h-10 w-full min-w-0 items-center gap-2 rounded-md border bg-white px-3 text-size-sm text-zinc-900 shadow-sm transition-colors",
    error
      ? cn(
          INPUT_CONTROL_ERROR_CLASS,
          "focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20",
        )
      : cn(
          "border-zinc-300",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-transparent",
        ),
    disabled && "pointer-events-none cursor-not-allowed bg-zinc-50 opacity-50",
    className,
  );
}

/** National-digit segment inside the composite shell (no outer box). */
export const compositeInputInnerClassName = cn(
  "min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-size-sm text-zinc-900 shadow-none outline-none",
  "placeholder:text-zinc-400",
  "focus:ring-0 focus:ring-offset-0",
  "disabled:cursor-not-allowed",
);
