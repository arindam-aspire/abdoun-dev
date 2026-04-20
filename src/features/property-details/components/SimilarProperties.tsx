"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/features/public-home/components/types";
import { PropertyCard } from "@/features/public-home/components/PropertyCard";
import type { SearchResultListing } from "@/features/property-search/types";
import { fetchSimilarPropertiesById } from "@/services/propertyService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop";

function toPropertyCard(item: SearchResultListing): Property {
  return {
    id: item.id,
    title: item.title || "Untitled Property",
    price: item.price || "Price on request",
    badge: item.badges?.[0] ?? "For Sale",
    image: item.images?.[0] || FALLBACK_IMAGE,
    location: item.location || "Location unavailable",
    beds: item.beds ?? 0,
    baths: item.baths ?? 0,
    area: item.area || "N/A",
  };
}

export function SimilarProperties() {
  const params = useParams<{ id?: string | string[] }>();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [items, setItems] = useState<SearchResultListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const routeId = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === "string" && value.trim().length > 0 ? value : null;
  }, [params]);

  const similarProperties = useMemo(
    () => (items ?? []).map(toPropertyCard),
    [items],
  );
  const invalidRouteId = !routeId;
  const loading = !invalidRouteId && items == null && !error;
  const shouldUseCarousel = similarProperties.length > 4;

  useEffect(() => {
    if (!shouldUseCarousel) return;

    const node = scrollRef.current;
    if (!node) return;

    const updateButtons = () => {
      const firstCard = node.firstElementChild as HTMLElement | null;
      const lastCard = node.lastElementChild as HTMLElement | null;

      if (!firstCard || !lastCard) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      const containerRect = node.getBoundingClientRect();
      const firstRect = firstCard.getBoundingClientRect();
      const lastRect = lastCard.getBoundingClientRect();
      const threshold = 4;

      if (isRtl) {
        setCanScrollPrev(firstRect.right > containerRect.right + threshold);
        setCanScrollNext(lastRect.left < containerRect.left - threshold);
      } else {
        setCanScrollPrev(firstRect.left < containerRect.left - threshold);
        setCanScrollNext(lastRect.right > containerRect.right + threshold);
      }
    };

    updateButtons();
    node.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      node.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [isRtl, shouldUseCarousel, similarProperties.length]);

  const scrollByPage = (direction: "prev" | "next") => {
    const node = scrollRef.current;
    if (!node) return;

    const cards = Array.from(node.children) as HTMLElement[];
    if (cards.length === 0) return;

    const containerRect = node.getBoundingClientRect();
    const threshold = 4;

    let target: HTMLElement | null = null;

    if (isRtl) {
      if (direction === "next") {
        for (let i = cards.length - 1; i >= 0; i -= 1) {
          if (
            cards[i].getBoundingClientRect().left <
            containerRect.left - threshold
          ) {
            target = cards[i];
            break;
          }
        }
      } else {
        for (let i = 0; i < cards.length; i += 1) {
          if (
            cards[i].getBoundingClientRect().right >
            containerRect.right + threshold
          ) {
            target = cards[i];
            break;
          }
        }
      }
    } else if (direction === "next") {
      for (let i = 0; i < cards.length; i += 1) {
        if (
          cards[i].getBoundingClientRect().right >
          containerRect.right + threshold
        ) {
          target = cards[i];
          break;
        }
      }
    } else {
      for (let i = cards.length - 1; i >= 0; i -= 1) {
        if (
          cards[i].getBoundingClientRect().left <
          containerRect.left - threshold
        ) {
          target = cards[i];
          break;
        }
      }
    }

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      return;
    }

    const fallbackAmount = node.clientWidth * 0.9;
    node.scrollBy({
      left: direction === "next" ? fallbackAmount : -fallbackAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!routeId) {
      return;
    }

    let mounted = true;

    void fetchSimilarPropertiesById(routeId)
      .then((data) => {
        if (!mounted) return;
        setError(null);
        setItems(data.filter((item) => String(item.id) !== routeId));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load similar properties.",
        );
        setItems([]);
      });

    return () => {
      mounted = false;
    };
  }, [routeId]);

  const hasSimilarProperties = similarProperties.length > 4;
  const viewMoreHref = useMemo(() => {
    const query = new URLSearchParams({
      status: "buy",
      category: "residential",
    });

    if (routeId) {
      query.set("similar_to", routeId);
    }

    const exclusiveParam = searchParams.get("exclusive");
    if (exclusiveParam && exclusiveParam.trim().length > 0) {
      query.set("exclusive", exclusiveParam);
    }

    return `/${locale}/search-result?${query.toString()}`;
  }, [locale, routeId, searchParams]);

  return (
    <section
      className="bg-white container mx-auto mt-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={`flex items-center justify-between gap-2 mb-8`}
      >
        <div className="text-xl font-bold tracking-tight text-[#2843a2] md:text-3xl">
          Similar Properties
        </div>
        {hasSimilarProperties && routeId && (
          <Link
            href={viewMoreHref}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#355777] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            View More
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <PropertyCard key={`similar-property-skeleton-${index}`} loading />
          ))}
        </div>
      ) : shouldUseCarousel ? (
        <div className="relative">
          {canScrollPrev && (
            <button
              type="button"
              aria-label="Previous properties"
              onClick={() => scrollByPage("prev")}
              className={`cursor-pointer absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:bg-slate-50 lg:inline-flex ${
                isRtl ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
              }`}
            >
              {isRtl ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
          {canScrollNext && (
            <button
              type="button"
              aria-label="Next properties"
              onClick={() => scrollByPage("next")}
              className={`cursor-pointer absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:bg-white lg:inline-flex ${
                isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
              }`}
            >
              {isRtl ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:h-0"
          >
            {similarProperties.map((property) => (
              <div
                key={property.id}
                className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[62%] lg:basis-[calc((100%-4.5rem)/4.2)]"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {similarProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {!loading && (invalidRouteId || similarProperties.length === 0) && (
        <p className={`mt-4 text-sm ${error ? "text-red-600" : "text-zinc-500"} ${isRtl ? "text-right" : "text-left"}`}>
          {invalidRouteId
            ? "Invalid property id."
            : (error ?? "No similar properties found.")}
        </p>
      )}
    </section>
  );
}
