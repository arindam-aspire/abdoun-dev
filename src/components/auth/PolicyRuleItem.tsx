"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type PolicyRuleItemProps = {
  ok: boolean;
  label: string;
  /** When true, missing rules stand out (user has started typing). */
  emphasize?: boolean;
};

export function PolicyRuleItem({ ok, label, emphasize = false }: PolicyRuleItemProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 text-xs leading-5 transition-colors duration-200 ease-out",
        ok ? "text-emerald-600 dark:text-emerald-400" : emphasize ? "font-medium text-zinc-800 dark:text-zinc-200" : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {ok ? (
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} aria-hidden />
      ) : (
        <span
          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600"
          aria-hidden
        />
      )}
      <span>{label}</span>
    </li>
  );
}
