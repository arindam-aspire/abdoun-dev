export interface DetailedProperty {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  location: string;
  /** Optional hosted video URL (e.g. MP4) shown in media gallery */
  video?: string;
  /** Optional YouTube link shown when available */
  youtubeUrl?: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  orientation?: string;
  floor?: string;
  status?: string;
  description: string;
  amenities: string[];
  gallery?: string[];
  /** Agent/broker name for contact modals */
  brokerName?: string;
  propertyType:string
}

export type HeroMediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export interface PropertyStat {
  label: string;
  value: string;
  helper?: string;
}
