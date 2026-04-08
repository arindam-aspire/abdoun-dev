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
      { value: "es", label: showFullLabels ? t("es") : "SP" },
      { value: "fr", label: showFullLabels ? t("fr") : "FR" },
    ],
    [showFullLabels, t],
  );

  const compactMode = showFullLabels === false;

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
          <span className="flex items-center">
            <span
              className={cn(
                "font-medium text-[#1a3b5c]",
                compactMode ? "text-xs" : "text-sm",
              )}
            >
              {options.find((opt) => opt.value === value)?.label}
            </span>
          </span>
        }
        buttonClassName={cn(
          "border-0 bg-white shadow-sm hover:bg-gray-100 shrink-0 text-sm",
          compactMode
            ? "h-9 w-[56px] rounded-xl px-2.5 md:h-11"
            : "h-9 min-w-0 rounded-xl px-3 md:h-11",
        )}
        menuClassName={cn(
          compactMode && "mt-1.5 w-[56px] min-w-[56px] rounded-md border border-zinc-200 p-0 shadow-lg",
        )}
        optionClassName={cn(
          compactMode && "px-0 py-2 text-center text-xs font-medium text-[#1a3b5c]",
        )}
        options={options}
        value={value}
        onChange={(next) => handleChange(next as AppLocale)}
        align={isRtl ? "left" : "right"}
      />
    </div>
  );
}

