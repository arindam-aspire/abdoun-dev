"use client";

import { Bath, BedDouble, Maximize2 } from "lucide-react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import type { Property } from "@/features/public-home/components/types";
import { useBackendTranslation } from "@/hooks/useBackendTranslation";
import { PropertyCardNew } from "@/components/ui/PropertyCardNew";

export interface PropertyCardProps {
  property?: Property;
  agentLabel?: string;
  variant?: "default" | "minimal";
  loading?: boolean;
}

export function PropertyCard({
  property,
  agentLabel = "Abdoun Real Estate",
  variant = "default",
  loading = false,
}: PropertyCardProps) {
  const language = useLocale() as AppLocale;
  const { tBackend } = useBackendTranslation();
  const isRtl = language === "ar";
  if (loading || !property) {
    return (
      <PropertyCardNew
        loading
        title=""
        price=""
        location=""
        agentLabel={agentLabel}
        href="#"
        propertyId={0}
        images={[]}
        imageAlt=""
        isRtl={isRtl}
        showImageNavigation={false}
        badges={[]}
        metrics={[]}
        cardClassName={
          variant === "minimal"
            ? "rounded-[22px] border-[#edf1f5] shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)]"
            : undefined
        }
        contentClassName={variant === "minimal" ? "px-5 py-4" : undefined}
        titleClassName={variant === "minimal" ? "text-[1.05rem]" : undefined}
        imageSizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      />
    );
  }

  const title = tBackend(property.title) || "Untitled Property";
  const location = tBackend(property.location) || "Location unavailable";

  return (
    <PropertyCardNew
      title={title}
      price={property.price}
      location={location}
      agentLabel={agentLabel}
      owners={property.owners}
      href={`/${language}/property-details/${property.id}${
        property.badge === "Exclusive" ? "?exclusive=1" : ""
      }`}
      propertyId={property.id}
      images={[property.image]}
      imageAlt={title}
      isRtl={isRtl}
      showImageNavigation={false}
      badges={
        property.badge
          ? [
              {
                label: property.badge,
                variant: property.badge === "Exclusive" ? "exclusive" : "secondary",
              },
            ]
          : []
      }
      metrics={[
        { icon: BedDouble, label: `${property.beds} Beds` },
        { icon: Bath, label: `${property.baths} Baths` },
        { icon: Maximize2, label: `${property.area} sq.ft` },
      ]}
      cardClassName={
        variant === "minimal"
          ? "rounded-[22px] border-[#edf1f5] shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)]"
          : undefined
      }
      contentClassName={variant === "minimal" ? "px-5 py-4" : undefined}
      titleClassName={variant === "minimal" ? "text-[1.05rem]" : undefined}
      imageSizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
    />
  );
}
