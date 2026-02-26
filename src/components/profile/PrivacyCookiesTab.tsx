"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface PrivacyCookiesTabProps {
  /** Initial preferences (e.g. from profile/settings). */
  initialMarketing?: boolean;
  initialAnalytics?: boolean;
  onSave?: (prefs: { marketing: boolean; analytics: boolean }) => void | Promise<void>;
  isRtl?: boolean;
  className?: string;
}

export function PrivacyCookiesTab({
  initialMarketing = false,
  initialAnalytics = true,
  onSave,
  isRtl = false,
  className,
}: PrivacyCookiesTabProps) {
  const t = useTranslations("profile");
  const [marketing, setMarketing] = useState(initialMarketing);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave?.({ marketing, analytics });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [marketing, analytics, onSave]);

  return (
    <div
      className={cn("space-y-6", className)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Manage how we use your data and communicate with you.
      </p>

      {/* Essential cookies - always on */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-essential"
            checked
            disabled
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <div>
            <label htmlFor="privacy-essential" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t("privacyEssentialCookies")}
            </label>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {t("privacyEssentialDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Marketing emails */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <div>
            <label htmlFor="privacy-marketing" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t("privacyMarketingEmails")}
            </label>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {t("privacyMarketingDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Analytics cookies */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-analytics"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <div>
            <label htmlFor="privacy-analytics" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t("privacyAnalyticsCookies")}
            </label>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {t("privacyAnalyticsDescription")}
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "..." : t("savePreferences")}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Preferences saved.
          </span>
        )}
      </div>
    </div>
  );
}
