/**
 * UI-facing city + area names shape (stable keys for lists, URL params use names).
 * Matches the former `jordanCities` contract for search/hero forms.
 */
export type JordanCityWithAreas = {
  id: string;
  name: string;
  areas: string[];
};
