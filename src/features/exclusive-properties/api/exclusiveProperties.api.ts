/**
 * Exclusive properties feature API. Same endpoints and payloads as propertyService.
 */
import {
  fetchExclusiveProperties,
  type ExclusivePropertiesResult,
} from "@/services/propertyService";

export type { ExclusivePropertiesResult };

/**
 * Fetch exclusive listings (GET /properties/exclusive). Same contract as propertyService.
 */
export async function getExclusiveProperties(
  pageSize = 10,
): Promise<ExclusivePropertiesResult> {
  return fetchExclusiveProperties(pageSize);
}
