"use client";

import type { ServiceItem } from "./types";

export interface ServiceCardProps {
  item: ServiceItem;
}

export function ServiceCard({ item }: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 text-left shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-sky-700 hover:text-sky-800"
      >
        {item.cta}
      </button>
    </div>
  );
}
