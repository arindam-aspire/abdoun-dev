"use client";

import { useState } from "react";

const BUDGET_SUGGESTIONS = [
  "0",
  "200000",
  "225000",
  "250000",
  "275000",
  "300000",
  "350000",
  "400000",
];

export interface BudgetRangeInputsProps {
  minBudget: string;
  maxBudget: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onDone: () => void;
  onReset: () => void;
  /** When provided (e.g. for rent), used instead of "Minimum" / "Maximum". */
  minLabel?: string;
  maxLabel?: string;
  /** When provided (e.g. for rent yearly max), used as placeholder for max input. */
  maxPlaceholder?: string;
}

export function BudgetRangeInputs({
  minBudget,
  maxBudget,
  onChangeMin,
  onChangeMax,
  onDone,
  onReset,
  minLabel = "Minimum",
  maxLabel = "Maximum",
  maxPlaceholder = "400000",
}: BudgetRangeInputsProps) {
  const [activeField, setActiveField] = useState<"min" | "max" | null>(null);

  const renderSuggestions = (field: "min" | "max") => {
    const currentValue = field === "min" ? minBudget : maxBudget;

    const filteredSuggestions = BUDGET_SUGGESTIONS.filter((value) => {
      const numeric = Number(value);

      if (field === "min") {
        // For minimum: do not show the currently selected max value,
        // and keep suggestions <= current max (if set).
        if (maxBudget && value === maxBudget) return false;
        if (maxBudget && numeric > Number(maxBudget)) return false;
      } else {
        // For maximum: do not show the currently selected min value,
        // and keep suggestions >= current min (if set).
        if (minBudget && value === minBudget) return false;
        if (minBudget && numeric < Number(minBudget)) return false;
      }

      return true;
    });

    if (activeField !== field) return null;

    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-subtle bg-white py-1 text-size-xs shadow-lg">
        {filteredSuggestions.map((value) => {
          const label = new Intl.NumberFormat("en-US").format(Number(value));
          const isSelected = currentValue === value;
          return (
            <button
              key={value}
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left transition ${
                isSelected
                  ? "bg-surface text-secondary"
                  : "text-charcoal hover:bg-surface"
              }`}
              onClick={() => {
                if (field === "min") {
                  onChangeMin(value);
                } else {
                  onChangeMax(value);
                }
                setActiveField(null);
              }}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="min-w-[260px] w-full max-w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-subtle bg-white p-3 text-xs shadow-xl ring-1 ring-black/5"
      onClick={() => setActiveField(null)}
    >
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <div className="mb-1 text-size-2xs fw-semibold uppercase tracking-[0.16em] text-[rgba(51,51,51,0.7)]">
            {minLabel}
          </div>
          <input
            type="number"
            value={minBudget}
            onFocus={() => setActiveField("min")}
            onChange={(e) => {
              onChangeMin(e.target.value);
              setActiveField("min");
            }}
            placeholder="0"
            className="h-9 w-full rounded-xl border border-subtle px-2 text-size-xs text-charcoal outline-none ring-0 placeholder:text-[rgba(51,51,51,0.45)] focus:border-primary focus:ring-1 focus:ring-[rgba(26,59,92,0.2)]"
          />
          {renderSuggestions("min")}
        </div>
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <div className="mb-1 text-size-2xs fw-semibold uppercase tracking-[0.16em] text-[rgba(51,51,51,0.7)]">
            {maxLabel}
          </div>
          <input
            type="number"
            value={maxBudget}
            onFocus={() => setActiveField("max")}
            onChange={(e) => {
              onChangeMax(e.target.value);
              setActiveField("max");
            }}
            placeholder={maxPlaceholder}
            className="h-9 w-full rounded-xl border border-subtle px-2 text-size-xs text-charcoal outline-none ring-0 placeholder:text-[rgba(51,51,51,0.45)] focus:border-primary focus:ring-1 focus:ring-[rgba(26,59,92,0.2)]"
          />
          {renderSuggestions("max")}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-subtle bg-white px-3 py-1.5 text-size-11 fw-semibold uppercase tracking-[0.16em] text-secondary shadow-sm hover:bg-surface"
          onClick={(event) => {
            event.stopPropagation();
            onReset();
            setActiveField(null);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full bg-accent px-4 py-1.5 text-size-11 fw-semibold uppercase tracking-[0.16em] text-secondary shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(253,185,19,0.45)]"
          onClick={(event) => {
            event.stopPropagation();
            onDone();
            setActiveField(null);
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

