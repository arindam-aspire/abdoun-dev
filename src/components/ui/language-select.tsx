"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LanguageCode } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { Dropdown, type DropdownOption } from "./dropdown";

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
   const isRtl = value === "ar";

  const options: DropdownOption[] = useMemo(
    () =>
      LANGUAGES.map((lang) => ({
        value: lang.code,
        label: showFullLabels ? lang.label : lang.code.toUpperCase(),
      })),
    [showFullLabels],
  );

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
        "inline-flex items-center",
        isRtl ? "justify-end" : "justify-start",
        className,
      )}
    >
      <label className="sr-only" htmlFor={id ?? "language-select"}>
        Select language
      </label>
      <Dropdown
        label={
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
            <span className="text-xs font-medium text-slate-700">
              {options.find((opt) => opt.value === value)?.label}
            </span>
          </span>
        }
        options={options}
        value={value}
        onChange={(next) => handleChange(next as LanguageCode)}
        align={isRtl ? "left" : "right"}
      />
    </div>
  );
}
