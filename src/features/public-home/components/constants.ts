import type { Property } from "@/features/public-home/components/types";
import type { ServiceItem } from "@/features/public-home/components/types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "The Azure Penthouse",
    price: "1,250,000 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Abdoun, Amman",
    beds: 4,
    baths: 5,
    area: "8,500",
  },
  {
    id: 2,
    title: "Sunrise Gardens Villa",
    price: "685,000 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Dabouq, Amman",
    beds: 5,
    baths: 4,
    area: "6,200",
  },
  {
    id: 3,
    title: "Abdoun Skyline Residence",
    price: "2,100,000 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Abdoun, Amman",
    beds: 4,
    baths: 4,
    area: "5,200",
  },
  {
    id: 4,
    title: "Umm Uthaina City Residence",
    price: "980,000 JD",
    badge: "For Sale",
    image:
      "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Umm Uthaina, Amman",
    beds: 3,
    baths: 3,
    area: "2,450",
  },
  {
    id: 5,
    title: "Dair Ghbar Skyline Apartment",
    price: "2,100 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Dair Ghbar, Amman",
    beds: 2,
    baths: 2,
    area: "1,650",
  },
  {
    id: 6,
    title: "Abdali Business Loft",
    price: "3,750 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Abdali, Amman",
    beds: 2,
    baths: 2,
    area: "1,900",
  },
  {
    id: 7,
    title: "Khalda Family Villa",
    price: "1,350,000 JD",
    badge: "Exclusive",
    image:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200",
    location: "Khalda, Amman",
    beds: 5,
    baths: 4,
    area: "3,800",
  },
];

/** Exclusive listings (premium, agency-only). Shown on home "Exclusive" section; link to details/1 and details/3. */
export const MOCK_EXCLUSIVE_PROPERTIES: Property[] = MOCK_PROPERTIES.filter(
  (p) => p.badge === "Exclusive",
);

/** Newly listed properties. */
export const MOCK_LATEST_PROPERTIES: Property[] = MOCK_PROPERTIES.slice(2, 6);

/** Static copy for service cards (descriptions/cta). Titles come from i18n. */
export const SERVICE_CARD_CONTENT: ServiceItem[] = [
  {
    id: "property-sales",
    title: "Property Sales",
    description:
      "Access exclusive listings in prime Amman neighborhoods with personalized guidance from local experts.",
    cta: "Learn more →",
    icon: "home",
  },
  {
    id: "property-marketing",
    title: "Property Sales",
    description:
      "Maximize your property value with expert staging, marketing, and a curated buyer network.",
    cta: "Learn more →",
    icon: "trending-up",
  },
  {
    id: "property-management",
    title: "Property Sales",
    description:
      "End-to-end management for your villas and apartments, from tenant screening to maintenance.",
    cta: "Learn more →",
    icon: "building",
  },
];

