"use client";

import { Fragment } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { COUNTRY_CODE_OPTIONS } from "@/lib/phone";

interface PhoneCountryCodeSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

export function PhoneCountryCodeSelect({
  id,
  value,
  onChange,
  onFocus,
  className,
  buttonClassName,
  menuClassName,
  align = "left",
}: PhoneCountryCodeSelectProps) {
  const selectedOption =
    COUNTRY_CODE_OPTIONS.find((option) => option.value === value) ?? COUNTRY_CODE_OPTIONS[0];

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        id={id}
        onFocus={onFocus}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:border-transparent",
          buttonClassName,
        )}
        aria-label="Country code"
      >
        <span className="truncate">{selectedOption.selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute z-30 mt-1 max-h-64 w-[20rem] overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg focus:outline-none",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            menuClassName,
          )}
        >
          {COUNTRY_CODE_OPTIONS.map((option) => (
            <MenuItem key={option.value}>
              {({ focus }) => (
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-zinc-800",
                    focus && "bg-zinc-100",
                    option.value === selectedOption.value && "bg-zinc-50",
                  )}
                  onClick={() => onChange(option.value)}
                >
                  {option.dropdownLabel}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

