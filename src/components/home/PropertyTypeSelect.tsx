"use client";

import { useState } from "react";
import { HeroDropdown } from "./HeroDropdown";

const PROPERTY_TYPES = [
  "Property Type",
  "Apartment",
  "Villa",
  "Penthouse",
  "Office",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface PropertyTypeSelectProps {
  label: string;
  isRtl: boolean;
  value: PropertyType;
  onChange: (value: PropertyType) => void;
}

export function PropertyTypeSelect({
  label,
  isRtl,
  value,
  onChange,
}: PropertyTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-[1.2]">
      <label
        className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        className="flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-sky-300 bg-white px-4 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-colors hover:border-sky-400 focus:outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-medium text-sky-600">
          🏙
        </span>
        <span className="w-full truncate text-sm text-slate-800">
          {value}
        </span>
      </button>

      <HeroDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        align={isRtl ? "right" : "left"}
      >
        <div className="w-64 rounded-2xl border border-slate-100 bg-white p-2 text-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto py-1">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-sky-50 ${
                  value === type ? "bg-sky-50 text-sky-700" : "text-slate-700"
                }`}
                onClick={() => {
                  onChange(type);
                  setIsOpen(false);
                }}
              >
                <span>{type}</span>
                {value === type && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}

