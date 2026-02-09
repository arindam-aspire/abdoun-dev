"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/cn";

const LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
  (lang) => lang.code,
) as LanguageCode[];

export interface LanguageSelectProps {
  value: LanguageCode;
  /**
   * Optional callback. If omitted, the selector will update the current URL by
   * swapping or injecting the `/:lang` segment (router-based language).
   */
  onChange?: (language: LanguageCode) => void;
  id?: string;
  className?: string;
  /** Show full labels (e.g. "English") when true, short codes (e.g. "EN") when false. Default true to match home page. */
  showFullLabels?: boolean;
}

export function LanguageSelect({
  value,
  onChange,
  id,
  className,
  showFullLabels = true,
}: LanguageSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = useCallback(
    (next: LanguageCode) => {
      if (onChange) {
        onChange(next);
        return;
      }

      if (!pathname) {
        router.push(`/${next}`);
        return;
      }

      const segments = pathname.split("/").filter(Boolean);

      if (segments.length === 0) {
        router.push(`/${next}`);
        return;
      }

      const maybeLang = segments[0];

      if (LANGUAGE_CODES.includes(maybeLang as LanguageCode)) {
        segments[0] = next;
      } else {
        segments.unshift(next);
      }

      router.push(`/${segments.join("/")}`);
    },
    [onChange, pathname, router],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm",
        className,
      )}
    >
      <Globe className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
      <label className="sr-only" htmlFor={id ?? "language-select"}>
        Select language
      </label>
      <select
        id={id ?? "language-select"}
        value={value}
        onChange={(e) => handleChange(e.target.value as LanguageCode)}
        className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {showFullLabels ? lang.label : lang.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
