"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppLocale } from "@/i18n/routing";
import type { Property } from "./types";
import { FavouriteButton } from "@/components/favourites/FavouriteButton";

export interface PropertyCardProps {
  property: Property;
  agentLabel?: string;
  /** Use "minimal" on property details page for a borderless, soft look */
  variant?: "default" | "minimal";
}

export function PropertyCard({
  property,
  agentLabel = "Abdoun Real Estate",
  variant = "default",
}: PropertyCardProps) {
  const language = useLocale() as AppLocale;
  const isRtl = language === "ar";
  const isMinimal = variant === "minimal";

  return (
    <article
      className={`group relative overflow-hidden bg-white transition ${
        isMinimal
          ? "rounded-lg shadow-[0_2px_12px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          : "rounded-2xl border border-subtle shadow-sm hover:-translate-y-1 hover:shadow-lg"
      } ${isRtl ? "flex h-full flex-col text-right" : "flex h-full flex-col text-left"}`}
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
          <Badge variant="exclusive">{property.badge}</Badge>
        </div>
        <FavouriteButton
          propertyId={property.id}
          className={`absolute top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm hover:bg-white ${
            isMinimal ? "" : "ring-1 ring-subtle"
          } ${isRtl ? "left-4" : "right-4"}`}
          iconClassName="h-4 w-4"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div
          className={`flex items-start justify-between gap-3 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <div>
            <p className="text-size-xs fw-semibold uppercase tracking-[0.16em] text-[rgba(51,51,51,0.7)]">
              {agentLabel}
            </p>
            <h3 className="mt-1 h-10 overflow-hidden text-size-sm fw-semibold leading-5 text-secondary">
              {property.title}
            </h3>
          </div>
          <p className="shrink-0 text-size-sm fw-semibold text-secondary">
            {property.price}
          </p>
        </div>

        <div
          className={`flex items-center gap-1 text-size-xs text-[rgba(51,51,51,0.75)] ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="block truncate">{property.location}</span>
        </div>

        <div
          className={`flex items-center justify-between px-3 py-2 text-size-11 text-[rgba(51,51,51,0.85)] ${
            isMinimal ? "bg-surface/60" : "rounded-xl bg-surface"
          } ${isRtl ? "mt-auto flex-row-reverse" : "mt-auto"}`}
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
        href={`/${language}/property-details/${property.id}${property.badge === "Exclusive" ? "?exclusive=1" : ""}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${property.title}`}
        target="_blank"
        rel="noopener noreferrer"
      />
    </article>
  );
}


