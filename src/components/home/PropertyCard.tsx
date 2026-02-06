"use client";

import Image from "next/image";
import { Bath, BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import type { Property } from "./types";

export interface PropertyCardProps {
  property: Property;
  agentLabel?: string;
}

export function PropertyCard({ property, agentLabel = "Abdoun Real Estate" }: PropertyCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <div className="relative h-52 w-full">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent opacity-80" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {property.badge}
          </span>
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white"
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {agentLabel}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">
              {property.title}
            </h3>
          </div>
          <p className="shrink-0 text-sm font-semibold text-sky-700">
            {property.price}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{property.location}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 shrink-0" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 shrink-0" />
            <span>{property.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
            <span>{property.area} sq.ft</span>
          </div>
        </div>
      </div>
    </article>
  );
}
