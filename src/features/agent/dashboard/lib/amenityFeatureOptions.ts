/** Feature IDs must exist in the backend `features` table. Adjust to match your API seed. */
export const AMENITY_FEATURE_OPTIONS: { id: number; label: string }[] = [
  { id: 1, label: "Alarm System" },
  { id: 2, label: "Swimming Pool" },
  { id: 3, label: "Concierge/Security" },
  { id: 4, label: "Pets Allowed" },
  { id: 5, label: "Double Glazing" },
  { id: 6, label: "Underfloor Heating" },
  { id: 7, label: "Balcony" },
];

export function labelForAmenityFeatureId(id: number): string {
  return AMENITY_FEATURE_OPTIONS.find((a) => a.id === id)?.label ?? `Feature #${id}`;
}
