export interface DetailedProperty {
  media?: any;
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  location: string;
  lat?: number;
  lng?: number;
  /** Optional hosted video URL (e.g. MP4) shown in media gallery */
  video?: string;
  /** Optional YouTube link shown when available */
  youtubeUrl?: string;
  /** Optional virtual tour URL (YouTube, 360, Matterport, etc.) */
  virtualTourUrl?: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  orientation?: string;
  floor?: string;
  status?: string;
  propertyType?: string;
  description: string;
  amenities: string[];
  gallery?: string[];
  /** Agent/broker name for contact modals */
  brokerName?: string;
  /** When API returns agent; used on listing page sidebar */
  agent?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    photo?: string | null;
    licenseNumber?: string | null;
  };
  /** Pre-formatted e.g. "250 JOD" for sidebar */
  pricePerSqm?: string;
  documentVerificationStatus?: "Ready" | "Pending" | string;
  latitude?: number;
  longitude?: number;
}

export type HeroMediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export interface PropertyStat {
  label: string;
  value: string;
  description?: string;
}
