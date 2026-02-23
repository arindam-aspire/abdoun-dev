"use client";

import { useState, useRef, useEffect } from "react";
import { HeroDropdown } from "./HeroDropdown";

export interface HeroAreaSelectProps {
  label: string;
  placeholder: string;
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
  areaOptions: string[];
  disabled: boolean;
  isRtl: boolean;
}

export function HeroAreaSelect({
  label,
  placeholder,
  selectedAreas,
  onSelectionChange,
  areaOptions,
  disabled,
  isRtl,
}: HeroAreaSelectProps) {
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

  const toggleArea = (area: string) => {
    onSelectionChange(
      selectedAreas.includes(area)
        ? selectedAreas.filter((a) => a !== area)
        : [...selectedAreas, area]
    );
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
        disabled={disabled}
        className={`flex h-14 w-full cursor-pointer items-center gap-2 rounded-full border-2 bg-white px-4 text-left shadow-[0_0_0_1px_rgba(26,59,92,0.03)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.2)] ${
          disabled
            ? "cursor-not-allowed border-[rgba(43,91,166,0.2)] bg-[var(--surface)]/50 text-[rgba(51,51,51,0.5)]"
            : "border-[rgba(43,91,166,0.35)] hover:border-[rgba(43,91,166,0.6)] focus-visible:border-[var(--brand-primary)]"
        } ${isRtl ? "text-right" : "text-left"}`}
        onClick={() => {
          if (disabled) return;
          setIsOpen((open) => !open);
        }}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-medium text-[var(--brand-secondary)]">
          A
        </span>
        <span className="w-full truncate text-sm text-[var(--color-charcoal)]">
          {selectedAreas.length > 0 ? selectedAreas.join(", ") : placeholder}
        </span>
      </button>
      <HeroDropdown
        isOpen={isOpen && !disabled}
        onClose={() => setIsOpen(false)}
        align={isRtl ? "right" : "left"}
      >
        <div className="w-64 rounded-2xl border border-[var(--border-subtle)] bg-white p-2 text-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            {areaOptions.map((area) => {
              const isSelected = selectedAreas.includes(area);
              return (
                <label
                  key={area}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)] ${
                    isSelected
                      ? "bg-[var(--surface)] text-[var(--brand-secondary)]"
                      : "text-[var(--color-charcoal)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArea(area)}
                      className="h-4 w-4 cursor-pointer rounded border-[var(--border-subtle)] text-[var(--brand-secondary)] focus:ring-[var(--brand-primary)]"
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
