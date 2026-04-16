"use client";

import { useRef } from "react";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

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
      <label className="sr-only">{label}</label>
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
            value ? "font-medium text-slate-700" : "font-normal text-slate-500"
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
        portaled={false}
        closeOnSelect
      >
        <div className="w-64 rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                !value ? "bg-surface text-secondary" : "text-charcoal"
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
                className={`flex w-full cursor-pointer justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface ${
                  value === type ? "bg-surface text-secondary" : "text-charcoal"
                }`}
                onClick={() => {
                  onChange(type);
                  onClose();
                }}
              >
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}
