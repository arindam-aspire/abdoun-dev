"use client";

import Image from "next/image";
import { MapPin, Camera, PlayCircle } from "lucide-react";
import type { DetailedProperty } from "./types";

export interface PropertyDetailsHeroProps {
  property: DetailedProperty;
  onOpenGallery: () => void;
}

export function PropertyDetailsHero({
  property,
  onOpenGallery,
}: PropertyDetailsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="relative mx-auto container p-4">
        {/* Hero image */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-900/70 shadow-[0_22px_60px_rgba(15,23,42,0.7)]">
          <div className="relative h-[260px] w-full md:h-[360px] lg:h-[420px]">
            <Image
              src={property.image}
              alt={property.title}
              fill
              priority
              unoptimized
              quality={100}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />
          </div>

          {/* Top badge row */}
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 md:left-6 md:right-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {property.badge}
              </span>
              {property.status && (
                <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-500/40 backdrop-blur">
                  {property.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 ring-1 ring-slate-700/80 backdrop-blur hover:bg-slate-900"
              >
                <PlayCircle className="h-4 w-4 text-sky-400" />
                <span>Video tour</span>
              </button>
              <button
                type="button"
                onClick={onOpenGallery}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 ring-1 ring-slate-700/80 backdrop-blur hover:bg-slate-900"
              >
                <Camera className="h-4 w-4 text-sky-400" />
                <span>Photos</span>
              </button>
            </div>
          </div>

          {/* Content bar */}
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 md:inset-x-6 md:bottom-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                Abdoun Real Estate Exclusive
              </p>
              <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {property.title}
              </h1>
              <p className="text-sm text-slate-200 md:text-base">
                {property.subtitle}
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-900/85 p-4 text-right text-slate-100 shadow-lg ring-1 ring-slate-700/80 md:min-w-[220px] md:items-end">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Asking price
              </p>
              <p className="text-2xl font-semibold text-sky-300 md:text-3xl">
                {property.price}
              </p>
              <p className="text-[11px] text-slate-400">
                Service charge on request. Flexible viewing times.
              </p>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Book private tour
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-sky-200 ring-1 ring-slate-600 hover:bg-slate-800"
                >
                  Download brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

