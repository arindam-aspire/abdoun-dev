"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Bath, BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import type { Property } from "./types";

export interface PropertyCardProps {
  property: Property;
  agentLabel?: string;
}

export function PropertyCard({
  property,
  agentLabel = "Abdoun Real Estate",
}: PropertyCardProps) {
  const language = useLocale() as AppLocale;
  const isRtl = language === "ar";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isRtl ? "flex h-full flex-col text-right" : "flex h-full flex-col text-left"
      }`}
    >
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(26,59,92,0.45)] via-[rgba(26,59,92,0.1)] to-transparent opacity-80" />
        <div
          className={`absolute top-4 flex items-center gap-2 ${
            isRtl ? "right-4 flex-row-reverse" : "left-4"
          }`}
        >
          <span className="rounded-full bg-[var(--brand-accent)] px-3 py-1 text-xs font-semibold text-[var(--brand-secondary)] shadow-sm">
            {property.badge}
          </span>
        </div>
        <button
          type="button"
          className={`absolute top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--brand-secondary)] shadow-sm ring-1 ring-[var(--border-subtle)] hover:bg-white ${
            isRtl ? "left-4" : "right-4"
          }`}
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div
          className={`flex items-start justify-between gap-3 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(51,51,51,0.7)]">
              {agentLabel}
            </p>
            <h3 className="mt-1 h-10 overflow-hidden text-sm font-semibold leading-5 text-[var(--brand-secondary)]">
              {property.title}
            </h3>
          </div>
          <p className="shrink-0 text-sm font-semibold text-[var(--brand-secondary)]">
            {property.price}
          </p>
        </div>

        <div
          className={`flex items-center gap-1 text-xs text-[rgba(51,51,51,0.75)] ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="block truncate">{property.location}</span>
        </div>

        <div
          className={`flex items-center justify-between rounded-xl bg-[var(--surface)] px-3 py-2 text-[11px] text-[rgba(51,51,51,0.85)] ${
            isRtl ? "mt-auto flex-row-reverse" : "mt-auto"
          }`}
        >
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

      {/* Invisible overlay link to make the whole card clickable */}
      <Link
        href={`/${language}/property-details/${property.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${property.title}`}
        target="_blank"
        rel="noopener noreferrer"
      />
    </article>
  );
}
