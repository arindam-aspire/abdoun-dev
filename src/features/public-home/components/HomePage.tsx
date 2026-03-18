"use client";

import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { HeroSection } from "@/features/public-home/components/HeroSection";
import { ExclusivePropertiesSection } from "@/features/public-home/components/ExclusivePropertiesSection";
import { AboutPreviewSection } from "@/features/public-home/components/AboutPreviewSection";
import { useExclusiveProperties } from "@/features/public-home/hooks/useExclusiveProperties";

export interface HomePageProps {
  language: AppLocale;
}

/**
 * Public home page: hero, exclusive properties, about preview.
 * Uses useExclusiveProperties for data; same layout and behavior as before.
 */
export function HomePage({ language }: HomePageProps) {
  const t = useTranslations("home");
  const isRtl = language === "ar";
  const {
    items: exclusiveProperties,
    loading: exclusiveLoading,
    error: exclusiveError,
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

  return (
    <>
      <HeroSection translations={heroTranslations} isRtl={isRtl} />
      <ExclusivePropertiesSection
        translations={exclusiveTranslations}
        properties={exclusiveProperties}
        isRtl={isRtl}
        useCarouselOnOverflow
        loading={exclusiveLoading}
        error={exclusiveError}
      />
      <AboutPreviewSection
        title={aboutUsTranslations.title}
        content={aboutUsTranslations.content}
        seeMoreLabel={aboutUsTranslations.seeMore}
        seeMoreHref={`/${language}/about`}
        isRtl={isRtl}
      />
    </>
  );
}
