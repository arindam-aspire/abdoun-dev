"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { Dropdown, type DropdownOption } from "./dropdown";

export interface LanguageSelectProps {
  value: AppLocale;
  /**
   * Optional callback. If omitted, the selector will update the current URL by
   * swapping or injecting the `/:lang` segment (router-based language).
   */
  onChange?: (language: AppLocale) => void;
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
  const t = useTranslations("LocaleSwitcher");
  const isRtl = value === "ar";

  const options: DropdownOption[] = useMemo(
    () => [
      { value: "en", label: showFullLabels ? t("en") : "EN" },
      { value: "ar", label: showFullLabels ? t("ar") : "AR" },
      { value: "es", label: showFullLabels ? t("es") : "ES" },
      { value: "fr", label: showFullLabels ? t("fr") : "FR" },
    ],
    [showFullLabels, t],
  );

  const handleChange = useCallback(
    (next: AppLocale) => {
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

      if (routing.locales.includes(maybeLang as AppLocale)) {
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
        buttonId={id ?? "language-select-button"}
        label={
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
            <span className="text-size-xs fw-medium text-slate-700">
              {options.find((opt) => opt.value === value)?.label}
            </span>
          </span>
        }
        options={options}
        value={value}
        onChange={(next) => handleChange(next as AppLocale)}
        align={isRtl ? "left" : "right"}
      />
    </div>
  );
}

