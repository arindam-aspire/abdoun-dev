"use client";

import { Bath, BedDouble, CheckCircle2, Maximize2 } from "lucide-react";
import { useLocale } from "next-intl";
import { PropertyCardNew, type PropertyCardNewBadge } from "@/components/ui/PropertyCardNew";
import type { AppLocale } from "@/i18n/routing";
import type { SearchResultListing } from "@/features/property-search/types";

export interface SearchResultPropertyCardProps {
  listing: SearchResultListing;
  translations?: {
    email?: string;
    call?: string;
  };
  detailsBasePath?: string;
}

export function SearchResultPropertyCard({
  listing,
  detailsBasePath = "property-details",
}: SearchResultPropertyCardProps) {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";

  const detailsHref =
    `/${locale}/${detailsBasePath}/${listing.id}` +
    (listing.exclusive || listing.badges?.includes("Exclusive") ? "?exclusive=1" : "");

  const badges: PropertyCardNewBadge[] = [];
  if (listing.exclusive || listing.badges?.includes("Exclusive")) {
    badges.push({ label: "Exclusive", variant: "exclusive" });
  }
  if (listing.badges?.includes("Verified")) {
    badges.push({
      label: (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </>
      ),
      variant: "verified",
      className: "gap-1.5 bg-black/68 text-white",
    });
  }

  return (
    <>
      <PropertyCardNew
        title={listing.title}
        price={listing.price}
        location={listing.location}
        agentLabel={listing.brokerName}
        href={detailsHref}
        propertyId={listing.id}
        images={listing.images}
        imageAlt={listing.title}
        isRtl={isRtl}
        badges={badges}
        metrics={[
          { icon: BedDouble, label: `${listing.beds} Beds` },
          { icon: Bath, label: `${listing.baths} Baths` },
          { icon: Maximize2, label: `${listing.area} sq.ft` },
        ]}
      />
    </>
  );
}
