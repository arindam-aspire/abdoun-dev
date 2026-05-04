/**
 * Property search feature API module. Public entry for property listing/search HTTP calls.
 * Wraps propertyService without changing endpoints, parameters, or response mapping.
 */
import {
  fetchExclusiveProperties,
  fetchPropertiesByQuery,
  fetchPropertyDetailsById,
  fetchSimilarPropertiesById,
  type ExclusivePropertiesResult,
  type PropertyDetailsApiResponse,
  type PropertySearchResult,
} from "@/features/property-search/api/propertyService";

export type {
  ExclusivePropertiesResult,
  PropertyDetailsApiResponse,
  PropertySearchResult,
};

/** Search listings using the existing querystring contract. */
export async function searchPropertiesByQuery(
  queryString: string,
): Promise<PropertySearchResult> {
  return fetchPropertiesByQuery(queryString);
}

export {
  fetchExclusiveProperties,
  fetchPropertiesByQuery,
  fetchPropertyDetailsById,
  fetchSimilarPropertiesById,
};
