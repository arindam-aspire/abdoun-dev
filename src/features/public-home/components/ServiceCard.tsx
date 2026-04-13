"use client";

import { Building2, Home, TrendingUp } from "lucide-react";
import type {
  ServiceItem,
  ServiceCardIcon,
} from "@/features/public-home/components/types";

const iconMap: Record<
  ServiceCardIcon,
  React.ComponentType<{ className?: string }>
> = {
  home: Home,
  "trending-up": TrendingUp,
  building: Building2,
};

export interface ServiceCardProps {
  item: ServiceItem;
  isRtl?: boolean;
}

export function ServiceCard({ item, isRtl }: ServiceCardProps) {
  const Icon = item.icon ? iconMap[item.icon] : null;

  return (
    <div
      className={`group relative min-h-[220px] rounded-3xl border border-[#e5e7eb] bg-white p-6 md:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_36px_-18px_rgba(15,23,42,0.18)] ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      {Icon && (
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffe03a] text-slate-900 ${
            isRtl ? "ml-auto" : ""
          }`}
        >
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
      )}
      <h3 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[1.35rem]">
        {item.title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-600 md:text-base">
        {item.description}
      </p>
    </div>
  );
}

