import { publicApi } from "@/lib/http/clients";

export type LocationTaxonomyCity = {
  id: number;
  name: string;
  areas: Array<{ id: number; name: string }>;
};

type LocationTaxonomyPayload = {
  items?: LocationTaxonomyCity[] | null;
  total?: number;
  data?: LocationTaxonomyCity[] | null;
};

function taxonomyCities(payload: LocationTaxonomyPayload): LocationTaxonomyCity[] {
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function fetchLocationTaxonomy(): Promise<LocationTaxonomyCity[]> {
  const response = await publicApi.get<LocationTaxonomyPayload>("/location-taxonomy");
  return taxonomyCities(response.data);
}

export type PropertyTaxonomyType = {
  id: number;
  category_id: number;
  name: string;
  slug?: string | null;
};

export type PropertyTaxonomyCategory = {
  id: number;
  name: string;
  slug?: string | null;
  property_types: PropertyTaxonomyType[];
};

type PropertyTaxonomyPayload = {
  items?: PropertyTaxonomyCategory[] | null;
  total?: number;
  data?: PropertyTaxonomyCategory[] | null;
};

function taxonomyCategories(payload: PropertyTaxonomyPayload): PropertyTaxonomyCategory[] {
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function fetchPropertyTaxonomy(): Promise<PropertyTaxonomyCategory[]> {
  const response = await publicApi.get<PropertyTaxonomyPayload>("/property-taxonomy");
  return taxonomyCategories(response.data);
}

