import {
  fetchPropertyDetailsById as fetchPropertyDetailsByIdService,
  type PropertyDetailsApiResponse,
} from "@/features/property-search/api/propertySearch.api";

export type { PropertyDetailsApiResponse };

export async function fetchPropertyDetailsById(
  propertyId: number,
): Promise<PropertyDetailsApiResponse> {
  return fetchPropertyDetailsByIdService(propertyId);
}

