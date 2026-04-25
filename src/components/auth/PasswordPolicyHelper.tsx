"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { PolicyRuleItem } from "@/components/auth/PolicyRuleItem";
import { cn } from "@/lib/cn";
import {
  type PasswordPolicyChecks,
  getPasswordStrengthLevel,
} from "@/components/auth/passwordPolicyShared";

export type PasswordPolicyHelperProps = {
  checks: PasswordPolicyChecks;
  /** Current password value — when non-empty, missing rules are emphasized and hints may show. */
  password?: string;
  /** When false, hides the strength meter (rules list still enhanced). Default true. */
  showStrengthMeter?: boolean;
  /** When false, rules and hint are always visible (no toggle). Default true. */
  collapsibleDetails?: boolean;
  /** Initial open state for the requirement details panel. Default false (strength only). */
  defaultDetailsOpen?: boolean;
};

const RULE_KEYS: { key: keyof PasswordPolicyChecks; labelKey: string }[] = [
  { key: "minLength", labelKey: "passwordRuleMinLength" },
  { key: "upper", labelKey: "passwordRuleUpper" },
  { key: "lower", labelKey: "passwordRuleLower" },
  { key: "number", labelKey: "passwordRuleNumber" },
  { key: "symbol", labelKey: "passwordRuleSymbol" },
];

function buildHintItems(checks: PasswordPolicyChecks, t: (key: string) => string): string | null {
  const missing = RULE_KEYS.filter(({ key }) => !checks[key]).map(({ labelKey }) => t(labelKey));
  if (missing.length === 0) return null;
  return missing.join(", ");
}

export function PasswordPolicyHelper({
  checks,
  password = "",
  showStrengthMeter = true,
  collapsibleDetails = true,
  defaultDetailsOpen = false,
}: PasswordPolicyHelperProps) {
  const t = useTranslations("profile");
  const headingId = useId();
  const detailsPanelId = `${headingId}-details`;
  const [detailsOpen, setDetailsOpen] = useState(defaultDetailsOpen);
  const hasTyping = password.length > 0;
  const level = useMemo(
    () => getPasswordStrengthLevel(password.length, checks),
    [password.length, checks],
  );

  const strengthLabel = useMemo(() => {
    if (level === "idle") return t("passwordStrengthIdle");
    if (level === "weak") return t("passwordStrengthWeak");
    if (level === "medium") return t("passwordStrengthMedium");
    return t("passwordStrengthStrong");
  }, [level, t]);

  const hint = useMemo(() => {
    if (!hasTyping) return null;
    const items = buildHintItems(checks, t);
    if (!items) return null;
    return t("passwordHintImprove", { items });
  }, [checks, hasTyping, t]);

  const detailsBlock = (
    <>
      <p
        id={headingId}
        className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-200"
      >
        {t("passwordPolicyHeading")}
      </p>
      <ul className="mt-2 space-y-1.5" aria-labelledby={headingId}>
        {RULE_KEYS.map(({ key, labelKey }) => (
          <PolicyRuleItem
            key={key}
            ok={checks[key]}
            label={t(labelKey)}
            emphasize={hasTyping && !checks[key]}
          />
        ))}
      </ul>
      {hint ? (
        <p
          className="mt-3 text-xs leading-relaxed text-zinc-600 transition-opacity duration-200 dark:text-zinc-400"
          role="status"
        >
          {hint}
        </p>
      ) : null}
    </>
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
      {showStrengthMeter ? (
        <PasswordStrengthBar
          level={level}
          statusLabel={strengthLabel}
          heading={t("passwordStrengthHeading")}
        />
      ) : null}

      {collapsibleDetails ? (
        <div className="mt-3 border-t border-zinc-200/90 pt-3 dark:border-zinc-600/80">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-md px-0.5 py-1.5 text-left text-xs font-medium text-zinc-700 outline-none transition hover:bg-zinc-100/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-zinc-200 dark:hover:bg-zinc-800/70 dark:focus-visible:ring-offset-zinc-900"
            aria-expanded={detailsOpen}
            aria-controls={detailsPanelId}
            onClick={() => setDetailsOpen((o) => !o)}
          >
            <span>{detailsOpen ? t("passwordPolicyHideDetails") : t("passwordPolicyShowDetails")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 dark:text-zinc-400",
                detailsOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          <div
            id={detailsPanelId}
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
              detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div
              className={cn("min-h-0 overflow-hidden", !detailsOpen && "pointer-events-none")}
              aria-hidden={!detailsOpen}
            >
              <div
                className={cn(
                  "pt-2 transition-opacity duration-200 ease-out",
                  detailsOpen ? "opacity-100" : "opacity-0",
                )}
              >
                {detailsBlock}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2">{detailsBlock}</div>
      )}
    </div>
  );
}
