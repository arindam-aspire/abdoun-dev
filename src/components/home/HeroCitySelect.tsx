"use client";

import { useState, useRef, useEffect } from "react";
import { HeroDropdown } from "./HeroDropdown";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";

export interface HeroCitySelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (city: string) => void;
  isRtl: boolean;
}

export function HeroCitySelect({
  label,
  placeholder,
  value,
  onChange,
  isRtl,
}: HeroCitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-[1.2]" ref={containerRef}>
      <label
        className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(51,51,51,0.7)] ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        className={`flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors hover:border-[rgba(43,91,166,0.6)] focus:outline-none focus-visible:border-[var(--brand-primary)] focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)] ${
          isRtl ? "text-right" : "text-left"
        }`}
        onClick={() => setIsOpen((o) => !o)}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-medium text-[var(--brand-secondary)]">
          C
        </span>
        <span className="w-full truncate text-sm text-[var(--color-charcoal)]">
          {value || placeholder}
        </span>
      </button>
      <HeroDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        align={isRtl ? "right" : "left"}
      >
        <div className="w-64 rounded-2xl border border-[var(--border-subtle)] bg-white p-2 text-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            {JORDAN_CITIES_WITH_AREAS.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)] ${
                  value === city.name
                    ? "bg-[var(--surface)] text-[var(--brand-secondary)]"
                    : "text-[var(--color-charcoal)]"
                }`}
                onClick={() => handleSelect(city.name)}
              >
                <span>{city.name}</span>
                {/* {value === city.name && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
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
