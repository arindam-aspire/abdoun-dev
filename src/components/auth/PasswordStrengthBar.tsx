"use client";

import { cn } from "@/lib/cn";
import type { PasswordStrengthLevel } from "@/components/auth/passwordPolicyShared";

export type PasswordStrengthBarProps = {
  level: PasswordStrengthLevel;
  /** Shown next to the meter (e.g. Weak / Medium / Strong or idle hint). */
  statusLabel: string;
  /** Left column label (e.g. "Password strength"). */
  heading: string;
};

function barWidthPct(level: PasswordStrengthLevel): number {
  if (level === "idle") return 6;
  if (level === "weak") return 33;
  if (level === "medium") return 66;
  return 100;
}

function barColorClass(level: PasswordStrengthLevel): string {
  if (level === "idle") return "bg-zinc-300 dark:bg-zinc-600";
  if (level === "weak") return "bg-red-500 dark:bg-red-500";
  if (level === "medium") return "bg-amber-500 dark:bg-amber-400";
  return "bg-emerald-600 dark:bg-emerald-500";
}

function statusTextClass(level: PasswordStrengthLevel): string {
  if (level === "idle") return "text-zinc-500 dark:text-zinc-400";
  if (level === "weak") return "text-red-600 dark:text-red-400";
  if (level === "medium") return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-500";
}

export function PasswordStrengthBar({ level, statusLabel, heading }: PasswordStrengthBarProps) {
  const pct = barWidthPct(level);
  const valueNow = level === "idle" ? 0 : level === "weak" ? 1 : level === "medium" ? 2 : 3;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{heading}</span>
        <span className={cn("text-xs font-semibold tabular-nums", statusTextClass(level))}>
          {statusLabel}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={valueNow}
        aria-valuetext={statusLabel}
        aria-label={heading}
      >
        <div
          className={cn("h-full rounded-full transition-[width,background-color] duration-300 ease-out", barColorClass(level))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
