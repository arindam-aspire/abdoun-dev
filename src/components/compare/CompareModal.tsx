"use client";

import Image from "next/image";
import Link from "next/link";
import { X, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import type { SearchResultListing } from "@/components/search-result/types";
import { cn } from "@/lib/cn";

export interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  listings: SearchResultListing[];
  isRtl?: boolean;
}

const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800";

export function CompareModal({
  open,
  onClose,
  listings,
  isRtl = false,
}: CompareModalProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("compare");
  const tSearch = useTranslations("searchResult");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-white px-4 py-3 shadow-sm md:px-6",
          isRtl && "flex-row-reverse",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <h1
          id="compare-modal-title"
          className="text-lg font-semibold text-[var(--color-charcoal)] md:text-xl"
        >
          {t("title")}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-charcoal)]/70 hover:bg-[var(--surface)] hover:text-[var(--color-charcoal)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[600px] table-fixed border-collapse text-sm"
              role="grid"
              aria-label="Property comparison"
              style={{
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "15%" }} />
                {listings.map((_, i) => (
                  <col key={i} style={{ width: `${85 / listings.length}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    className={cn(
                      "border-b border-[var(--border-subtle)] bg-[var(--surface)]/50 p-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-charcoal)]/80",
                      isRtl && "text-right",
                    )}
                  >
                    {t("attribute")}
                  </th>
                  {listings.map((listing) => (
                    <th
                      key={listing.id}
                      className={cn(
                        "border-b border-[var(--border-subtle)] p-0 align-top",
                        isRtl && "text-right",
                      )}
                    >
                      <div className="flex flex-col p-3">
                        <Link
                          href={`/${locale}/property-details/${listing.id}`}
                          className="relative block w-full overflow-hidden rounded-lg bg-[var(--surface)]"
                          style={{ aspectRatio: "6/4" }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={listing.images?.[0] ?? DEFAULT_IMAGE}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 280px"
                          />
                        </Link>
                        <p className="mt-2 font-semibold text-[var(--color-charcoal)] line-clamp-2">
                          {listing.title}
                        </p>
                        <p className="mt-0.5 text-base font-bold text-[var(--brand-secondary)]">
                          {listing.price}
                        </p>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1 text-xs text-[var(--color-charcoal)]/75",
                            isRtl && "flex-row-reverse",
                          )}
                        >
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                          <span className="truncate">{listing.location}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label={tSearch("priceLabel")}
                  values={listings.map((l) => l.price)}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("location")}
                  values={listings.map((l) => l.location)}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("propertyType")}
                  values={listings.map((l) => l.propertyType)}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("bedrooms")}
                  values={listings.map((l) => (l.beds > 0 ? String(l.beds) : "—"))}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("bathrooms")}
                  values={listings.map((l) => String(l.baths))}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("area")}
                  values={listings.map((l) => (l.acres ? `${l.area} sqft (${l.acres} ac)` : `${l.area} sqft`))}
                  isRtl={isRtl}
                />
                <ComparisonRow
                  label={t("broker")}
                  values={listings.map((l) => l.brokerName)}
                  isRtl={isRtl}
                />
                {listings.some((l) => l.highlights) && (
                  <ComparisonRow
                    label={t("highlights")}
                    values={listings.map((l) => l.highlights ?? "—")}
                    isRtl={isRtl}
                    clamp
                  />
                )}
                {/* View Details row – same column structure as above */}
                <tr>
                  <td
                    className={cn(
                      "border-b border-[var(--border-subtle)] bg-[var(--surface)]/30 p-3 text-xs font-medium text-[var(--color-charcoal)]/80",
                      isRtl && "text-right",
                    )}
                  >
                    {t("viewDetails")}
                  </td>
                  {listings.map((listing) => (
                    <td
                      key={listing.id}
                      className={cn(
                        "border-b border-[var(--border-subtle)] p-3",
                        isRtl && "text-right",
                      )}
                    >
                      <Link
                        href={`/${locale}/property-details/${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 w-full min-w-0"
                      >
                        {t("viewDetails")}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  values,
  isRtl,
  clamp = false,
}: {
  label: string;
  values: string[];
  isRtl: boolean;
  clamp?: boolean;
}) {
  return (
    <tr>
      <td
        className={cn(
          "border-b border-[var(--border-subtle)] bg-[var(--surface)]/30 p-3 text-xs font-medium text-[var(--color-charcoal)]/80",
          isRtl && "text-right",
        )}
      >
        {label}
      </td>
      {values.map((value, i) => (
        <td
          key={i}
          className={cn(
            "border-b border-[var(--border-subtle)] p-3 text-[var(--color-charcoal)]",
            clamp && "max-w-[200px]",
            isRtl && "text-right",
          )}
        >
          <span className={clamp ? "line-clamp-2 block" : undefined}>
            {value || "—"}
          </span>
        </td>
      ))}
    </tr>
  );
}
