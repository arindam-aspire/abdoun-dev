"use client";

import type { LanguageCode } from "@/lib/i18n";
import { homeTranslations } from "@/lib/i18n";
import { MOCK_PROPERTIES, SERVICE_CARD_CONTENT } from "./constants";
import { FeaturedPropertiesSection } from "./FeaturedPropertiesSection";
import { HeroSection } from "./HeroSection";
import { ServicesSection } from "./ServicesSection";

export interface HomeMainProps {
  language: LanguageCode;
}

export function HomeMain({ language }: HomeMainProps) {
  const t = homeTranslations[language];
  const isRtl = language === "ar";

  const heroTranslations = {
    title: t.heroTitle,
    subtitle: t.heroSubtitle,
    tabs: t.heroTabs,
    locationLabel: t.heroLocationLabel,
    locationPlaceholder: t.heroLocationPlaceholder,
    typeLabel: t.heroTypeLabel,
    budgetLabel: t.heroBudgetLabel,
    search: t.heroSearch,
  };

  const featuredTranslations = {
    title: t.featuredTitle,
    subtitle: t.featuredSubtitle,
    viewAll: t.featuredViewAll,
  };

  const servicesTranslations = {
    title: t.servicesTitle,
    subtitle: t.servicesSubtitle,
    description: t.servicesSubtitle,
    cards: [
      { title: t.servicesCards.buying, ...SERVICE_CARD_CONTENT[0] },
      { title: t.servicesCards.selling, ...SERVICE_CARD_CONTENT[1] },
      { title: t.servicesCards.management, ...SERVICE_CARD_CONTENT[2] },
    ],
  };

  return (
    <>
      <HeroSection translations={heroTranslations} isRtl={isRtl} />
      <FeaturedPropertiesSection
        translations={featuredTranslations}
        properties={MOCK_PROPERTIES}
      />
      <ServicesSection translations={servicesTranslations} />
    </>
  );
}
