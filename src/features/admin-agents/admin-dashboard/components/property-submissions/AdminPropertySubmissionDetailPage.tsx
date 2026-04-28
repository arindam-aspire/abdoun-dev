"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  getAdminPropertySubmission,
  type AdminGetSubmissionResult,
} from "@/features/admin-agents/admin-dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { submissionPayloadToDetailedProperty } from "@/features/admin-agents/admin-dashboard/lib/submissionPayloadToDetailedProperty";
import { PropertyDetailsMain } from "@/features/property-details/components/PropertyDetailsMain";
import { PropertyDetailsHero } from "@/features/property-details/components/PropertyDetailsHero";
import { PropertyDetailsTabBar, type PropertyDetailsTabKey } from "@/features/property-details/components/PropertyDetailsTabBar";
import { PropertyHighlights } from "@/features/property-details/components/PropertyHighlights";
import { PropertyOverview } from "@/features/property-details/components/PropertyOverview";
import { PropertyAmenities } from "@/features/property-details/components/PropertyAmenities";
import { PropertyNeighborhood } from "@/features/property-details/components/PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "@/features/property-details/components/PropertyDetailsPriceCard";
import { PropertyInsightsSidebar } from "@/features/property-details/components/PropertyInsightsSidebar";
import { SimilarProperties } from "@/features/property-details/components/SimilarProperties";
import { PropertyVirtualTour } from "@/features/property-details/components/PropertyVirtualTour";
import { PropertyDetailsDocumentsTab, type PropertyDocumentSection } from "@/features/property-details/components/PropertyDetailsDocumentsTab";
import { usePropertyDetailsTabs } from "@/features/property-details/hooks/usePropertyDetailsTabs";
import { useSession } from "@/features/auth/hooks/useSession";

type Props = { submissionId: string };

function payloadTitle(payload: Record<string, unknown>): string {
  const bi = payload.basic_information;
  if (bi && typeof bi === "object" && !Array.isArray(bi)) {
    const t = (bi as Record<string, unknown>).title;
    if (typeof t === "string" && t.trim()) return t;
  }
  return "—";
}

export function AdminPropertySubmissionDetailPage({ submissionId }: Props) {
  const locale = useLocale() as AppLocale;
  const tabPanelRef = useRef<HTMLDivElement | null>(null);
  const isRtl = locale === "ar";
  const { role } = useSession();
  const [data, setData] = useState<AdminGetSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminPropertySubmission(submissionId);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isPrivilegedUser = role === "admin" || role === "agent";
  const canShowLocationTab = isPrivilegedUser;
  const canShowDocumentsTab = isPrivilegedUser;

  const { displayTab, handleTabChange } = usePropertyDetailsTabs({
    canShowLocationTab,
    canShowDocumentsTab,
  });

  const adapted = useMemo(() => {
    if (!data) return null;
    return submissionPayloadToDetailedProperty({
      submissionId: data.submission_id,
      status: data.status,
      payload: data.payload,
      propertyReferenceNumber: null,
      submittedByName: null,
    });
  }, [data]);

  const overview = useMemo(() => {
    const payload = data?.payload ?? {};
    const bi =
      payload.basic_information &&
      typeof payload.basic_information === "object" &&
      !Array.isArray(payload.basic_information)
        ? (payload.basic_information as Record<string, unknown>)
        : null;
    const desc = bi?.description;
    const raw = typeof desc === "string" ? desc.trim() : "";

    const description: string[] = raw
      ? raw
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
      : ["No description has been provided for this submission yet."];

    return {
      title: "Overview",
      description,
      media: {
        video_label: "Watch property video on YouTube",
        platform: "",
        video_link: "",
      },
    };
  }, [data?.payload]);

  const documentSections: PropertyDocumentSection[] = useMemo(() => [], []);

  useEffect(() => {
    const node = tabPanelRef.current;
    if (!node || typeof node.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const enterOffset = isRtl ? -18 : 18;
    node.animate(
      [
        { opacity: 0, transform: `translateX(${enterOffset}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    );
  }, [displayTab, isRtl]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 md:px-8">
        <LoadingScreen
          title="Loading submission"
          description="Please wait while we fetch submission details."
        />
      </div>
    );
  }

  if (error || !data || !adapted) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/admin-dashboard/listings`}
          className="text-sm text-secondary hover:underline"
        >
          ← Back to submissions
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? "Submission not found."}
        </div>
      </div>
    );
  }

  // Best-case: render the exact same page flow as Agent/public property details
  // (this calls `GET /api/v1/properties/{id}` internally and populates all sections).
  if (typeof data.property_hash === "number" && Number.isFinite(data.property_hash)) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/admin-dashboard/listings`}
          className="text-sm text-secondary hover:underline"
        >
          ← Back to listings
        </Link>
        <PropertyDetailsMain language={locale} propertyId={String(data.property_hash)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/admin-dashboard/listings`}
            className="text-sm text-secondary hover:underline"
          >
            ← Back to listings
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal">{payloadTitle(data.payload)}</h1>
          <p className="mt-1 text-xs text-charcoal/60">Submission details</p>
        </div>
        <div className="text-right text-sm">
          <div className="rounded-full bg-charcoal/5 px-3 py-1 text-xs font-medium capitalize text-charcoal">
            {data.status.replace(/_/g, " ")}
          </div>
          <p className="mt-2 text-xs text-charcoal/60">
            Submitted: {data.submitted_at ? new Date(data.submitted_at).toLocaleString() : "—"}
          </p>
          <p className="mt-1 text-xs text-charcoal/60">
            Reviewed: {data.reviewed_at ? new Date(data.reviewed_at).toLocaleString() : "—"}
          </p>
          {data.reviewed_by ? (
            <p className="mt-1 text-xs text-charcoal/60">Reviewed by: {data.reviewed_by}</p>
          ) : null}
          {data.review_reason ? (
            <p className="mt-2 max-w-md text-xs text-amber-900/90">
              Last review note: {data.review_reason}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={`container mx-auto px-4 py-6 md:px-8 md:py-8 relative min-h-screen overflow-x-clip bg-linear-to-b from-surface via-white to-surface text-charcoal ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-112 -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />

        <PropertyDetailsHero property={adapted} isRtl={isRtl} />

        <main className="relative z-10">
          <PropertyDetailsTabBar
            activeTab={displayTab as PropertyDetailsTabKey}
            onTabChange={handleTabChange}
            isRtl={isRtl}
            showLocationTab={canShowLocationTab}
            showDocumentsTab={canShowDocumentsTab}
          />

          <div
            className={`pt-8 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8 ${
              isRtl ? "md:[direction:rtl]" : ""
            }`}
          >
            <section className="space-y-6 md:space-y-7">
              <div key={displayTab} ref={tabPanelRef}>
                {displayTab === "overview" && (
                  <section className="">
                    <PropertyHighlights property={adapted} stats={[]} />
                    <PropertyOverview overview={overview} />
                    <PropertyVirtualTour property={adapted} />
                  </section>
                )}

                {displayTab === "amenities" && (
                  <section className="rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
                    <PropertyAmenities amenities={adapted.amenities} />
                  </section>
                )}

                {displayTab === "location" && (
                  canShowLocationTab ? (
                    <section className="rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
                      <PropertyNeighborhood property={adapted} />
                    </section>
                  ) : (
                    <section className="rounded-2xl border border-subtle bg-white/95 p-5 text-sm text-(--color-charcoal)/70 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
                      Location details are available for exclusive listings.
                    </section>
                  )
                )}

                {displayTab === "documents" && canShowDocumentsTab && (
                  <PropertyDetailsDocumentsTab sections={documentSections} />
                )}
              </div>
            </section>

            <div
              className={`${isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"} self-start md:sticky md:top-[124px]`}
            >
              <PropertyDetailsPriceCard
                price={adapted.price}
                pricePerM2={adapted.pricePerSqm}
                documentVerificationLabel={adapted.documentVerificationStatus}
              />
              <PropertyInsightsSidebar
                listing={{
                  id: adapted.id,
                  title: adapted.title,
                  brokerName: adapted.brokerName ?? "Abdoun Real Estate",
                  agentName: adapted.agent?.name,
                  agentTagline: adapted.agent?.licenseNumber
                    ? `License ${adapted.agent.licenseNumber}`
                    : undefined,
                }}
              />
            </div>
          </div>
        </main>
        <SimilarProperties />
      </div>
    </div>
  );
}
