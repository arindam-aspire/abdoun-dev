"use client";

import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { HeroSection } from "@/features/public-home/components/HeroSection";
import { ExclusivePropertiesSection } from "@/features/public-home/components/ExclusivePropertiesSection";
import { AboutPreviewSection } from "@/features/public-home/components/AboutPreviewSection";
import { ServicesSection } from "@/features/public-home/components/ServicesSection";
import { useExclusiveProperties } from "@/features/public-home/hooks/useExclusiveProperties";
import { SERVICE_CARD_CONTENT } from "@/features/public-home/components/constants";
import { ServiceCardIcon, ServicesTranslations } from "./types";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  cta: string;
  icon?: ServiceCardIcon;
}

export interface HomePageProps {
  language: AppLocale;
}

/**
 * Public home page: hero, exclusive properties, about preview.
 * Uses useExclusiveProperties for data; same layout and behavior as before.
 */
export function HomePage({ language }: HomePageProps) {
  const t = useTranslations("home");
  const tAboutPage = useTranslations("aboutUsPage");
  const tOurServices = useTranslations("OurServices");
  const isRtl = language === "ar";
  const {
    items: exclusiveProperties,
    loading: exclusiveLoading,
    error: exclusiveError,
    status: exclusiveStatus,
  } = useExclusiveProperties();

  const heroTranslations = {
    title: t("heroTitle"),
    subtitle: t("heroSubtitle"),
    tabs: { buy: t("heroTabs.buy"), rent: t("heroTabs.rent") },
    categoryTabs: {
      commercial: t("heroCategoryTabs.commercial"),
      realEstate: t("heroCategoryTabs.realEstate"),
      land: t("heroCategoryTabs.land"),
    },
    cityLabel: t("heroCityLabel"),
    cityPlaceholder: t("heroCityPlaceholder"),
    areaLabel: t("heroAreaLabel"),
    areaPlaceholder: t("heroAreaPlaceholder"),
    typeLabel: t("heroTypeLabel"),
    budgetLabel: t("heroBudgetLabel"),
    budgetYearlyMinLabel: t("heroBudgetYearlyMinLabel"),
    budgetYearlyMaxLabel: t("heroBudgetYearlyMaxLabel"),
    search: t("heroSearch"),
    resetSearch: t("heroResetSearch"),
  };

  const exclusiveTranslations = {
    title: t("exclusiveTitle"),
    subtitle: t("exclusiveSubtitle"),
    viewAll: t("exclusiveViewAll"),
    viewAllHref: `/${language}/search-result?exclusive=1&status=buy&category=residential`,
  };

  const aboutUsTranslations = {
    title: t("aboutUsTitle"),
    content: t("aboutUsContent"),
    seeMore: t("aboutUsSeeMore"),
  };
  const serviceSection: ServicesTranslations = {
    title: tOurServices("title"),
    subtitle: tOurServices("subtitle"),
    cards: [
      {
        id: "real-estate-brokerage",
        title: tOurServices("items.realEstateBrokerage.title"),
        description: tOurServices("items.realEstateBrokerage.description"),
        cta: "",
        icon: "home",
      },
      {
        id: "property-appraisal",
        title: tOurServices("items.propertyAppraisal.title"),
        description: tOurServices("items.propertyAppraisal.description"),
        cta: "",
        icon: "trending-up",
      },
      {
        id: "property-transfer",
        title: tOurServices("items.propertyTransfer.title"),
        description: tOurServices("items.propertyTransfer.description"),
        cta: "",
        icon: "building",
      },
      {
        id: "property-management",
        title: tOurServices("items.propertyManagement.title"),
        description: tOurServices("items.propertyManagement.description"),
        cta: "",
        icon: "building",
      },
      {
        id: "relocation",
        title: tOurServices("items.relocation.title"),
        description: tOurServices("items.relocation.description"),
        cta: "",
        icon: "home",
      },
    ],
  };

  return (
    <>
      <HeroSection translations={heroTranslations} isRtl={isRtl} />
      <AboutPreviewSection
        title={aboutUsTranslations.title}
        subtitle="Trusted Real Estate Partner"
        content={aboutUsTranslations.content}
        stats={[
          { value: "15+", label: tAboutPage("stats.yearsExperience") },
          { value: "500+", label: tAboutPage("stats.propertiesSold") },
          { value: "98%", label: "Client Satisfaction" },
        ]}
        imageSrc="/about_us.png"
        imageAlt={aboutUsTranslations.title}
        seeMoreLabel="View More"
        seeMoreHref={`/${language}/about`}
        isRtl={isRtl}
      />
      <ExclusivePropertiesSection
        translations={exclusiveTranslations}
        properties={exclusiveProperties}
        isRtl={isRtl}
        useCarouselOnOverflow
        loading={exclusiveLoading}
        error={exclusiveError}
        status={exclusiveStatus}
      />
      <ServicesSection
        translations={serviceSection}
        ctaLabel="View More"
        ctaHref={`/${language}/our-services`}
        isRtl={isRtl}
      />
    </>
  );
}
