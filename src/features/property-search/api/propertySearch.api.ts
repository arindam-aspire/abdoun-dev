/**
 * Property search feature API module. Wraps propertyService without changing
 * endpoints, parameters, or response mapping.
 */
import {
  fetchPropertiesByQuery,
  type PropertySearchResult,
} from "@/services/propertyService";

export type { PropertySearchResult };

/** Search listings using the existing querystring contract. */
export async function searchPropertiesByQuery(
  queryString: string,
): Promise<PropertySearchResult> {
  return fetchPropertiesByQuery(queryString);
}

