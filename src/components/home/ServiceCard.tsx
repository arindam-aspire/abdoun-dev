"use client";

import { Building2, Home, TrendingUp } from "lucide-react";
import type { ServiceItem, ServiceCardIcon } from "./types";

const iconMap: Record<ServiceCardIcon, React.ComponentType<{ className?: string }>> = {
  home: Home,
  "trending-up": TrendingUp,
  building: Building2,
};

export interface ServiceCardProps {
  item: ServiceItem;
}

export function ServiceCard({ item }: ServiceCardProps) {
  const Icon = item.icon ? iconMap[item.icon] : null;

  return (
    <div className="group relative rounded-2xl bg-white p-8 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
      {Icon && (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {item.description}
      </p>
      <button
        type="button"
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
      >
        {item.cta}
      </button>
    </div>
  );
}
