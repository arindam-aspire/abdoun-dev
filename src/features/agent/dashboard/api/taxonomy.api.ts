import { publicApi } from "@/lib/http/clients";
export type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";
export { fetchLocationTaxonomy } from "@/features/location-taxonomy/api/locationTaxonomy.api";

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
