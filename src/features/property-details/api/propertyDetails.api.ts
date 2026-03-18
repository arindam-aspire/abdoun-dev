import {
  fetchPropertyDetailsById as fetchPropertyDetailsByIdService,
  type PropertyDetailsApiResponse,
} from "@/services/propertyService";

export type { PropertyDetailsApiResponse };

export async function fetchPropertyDetailsById(
  propertyId: number,
): Promise<PropertyDetailsApiResponse> {
  return fetchPropertyDetailsByIdService(propertyId);
}

