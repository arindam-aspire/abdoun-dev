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
}

export function BudgetRangeInputs({
  minBudget,
  maxBudget,
  onChangeMin,
  onChangeMax,
  onDone,
  onReset,
}: BudgetRangeInputsProps) {
  const [activeField, setActiveField] = useState<"min" | "max" | null>(null);

  const renderSuggestions = (field: "min" | "max") => {
    const currentValue = field === "min" ? minBudget : maxBudget;

    if (activeField !== field) return null;

    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 text-xs shadow-lg">
        {BUDGET_SUGGESTIONS.map((value) => {
          const label = new Intl.NumberFormat("en-US").format(Number(value));
          const isSelected = currentValue === value;
          return (
            <button
              key={value}
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left transition ${
                isSelected
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-800 hover:bg-slate-50"
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
              {isSelected && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="w-[320px] rounded-2xl border border-slate-100 bg-white p-3 text-xs shadow-xl ring-1 ring-black/5"
      onClick={() => setActiveField(null)}
    >
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div
          className="relative"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Minimum
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
            className="h-9 w-full rounded-xl border border-slate-200 px-2 text-xs text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-200"
          />
          {renderSuggestions("min")}
        </div>
        <div
          className="relative"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Maximum
          </div>
          <input
            type="number"
            value={maxBudget}
            onFocus={() => setActiveField("max")}
            onChange={(e) => {
              onChangeMax(e.target.value);
              setActiveField("max");
            }}
            placeholder="400000"
            className="h-9 w-full rounded-xl border border-slate-200 px-2 text-xs text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-200"
          />
          {renderSuggestions("max")}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
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
          className="inline-flex cursor-pointer items-center rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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

