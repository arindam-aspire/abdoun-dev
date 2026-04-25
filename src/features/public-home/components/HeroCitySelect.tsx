"use client";

import { useRef } from "react";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

export interface HeroCitySelectProps {
  label: string;
  placeholder: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (city: string) => void;
  isRtl: boolean;
}

export function HeroCitySelect({
  label,
  placeholder,
  value,
  isOpen,
  onToggle,
  onClose,
  onChange,
  isRtl,
}: HeroCitySelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    onClose();
  };

  return (
    <div className="relative min-w-0 flex-[1.2]">
      <label
        className="sr-only"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-[#b8c8ea] bg-white px-4 text-sm text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.12)]",
          isRtl ? "text-right" : "text-left",
        )}
        onClick={onToggle}
      >
        <span
          className={`w-full truncate ${
            value
              ? "font-medium text-slate-700"
              : "font-normal text-slate-500"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>
      <HeroDropdown
        isOpen={isOpen}
        onClose={onClose}
        align={isRtl ? "right" : "left"}
        anchorRef={triggerRef}
        closeOnSelect
      >
        <div className="w-full rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                !value ? "bg-surface text-secondary" : "text-charcoal"
              }`}
              onClick={() => handleSelect("")}
            >
              <span>{placeholder}</span>
            </button>
            {JORDAN_CITIES_WITH_AREAS.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                  value === city.name ? "bg-surface text-secondary" : "text-charcoal"
                }`}
                onClick={() => handleSelect(city.name)}
              >
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}

