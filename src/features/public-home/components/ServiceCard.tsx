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
      className={`group relative min-h-[248px] rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_36px_-18px_rgba(15,23,42,0.18)] ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      {Icon && (
        <div
          className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffe03a] text-slate-900 ${
            isRtl ? "ml-auto" : ""
          }`}
        >
          <Icon className="h-7 w-7 stroke-[2.2]" />
        </div>
      )}
      <h3 className="text-[1.4rem] font-semibold tracking-tight text-slate-900">
        {item.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
        {item.description}
      </p>
    </div>
  );
}

