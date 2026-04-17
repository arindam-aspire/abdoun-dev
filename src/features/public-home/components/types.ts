export type LocalizedField = string | Record<string, string>;

export interface Property {
  id: number;
  title: LocalizedField;
  price: string;
  badge: string;
  image: string;
  location: LocalizedField;
  beds: number;
  baths: number;
  area: string;
  owners?: Array<{
    owner_id?: string;
    full_name?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  }>;
}

export type HeroTabKey = "buy" | "rent";

export interface HeroTranslations {
  title: string;
  subtitle: string;
  tabs: { buy: string; rent: string };
  categoryTabs: { commercial: string; realEstate: string; land: string };
  cityLabel: string;
  cityPlaceholder: string;
  areaLabel: string;
  areaPlaceholder: string;
  typeLabel: string;
  budgetLabel: string;
  budgetYearlyMinLabel: string;
  budgetYearlyMaxLabel: string;
  search: string;
  resetSearch: string;
}

export interface FeaturedTranslations {
  title: string;
  subtitle: string;
  viewAll: string;
  /** If set, "View all" is a link to this href (e.g. search results). */
  viewAllHref?: string;
}

export type ServiceCardIcon = "home" | "trending-up" | "building";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  cta: string;
  icon?: ServiceCardIcon;
}

export interface ServicesTranslations {
  title: string;
  subtitle?: string;
  description?: string;
  cards: ServiceItem[];
}

