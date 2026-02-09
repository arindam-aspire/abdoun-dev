export interface Property {
  id: number;
  title: string;
  price: string;
  badge: string;
  image: string;
  location: string;
  beds: number;
  baths: number;
  area: string;
}

export type HeroTabKey = "buy" | "rent" | "sell";

export interface HeroTranslations {
  title: string;
  subtitle: string;
  tabs: { buy: string; rent: string; sell: string };
  locationLabel: string;
  locationPlaceholder: string;
  typeLabel: string;
  budgetLabel: string;
  search: string;
}

export interface FeaturedTranslations {
  title: string;
  subtitle: string;
  viewAll: string;
}

export type ServiceCardIcon = "home" | "trending-up" | "building";

export interface ServiceItem {
  title: string;
  description: string;
  cta: string;
  icon?: ServiceCardIcon;
}

export interface ServicesTranslations {
  title: string;
  subtitle: string;
  description: string;
  cards: ServiceItem[];
}
