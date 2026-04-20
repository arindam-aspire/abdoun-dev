"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResultListing } from "@/features/property-search/types";
import { useFavourites } from "@/features/favourites/hooks/useFavourites";
import { FavouritesList } from "@/features/favourites/components/FavouritesList";
import { listFavoritePropertyItems } from "@/features/favourites/api/favourites.api";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";

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

function FavouritesPageContent() {
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

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
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
        if (active) setApiListings([]);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [locale]);

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
  const skeletonCount = Math.max(1, Math.min(propertyIds.length || 0, PAGE_SIZE));
  const isHydratingFavourites =
    Boolean(currentUser?.id) && hydratedUserId !== currentUser?.id;

  if (isLoading || isHydratingFavourites) {
    return (
      <div
        className="mx-auto container w-full px-4 py-8 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`favourite-skeleton-${index}`}
              className="space-y-3 rounded-xl border border-[#e7ebf1] p-3"
            >
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favouriteListings.length === 0) {
    return (
      <div
        className="mx-auto container w-full px-4 py-10 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
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
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
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

export default function FavouritesPage() {
  return (
    <AuthenticatedRouteGuard>
      <FavouritesPageContent />
    </AuthenticatedRouteGuard>
  );
}
