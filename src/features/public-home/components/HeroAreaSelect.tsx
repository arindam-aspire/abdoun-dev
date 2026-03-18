"use client";

import { useRef } from "react";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";

export interface HeroAreaSelectProps {
  label: string;
  placeholder: string;
  selectedAreas: string[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectionChange: (areas: string[]) => void;
  areaOptions: string[];
  disabled: boolean;
  isRtl: boolean;
}

export function HeroAreaSelect({
  label,
  placeholder,
  selectedAreas,
  isOpen,
  onToggle,
  onClose,
  onSelectionChange,
  areaOptions,
  disabled,
  isRtl,
}: HeroAreaSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toggleArea = (area: string) => {
    onSelectionChange(
      selectedAreas.includes(area)
        ? selectedAreas.filter((a) => a !== area)
        : [...selectedAreas, area],
    );
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
        disabled={disabled}
        className={`flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)] ${
          disabled
            ? "cursor-not-allowed border-[rgba(43,91,166,0.2)] bg-surface/50 text-[rgba(51,51,51,0.5)]"
            : "border-[rgba(43,91,166,0.35)] hover:border-[rgba(43,91,166,0.6)] focus-visible:border-primary"
        } ${isRtl ? "text-right" : "text-left"}`}
        onClick={() => {
          if (disabled) return;
          onToggle();
        }}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-size-2xs fw-medium text-secondary">
          A
        </span>
        <span
          className={`w-full truncate text-size-sm ${
            !disabled && selectedAreas.length > 0
              ? "text-charcoal fw-medium"
              : "text-[rgba(51,51,51,0.45)] fw-normal"
          }`}
        >
          {disabled
            ? "Select city first"
            : selectedAreas.length > 0
              ? selectedAreas.join(", ")
              : placeholder}
        </span>
      </button>
      <HeroDropdown
        isOpen={isOpen && !disabled}
        onClose={onClose}
        align={isRtl ? "right" : "left"}
        anchorRef={triggerRef}
        portaled={false}
      >
        <div className="w-64 rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                selectedAreas.length === 0
                  ? "bg-surface text-secondary"
                  : "text-charcoal"
              }`}
              onClick={() => onSelectionChange([])}
            >
              <span>{placeholder}</span>
            </button>
            {areaOptions.map((area) => {
              const isSelected = selectedAreas.includes(area);
              return (
                <label
                  key={area}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                    isSelected
                      ? "bg-surface text-secondary"
                      : "text-charcoal"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArea(area)}
                      className="h-4 w-4 cursor-pointer rounded border-subtle text-secondary focus:ring-primary"
                    />
                    <span>{area}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}

