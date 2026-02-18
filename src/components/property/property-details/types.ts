export interface DetailedProperty {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  location: string;
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
}

export interface PropertyStat {
  label: string;
  value: string;
  helper?: string;
}
