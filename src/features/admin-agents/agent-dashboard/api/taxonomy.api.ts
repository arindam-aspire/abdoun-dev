import { createHttpClients } from "@/lib/http";

const { publicApi } = createHttpClients();

export type LocationTaxonomyCity = {
  id: number;
  name: string;
  areas: Array<{ id: number; name: string }>;
};

export async function fetchLocationTaxonomy(): Promise<LocationTaxonomyCity[]> {
  const response = await publicApi.get<{ data: LocationTaxonomyCity[] }>(
    "/location-taxonomy",
  );
  return response.data.data ?? [];
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

export async function fetchPropertyTaxonomy(): Promise<PropertyTaxonomyCategory[]> {
  const response = await publicApi.get<{ data: PropertyTaxonomyCategory[] }>(
    "/property-taxonomy",
  );
  return response.data.data ?? [];
}

