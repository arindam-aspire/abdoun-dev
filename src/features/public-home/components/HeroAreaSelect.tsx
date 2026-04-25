"use client";

import { useRef } from "react";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { ChevronDown } from "lucide-react";

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
        className="sr-only"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={`flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 text-left text-sm shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.12)] ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "border-[#b8c8ea] hover:border-[#8fa6d8] focus-visible:border-primary"
        } ${isRtl ? "text-right" : "text-left"}`}
        onClick={() => {
          if (disabled) return;
          onToggle();
        }}
      >
        <span
          className={`w-full truncate ${
            !disabled && selectedAreas.length > 0
              ? "font-medium text-slate-700"
              : "font-normal text-slate-500"
          }`}
        >
          {disabled
            ? "Select city first"
            : selectedAreas.length > 0
              ? selectedAreas.join(", ")
              : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>
      <HeroDropdown
        isOpen={isOpen && !disabled}
        onClose={onClose}
        align={isRtl ? "right" : "left"}
        anchorRef={triggerRef}
      >
        <div className="w-full rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
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

