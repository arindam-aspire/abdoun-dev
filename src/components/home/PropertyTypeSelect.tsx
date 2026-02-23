"use client";

import { useState } from "react";
import { HeroDropdown } from "./HeroDropdown";

export type PropertyType = string;

export interface PropertyTypeSelectProps {
  label: string;
  isRtl: boolean;
  value: PropertyType;
  options: PropertyType[];
  onChange: (value: PropertyType) => void;
}

export function PropertyTypeSelect({
  label,
  isRtl,
  value,
  options,
  onChange,
}: PropertyTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-[1.2]">
      <label
        className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(51,51,51,0.7)] ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        className="flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors hover:border-[rgba(43,91,166,0.6)] focus:outline-none focus-visible:border-[var(--brand-primary)] focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)]"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-medium text-[var(--brand-secondary)]">
          PT
        </span>
        <span className="w-full truncate text-sm text-[var(--color-charcoal)]">
          {value}
        </span>
      </button>

      <HeroDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        align={isRtl ? "right" : "left"}
      >
        <div className="w-64 rounded-2xl border border-[var(--border-subtle)] bg-white p-2 text-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((type) => (
              <button
                key={type}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)] ${
                  value === type
                    ? "bg-[var(--surface)] text-[var(--brand-secondary)]"
                    : "text-[var(--color-charcoal)]"
                }`}
                onClick={() => {
                  onChange(type);
                  setIsOpen(false);
                }}
              >
                <span>{type}</span>
                {/* {value === type && (
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
