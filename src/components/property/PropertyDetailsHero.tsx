"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import type { DetailedProperty } from "./types";

export interface PropertyDetailsHeroProps {
  property: DetailedProperty;
}

export function PropertyDetailsHero({
  property,
}: PropertyDetailsHeroProps) {
  const galleryImages = useMemo(
    () => (property.gallery && property.gallery.length > 0 ? property.gallery : [property.image]),
    [property.gallery, property.image],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? property.image;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto container p-4">
        {/* Hero image + side gallery */}
        <div className="relative overflow-hidden rounded-3xl ">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2 md:h-[360px] lg:h-[440px]">
            {/* Large main image (carousel) */}
            <div className="relative h-[260px] w-full overflow-hidden md:h-full md:flex-[3]">
              <Image
                src={activeImage}
                alt={property.title}
                fill
                priority
                unoptimized
                quality={100}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />

              {/* Carousel controls */}
              {galleryImages.length > 1 && (
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 md:px-4">
                  <button
                    type="button"
                    className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-white"
                    onClick={() =>
                      setActiveIndex(
                        (prev) =>
                          (prev - 1 + galleryImages.length) %
                          galleryImages.length,
                      )
                    }
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-white"
                    onClick={() =>
                      setActiveIndex(
                        (prev) => (prev + 1) % galleryImages.length,
                      )
                    }
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Top badge row (over main image) */}
              <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between gap-3 md:left-6 md:right-6">
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
                <div className="flex items-center gap-2" />
              </div>

              {/* Content bar: keep name & address over large photo */}
              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-col gap-3 text-white md:left-6 md:right-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                  Abdoun Real Estate Exclusive
                </p>
                <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                  {property.title}
                </h1>
                <p className="text-sm text-slate-200 md:text-base">
                  {property.subtitle}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>

            {/* Desktop: vertical gallery strip on the right, scrollable */}
            {galleryImages.length > 1 && (
              <div className="hidden w-full max-w-[220px] px-1 flex-col gap-2 rounded-2xl text-xs text-slate-900 md:flex">
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {galleryImages.map((src, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={src + index.toString()}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`relative block w-full overflow-hidden rounded-2xl border transition ${
                          isActive
                            ? "border-sky-500 ring-2 ring-sky-500/40"
                            : "border-slate-200 hover:border-sky-300"
                        }`}
                        style={{ aspectRatio: "4 / 3" }}
                      >
                        <Image
                          src={src}
                          alt={`Property photo ${index + 1}`}
                          fill
                          sizes="180px"
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile: horizontal gallery strip below the image */}
          {galleryImages.length > 1 && (
            <div className="pointer-events-auto block border-t border-slate-800/70 bg-slate-950/70 px-3 py-2 md:hidden">
              <div className="flex gap-2 overflow-x-auto">
                {galleryImages.map((src, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={src + index.toString()}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative flex-shrink-0 overflow-hidden rounded-2xl border bg-slate-900/70 transition ${
                        isActive
                          ? "border-sky-400 ring-1 ring-sky-500/70"
                          : "border-slate-800/70 hover:border-slate-600"
                      }`}
                      style={{ width: "96px", aspectRatio: "4 / 3" }}
                    >
                      <Image
                        src={src}
                        alt={`Property photo ${index + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

