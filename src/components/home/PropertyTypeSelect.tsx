"use client";

import { useRef } from "react";
import { HeroDropdown } from "./HeroDropdown";

export type PropertyType = string;

export interface PropertyTypeSelectProps {
  label: string;
  placeholder?: string;
  isRtl: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  value: PropertyType;
  options: PropertyType[];
  onChange: (value: PropertyType) => void;
}

export function PropertyTypeSelect({
  label,
  placeholder = "Select type",
  isRtl,
  isOpen,
  onToggle,
  onClose,
  value,
  options,
  onChange,
}: PropertyTypeSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative flex-[1.2]">
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
        className="flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors hover:border-[rgba(43,91,166,0.6)] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)]"
        onClick={onToggle}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-size-2xs fw-medium text-secondary">
          PT
        </span>
        <span
          className={`w-full truncate text-size-sm ${value ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.45)] fw-normal"}`}
        >
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
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                !value
                  ? "bg-surface text-secondary"
                  : "text-charcoal"
              }`}
              onClick={() => {
                onChange("");
                onClose();
              }}
            >
              <span>{placeholder}</span>
            </button>
            {options.map((type) => (
              <button
                key={type}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                  value === type
                    ? "bg-surface text-secondary"
                    : "text-charcoal"
                }`}
                onClick={() => {
                  onChange(type);
                  onClose();
                }}
              >
                <span>{type}</span>
                {/* {value === type && (
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


