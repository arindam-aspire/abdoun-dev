"use client";

import { Fragment, useId, useMemo, useState } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCountryCodeOptions } from "@/lib/phone";

/**
 * PNG flags load reliably on Windows; regional-indicator “flag emoji” often renders blank there.
 */
export function CountryFlagImg({
  iso2,
  className,
  title,
  loading = "lazy",
}: {
  iso2: string;
  className?: string;
  title?: string;
  loading?: "eager" | "lazy";
}) {
  const code = iso2.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      title={title}
      width={40}
      height={30}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("inline-block shrink-0 rounded-sm object-cover", className)}
    />
  );
}

interface PhoneCountryCodeSelectProps {
  id?: string;
  /** ISO 3166-1 alpha-2 (e.g. `JO`). */
  value: string;
  onChange: (iso2: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  /** `flag-only`: flag image in the trigger; dial code is in `aria-label`. */
  buttonLabel?: "full" | "flag-only";
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  align?: "left" | "right";
}

/** Latin-friendly fold so "turkiye" matches "Türkiye" (English `countryEn`). */
function foldLatinForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en");
}

function matchesLocalizedName(country: string, rawQuery: string, locale: string): boolean {
  const qt = rawQuery.trim();
  if (!qt) return false;
  if (country.includes(qt)) return true;
  try {
    return country
      .toLocaleLowerCase(locale)
      .includes(qt.toLocaleLowerCase(locale));
  } catch {
    return country.toLowerCase().includes(qt.toLowerCase());
  }
}

function filterOptions(
  options: ReturnType<typeof getCountryCodeOptions>,
  query: string,
  locale: string,
) {
  const raw = query.trim();
  if (!raw) return options;

  const qFold = foldLatinForSearch(raw);
  const qDigits = raw.replace(/\D/g, "");

  return options.filter((o) => {
    const dialDigits = o.dial.replace(/\D/g, "");
    const hitEnglishName = foldLatinForSearch(o.countryEn).includes(qFold);
    const hitLocalized = matchesLocalizedName(o.country, raw, locale);
    const hitIso = o.iso2.toLowerCase().includes(raw.toLowerCase());
    const hitDial =
      o.dial.includes(raw) || (qDigits.length > 0 && dialDigits.includes(qDigits));
    return hitEnglishName || hitLocalized || hitIso || hitDial;
  });
}

export function PhoneCountryCodeSelect({
  id,
  value,
  onChange,
  onFocus,
  disabled = false,
  buttonLabel = "full",
  className,
  buttonClassName,
  panelClassName,
  align = "left",
}: PhoneCountryCodeSelectProps) {
  const locale = useLocale();
  const t = useTranslations("phoneInput");
  const fallbackSearchId = useId();
  const searchFieldId = id ? `${id}-search` : `${fallbackSearchId}-country-search`;
  const [query, setQuery] = useState("");
  const options = useMemo(() => getCountryCodeOptions(locale), [locale]);
  const filtered = useMemo(
    () => filterOptions(options, query, locale),
    [options, query, locale],
  );

  const upperValue = value?.toUpperCase?.() ?? "";
  const selected =
    options.find((o) => o.iso2 === upperValue) ?? options.find((o) => o.iso2 === "JO") ?? options[0];

  return (
    <Popover className={cn("relative", className)}>
      <PopoverButton
        id={id}
        type="button"
        disabled={disabled}
        onFocus={onFocus}
        onClick={() => setQuery("")}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 shadow-sm transition-colors",
          "focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-zinc-400",
          disabled && "cursor-not-allowed opacity-50",
          buttonClassName,
          buttonLabel === "flag-only" ? "min-w-12 justify-center gap-1 px-2" : "text-sm",
        )}
        aria-label={`${selected.country} ${selected.dial}`}
        aria-haspopup="dialog"
      >
        {({ open }) => (
          <>
            {buttonLabel === "flag-only" ? (
              <span className="relative flex shrink-0 items-center justify-center" aria-hidden>
                <CountryFlagImg
                  iso2={selected.iso2}
                  loading="eager"
                  title={selected.country}
                  className="h-7 w-10"
                />
              </span>
            ) : (
              <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                <CountryFlagImg
                  iso2={selected.iso2}
                  loading="eager"
                  title={selected.country}
                  className="h-6 w-8 shrink-0"
                />
                <span className="truncate tabular-nums">{selected.dial}</span>
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200 ease-out",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        )}
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <PopoverPanel
          transition
          focus
          modal={false}
          portal
          className={cn(
            "z-[100] mt-1 w-[min(22rem,calc(100vw-1.5rem))] rounded-md border border-zinc-200 bg-white shadow-lg outline-none",
            panelClassName,
          )}
          anchor={{ to: align === "right" ? "bottom end" : "bottom start", gap: 4 }}
        >
          {({ close }) => (
            <>
              <div className="border-b border-zinc-100 p-2">
                <label className="sr-only" htmlFor={searchFieldId}>
                  {t("searchCountries")}
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    aria-hidden
                  />
                  <input
                    id={searchFieldId}
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 ps-9 pe-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>
              </div>
              <ul
                className="max-h-64 list-none overflow-y-auto py-1"
                role="listbox"
                aria-label={t("countriesList")}
              >
                {filtered.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-zinc-500">{t("noMatches")}</li>
                ) : (
                  filtered.map((option) => (
                    <li key={option.iso2} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={option.iso2 === selected.iso2}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 transition-colors",
                          "hover:bg-zinc-100",
                          option.iso2 === selected.iso2 && "bg-zinc-50",
                        )}
                        onClick={() => {
                          onChange(option.iso2);
                          setQuery("");
                          close();
                        }}
                      >
                        <span className="relative flex h-5 w-7 shrink-0 items-center justify-center">
                          <CountryFlagImg
                            iso2={option.iso2}
                            title={option.country}
                            className="h-5 w-7"
                          />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{option.country}</span>
                        <span className="shrink-0 tabular-nums text-zinc-500">{option.dial}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
