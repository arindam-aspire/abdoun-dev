"use client";

import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import {
  MOCK_EXCLUSIVE_PROPERTIES,
  MOCK_LATEST_PROPERTIES,
  MOCK_PROPERTIES,
  SERVICE_CARD_CONTENT,
} from "./constants";
import { AboutUsSection } from "./AboutUsSection";
import { FeaturedPropertiesSection } from "./FeaturedPropertiesSection";
import { HeroSection } from "./HeroSection";
import { ServicesSection } from "./ServicesSection";

export interface HomeMainProps {
  language: AppLocale;
}

export function HomeMain({ language }: HomeMainProps) {
  const t = useTranslations("home");
  const isRtl = language === "ar";

  const heroTranslations = {
    title: t("heroTitle"),
    subtitle: t("heroSubtitle"),
    tabs: {
      buy: t("heroTabs.buy"),
      rent: t("heroTabs.rent"),
    },
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

  const featuredTranslations = {
    title: t("featuredTitle"),
    subtitle: t("featuredSubtitle"),
    viewAll: t("featuredViewAll"),
  };

  const exclusiveTranslations = {
    title: t("exclusiveTitle"),
    subtitle: t("exclusiveSubtitle"),
    viewAll: t("exclusiveViewAll"),
    viewAllHref: `/${language}/search-result?exclusive=1`,
  };

  const latestTranslations = {
    title: t("latestTitle"),
    subtitle: t("latestSubtitle"),
    viewAll: t("latestViewAll"),
  };

  const aboutUsTranslations = {
    title: t("aboutUsTitle"),
    content: t("aboutUsContent"),
    seeMore: t("aboutUsSeeMore"),
  };

  const servicesTranslations = {
    title: t("servicesTitle"),
    subtitle: t("servicesSubtitle"),
    description: t("servicesDescription"),
    cards: [
      { title: t("servicesCards.buying"), ...SERVICE_CARD_CONTENT[0] },
      { title: t("servicesCards.selling"), ...SERVICE_CARD_CONTENT[1] },
      { title: t("servicesCards.management"), ...SERVICE_CARD_CONTENT[2] },
    ],
  };

  return (
    <>
      <HeroSection translations={heroTranslations} isRtl={isRtl} />
      <FeaturedPropertiesSection
        translations={exclusiveTranslations}
        properties={MOCK_EXCLUSIVE_PROPERTIES}
        isRtl={isRtl}
        useCarouselOnOverflow
      />
      <AboutUsSection
        title={aboutUsTranslations.title}
        content={aboutUsTranslations.content}
        seeMoreLabel={aboutUsTranslations.seeMore}
        seeMoreHref={`/${language}/about`}
        isRtl={isRtl}
      />
    </>
  );
}
