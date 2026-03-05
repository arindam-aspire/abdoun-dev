"use client";

import { useRef } from "react";
import { HeroDropdown } from "./HeroDropdown";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";

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
        className={`mb-1 block text-size-11 fw-semibold uppercase tracking-[0.18em] text-[rgba(51,51,51,0.7)] ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        className={`flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors hover:border-[rgba(43,91,166,0.6)] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)] ${
          isRtl ? "text-right" : "text-left"
        }`}
        onClick={onToggle}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-size-2xs fw-medium text-secondary">
          C
        </span>
        <span className={`w-full truncate text-size-sm ${value ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.45)] fw-normal"}`}>
          {value || placeholder}
        </span>
      </button>
      <HeroDropdown
        isOpen={isOpen}
        onClose={onClose}
        align={isRtl ? "right" : "left"}
        anchorRef={triggerRef}
        portaled={false}
        closeOnSelect
      >
        <div className="w-64 rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                !value
                  ? "bg-surface text-secondary"
                  : "text-charcoal"
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
                  value === city.name
                    ? "bg-surface text-secondary"
                    : "text-charcoal"
                }`}
                onClick={() => handleSelect(city.name)}
              >
                <span>{city.name}</span>
                {/* {value === city.name && (
                  <span className="text-size-2xs fw-semibold uppercase tracking-wide text-primary">
                    Selected
                  </span>
                )} */}
              </button>
            ))}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}


