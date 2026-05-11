import { publicApi } from "@/lib/http/clients";

export type LocationTaxonomyArea = { id: number; name: string };

export type LocationTaxonomyCity = {
  id: number;
  name: string;
  areas: LocationTaxonomyArea[];
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

/** GET /location-taxonomy (base URL should include `/api/v1`). */
export async function fetchLocationTaxonomy(): Promise<LocationTaxonomyCity[]> {
  const response = await publicApi.get<LocationTaxonomyPayload>("/location-taxonomy");
  return taxonomyCities(response.data);
}
