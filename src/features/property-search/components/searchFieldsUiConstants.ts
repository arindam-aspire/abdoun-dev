export const dropdownPanelClass =
  "min-w-48 rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5";

/** Same as dropdownPanelClass but matches trigger width and scrolls when many options */
export const advancedDropdownPanelClass =
  "w-full rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5 max-h-56 overflow-y-auto";

export const PROPERTY_TYPE_PLACEHOLDER = "Select type";

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export const fromCamelCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();

export const BATH_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const ROOM_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const PARKING_OPTIONS = ["", "0", "1", "2", "3", "4", "5"];
export const FLOOR_OPTIONS = [
  "",
  "ground",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "penthouse",
];
export const PROPERTY_AGE_OPTIONS = ["", "new", "1-5", "5-10", "10-20", "20+"];

export const RESIDENTIAL_FLOOR_LEVEL_TYPES = new Set(["Apartments", "Buildings"]);
export const COMMERCIAL_FLOOR_LEVEL_TYPES = new Set(["Buildings", "Offices"]);
export const RESIDENTIAL_FURNITURE_TYPES = new Set(["Apartments", "Villas"]);
export const RESIDENTIAL_BALCONY_TYPES = new Set(["Apartments"]);
export const RESIDENTIAL_CLOSET_TYPES = new Set(["Apartments", "Villas"]);
export const RESIDENTIAL_GARDEN_TYPES = new Set(["Villas", "Farms"]);
export const RESIDENTIAL_HOME_AUTOMATION_TYPES = new Set(["Apartments", "Villas"]);
export const RESIDENTIAL_GYM_ACCESS_TYPES = new Set(["Apartments"]);
export const COMMERCIAL_LOADING_ACCESS_TYPES = new Set(["Warehouses"]);
export const COMMERCIAL_DISPLAY_FRONTAGE_TYPES = new Set(["Shops", "Showrooms"]);
export const COMMERCIAL_AC_TYPES = new Set([
  "Offices",
  "Ready Businesses",
  "Shops",
  "Showrooms",
]);
export const COMMERCIAL_STORAGE_AREA_TYPES = new Set(["Warehouses"]);
export const LAND_UTILITIES_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
  "Residential Lands",
]);
export const LAND_ZONED_USE_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
]);
export const LAND_WATER_SOURCE_TYPES = new Set(["Agricultural Lands"]);
export const LAND_ELECTRICITY_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
  "Residential Lands",
]);
