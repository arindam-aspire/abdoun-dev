"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SearchResultListing } from "@/features/property-search/types";
import { useFavourites } from "@/features/favourites/hooks/useFavourites";
import { FavouritesList } from "@/features/favourites/components/FavouritesList";
import { listFavoritePropertyItems } from "@/features/favourites/api/favourites.api";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;
const PAGE_PARAM = "page";

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const page = searchParams.get(PAGE_PARAM);
  const n = parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function pickLocalizedText(
  value: { en?: string; ar?: string; fr?: string; esp?: string } | null | undefined,
  locale: AppLocale,
): string {
  if (!value) return "";
  if (locale === "ar" && value.ar) return value.ar;
  if (locale === "fr" && value.fr) return value.fr;
  if (locale === "es" && value.esp) return value.esp;
  return value.en ?? value.ar ?? value.fr ?? value.esp ?? "";
}

export type SavedPropertiesViewProps = {
  variant?: "main" | "agent";
};

export function SavedPropertiesView({ variant = "main" }: SavedPropertiesViewProps) {
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const isRtl = locale === "ar";
  const tFav = useTranslations("favourites");
  const tSearch = useTranslations("searchResult");

  const { propertyIds } = useFavourites();
  const currentUser = useAppSelector(selectCurrentUser);
  const hydratedUserId = useAppSelector((state) => state.favourites.hydratedUserId);
  const [apiListings, setApiListings] = useState<SearchResultListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refetchNonce, setRefetchNonce] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoadError(false);
        setIsLoading(true);
        const items = await listFavoritePropertyItems();
        if (!active) return;

        const mapped: SearchResultListing[] = items
          .map((item) => {
            const property = item.property;
            const propertyId =
              typeof item.property_hash === "number"
                ? item.property_hash
                : typeof property?.id === "number"
                  ? property.id
                  : null;

            if (!property || propertyId == null) {
              return null;
            }

            const title = pickLocalizedText(property.title, locale) || "Property";
            const locationText =
              pickLocalizedText(property.location?.address, locale) ||
              [property.areaName, property.city].filter(Boolean).join(", ");
            const images =
              property.media?.images
                ?.map((image) => image.thumb_url ?? image.url ?? "")
                .filter((url): url is string => Boolean(url)) ?? [];

            const mappedListing: SearchResultListing = {
              id: propertyId,
              title,
              price: property.price ?? "",
              status: property.status ?? "buy",
              category: property.category ?? "residential",
              searchPropertyType: property.searchPropertyType ?? undefined,
              city: property.city ?? undefined,
              areaName: property.areaName ?? undefined,
              propertyType: property.propertyType ?? "Property",
              images:
                images.length > 0
                  ? images
                  : property.media?.thumbnail
                    ? [property.media.thumbnail]
                    : [],
              location: locationText || property.city || "N/A",
              beds: property.beds ?? 0,
              baths: property.baths ?? 0,
              area: String(property.area ?? ""),
              highlights: property.highlights ?? undefined,
              badges: property.badges ?? undefined,
              validatedDate: property.validatedDate ?? undefined,
              brokerName: property.brokerName ?? "Abdoun Real Estate",
              brokerLogo: property.brokerLogo ?? undefined,
              owners: property.owners ?? undefined,
              is_exclusive: property.is_exclusive ?? undefined,
            };
            return mappedListing;
          })
          .filter((listing): listing is SearchResultListing => listing != null);

        setApiListings(mapped);
      } catch {
        if (active) {
          setApiListings([]);
          setLoadError(true);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [locale, refetchNonce]);

  const refetch = useCallback(() => {
    setRefetchNonce((n) => n + 1);
  }, []);

  const favouriteListings = useMemo(
    () => {
      const byId = new Map(apiListings.map((listing) => [listing.id, listing]));
      return propertyIds
        .map((id) => byId.get(id))
        .filter((listing): listing is SearchResultListing => listing != null);
    },
    [apiListings, propertyIds],
  );

  const currentPage = getPageFromSearchParams(searchParams);
  const totalItems = favouriteListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const listings = favouriteListings.slice(start, start + PAGE_SIZE);

  const cardTranslations = {
    email: tSearch("email"),
    call: tSearch("call"),
  };
  const isHydratingFavourites =
    Boolean(currentUser?.id) && hydratedUserId !== currentUser?.id;

  const outerClass = cn(
    variant === "main" && "mx-auto container w-full px-4 py-8 md:px-8",
    variant === "agent" && "w-full",
  );
  const outerClassEmpty = cn(
    variant === "main" && "mx-auto container w-full px-4 py-10 md:px-8",
    variant === "agent" && "w-full py-2",
  );

  if (isLoading || isHydratingFavourites) {
    return (
      <div className={outerClass} dir={isRtl ? "rtl" : "ltr"}>
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="mb-3 h-40 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={outerClassEmpty} dir={isRtl ? "rtl" : "ltr"}>
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load data.</p>
          <button type="button" onClick={refetch} className="mt-4 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (favouriteListings.length === 0) {
    return (
      <div className={outerClassEmpty} dir={isRtl ? "rtl" : "ltr"}>
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <EmptyState
          icon={<Heart className="h-8 w-8" strokeWidth={1.5} />}
          title={tFav("emptyTitle")}
          subtitle={tFav("emptySubtitle")}
          actionLabel={tFav("searchButton")}
          actionHref="/search-result"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
    );
  }

  return (
    <div className={outerClass} dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
      </div>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[var(--border-subtle)] md:p-5">
        <FavouritesList
          listings={listings}
          listLabel={tFav("listLabel")}
          compareMode={false}
          compareIds={[]}
          isRtl={isRtl}
          onToggleCompareForId={() => {}}
          isInCompare={() => false}
          addToCompareLabel={tFav("addToCompare")}
          cardTranslations={cardTranslations}
        />

        {totalPages > 1 && (
          <div className="mt-8 border-t border-[var(--border-subtle)] pt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              pageParam={PAGE_PARAM}
              translations={{
                previous: tSearch("paginationPrevious"),
                next: tSearch("paginationNext"),
                page: tSearch("paginationPage"),
                of: tSearch("paginationOf"),
                showing: tSearch("paginationShowing"),
                to: tSearch("paginationTo"),
                results: tSearch("paginationResults"),
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
