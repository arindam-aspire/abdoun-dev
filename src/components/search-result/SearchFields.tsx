"use client";

import { BudgetRangeInputs } from "@/features/public-home/components/BudgetRangeInputs";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { cn } from "@/lib/cn";
import {
  ChevronDown,
  CircleMinus,
  MoreHorizontal,
  CirclePlus,
  BookmarkPlus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { CategoryKey, SearchFieldsProps, StatusTabKey } from "@/features/property-search/types";
import { routing } from "@/i18n/routing";
import {
  getAreasByCityName,
  JORDAN_CITIES_WITH_AREAS,
} from "@/lib/mocks/jordanCities";
import {
  CATEGORY_OPTIONS,
  CATEGORY_TO_PROPERTY_TYPES,
  STATUS_TABS,
} from "@/features/property-search/types";
import { useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { AuthPopup } from "@/features/auth/components/modals/AuthPopup";
import { SaveSearchModal } from "@/features/saved-searches/components/modals/SaveSearchModal";

export type { SearchFieldsProps, SearchFieldsTranslations } from "@/features/property-search/types";

const dropdownPanelClass =
  "min-w-48 rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5";

/** Same as dropdownPanelClass but matches trigger width and scrolls when many options */
const advancedDropdownPanelClass =
  "w-full rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5 max-h-56 overflow-y-auto";
const PROPERTY_TYPE_PLACEHOLDER = "Select type";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const BATH_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const ROOM_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const PARKING_OPTIONS = ["", "0", "1", "2", "3", "4", "5"];
const FLOOR_OPTIONS = [
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
const PROPERTY_AGE_OPTIONS = ["", "new", "1-5", "5-10", "10-20", "20+"];

const RESIDENTIAL_FLOOR_LEVEL_TYPES = new Set(["Apartments", "Buildings"]);
const COMMERCIAL_FLOOR_LEVEL_TYPES = new Set(["Buildings", "Offices"]);
const RESIDENTIAL_FURNITURE_TYPES = new Set(["Apartments", "Villas"]);
const RESIDENTIAL_BALCONY_TYPES = new Set(["Apartments"]);
const RESIDENTIAL_CLOSET_TYPES = new Set(["Apartments", "Villas"]);
const RESIDENTIAL_GARDEN_TYPES = new Set(["Villas", "Farms"]);
const RESIDENTIAL_HOME_AUTOMATION_TYPES = new Set(["Apartments", "Villas"]);
const RESIDENTIAL_GYM_ACCESS_TYPES = new Set(["Apartments"]);
const COMMERCIAL_LOADING_ACCESS_TYPES = new Set(["Warehouses"]);
const COMMERCIAL_DISPLAY_FRONTAGE_TYPES = new Set(["Shops", "Showrooms"]);
const COMMERCIAL_AC_TYPES = new Set([
  "Offices",
  "Ready Businesses",
  "Shops",
  "Showrooms",
]);
const COMMERCIAL_STORAGE_AREA_TYPES = new Set(["Warehouses"]);
const LAND_UTILITIES_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
  "Residential Lands",
]);
const LAND_ZONED_USE_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
]);
const LAND_WATER_SOURCE_TYPES = new Set(["Agricultural Lands"]);
const LAND_ELECTRICITY_TYPES = new Set([
  "Commercial Lands",
  "Industrial Lands",
  "Mixed Use Lands",
  "Residential Lands",
]);

export function SearchFields({
  translations: t,
  isRtl: isRtlProp,
  trailingAction,
}: SearchFieldsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segment = pathname?.replace(/^\/+/, "").split("/")[0] ?? "";
  const isRtl =
    (routing.locales.includes(segment as (typeof routing.locales)[number])
      ? segment
      : routing.defaultLocale) === "ar" ||
    (segment === "" && isRtlProp);

  const getInitialStatus = (): StatusTabKey => {
    const param = searchParams.get("status");
    if (param === "rent" || param === "buy") {
      return param;
    }
    return "buy";
  };

  const getInitialCategory = (): CategoryKey => {
    const param = searchParams.get("category");
    if (param === "commercial" || param === "residential") {
      return param;
    }
    if (param === "lands") {
      return "land";
    }
    return "residential";
  };

  const getInitialPropertyType = (categoryKey: CategoryKey): string => {
    const typeParam = searchParams.get("type");
    const options = CATEGORY_TO_PROPERTY_TYPES[categoryKey];
    if (typeParam) {
      const normalized = typeParam.toLowerCase();
      const match = options.find((label) => slugify(label) === normalized);
      if (match) return match;
    }
    return "";
  };

  const getInitialCity = (): string => {
    const param = searchParams.get("city");
    if (!param) return "";
    const found = JORDAN_CITIES_WITH_AREAS.find(
      (c) => c.name.toLowerCase() === param.trim().toLowerCase(),
    );
    return found ? found.name : "";
  };

  const getInitialAreas = (): string[] => {
    const locationsParam = searchParams.get("locations");
    if (!locationsParam) return [];
    const initialCity = getInitialCity();
    if (!initialCity) return [];
    const cityAreas = getAreasByCityName(initialCity);
    const parts = locationsParam.split(",").map((p) => p.trim().toLowerCase());
    return cityAreas.filter((area) => parts.includes(area.toLowerCase()));
  };

  const getInitialBudgetMin = (): string => {
    const param = searchParams.get("budgetMin");
    return param?.trim() ?? "";
  };

  const getInitialBudgetMax = (): string => {
    const param = searchParams.get("budgetMax");
    return param?.trim() ?? "";
  };

  const getInitialAdvanced = () => {
    const get = (key: string) => searchParams.get(key) ?? "";
    const amenitiesParam = searchParams.get("amenities");
    const amenitySet = new Set(
      amenitiesParam
        ? amenitiesParam
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
    );
    return {
      furnitureStatus: get("furnitureStatus"),
      bathrooms: get("bathrooms"),
      floorLevel: get("floorLevel"),
      parking: get("parking"),
      propertyAge: get("propertyAge"),
      minArea: get("minArea"),
      maxArea: get("maxArea"),
      bedrooms: get("bedrooms"),
      rooms: get("rooms"),
      minPlotArea: get("minPlotArea"),
      maxPlotArea: get("maxPlotArea"),
      governorate: get("governorate"),
      directorate: get("directorate"),
      village: get("village"),
      parcelName: get("parcelName"),
      balcony: amenitySet.has("balcony"),
      builtInCloset: amenitySet.has("builtInCloset"),
      garden: amenitySet.has("garden"),
      alarmSystem: amenitySet.has("alarmSystem"),
      homeAutomation: amenitySet.has("homeAutomation"),
      gymAccess: amenitySet.has("gymAccess"),
      parkingAvailable: amenitySet.has("parkingAvailable"),
      loadingAccess: amenitySet.has("loadingAccess"),
      displayFrontage: amenitySet.has("displayFrontage"),
      airConditioning: amenitySet.has("airConditioning"),
      storageArea: amenitySet.has("storageArea"),
      roadAccess: amenitySet.has("roadAccess"),
      utilitiesAvailable: amenitySet.has("utilitiesAvailable"),
      zonedUse: amenitySet.has("zonedUse"),
      waterSource: amenitySet.has("waterSource"),
      electricityNearby: amenitySet.has("electricityNearby"),
    };
  };

  const [status, setStatus] = useState<StatusTabKey>(() => getInitialStatus());
  const [category, setCategory] = useState<CategoryKey>(() =>
    getInitialCategory(),
  );
  const [propertyType, setPropertyType] = useState<string>(() =>
    getInitialPropertyType(getInitialCategory()),
  );
  const [city, setCity] = useState<string>(() => getInitialCity());
  const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
    getInitialAreas(),
  );
  const [budgetMin, setBudgetMin] = useState(() => getInitialBudgetMin());
  const [budgetMax, setBudgetMax] = useState(() => getInitialBudgetMax());
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [furnitureStatus, setFurnitureStatus] = useState(
    () => getInitialAdvanced().furnitureStatus,
  );
  const [bathrooms, setBathrooms] = useState(
    () => getInitialAdvanced().bathrooms,
  );
  const [floorLevel, setFloorLevel] = useState(
    () => getInitialAdvanced().floorLevel,
  );
  const [parking, setParking] = useState(() => getInitialAdvanced().parking);
  const [propertyAge, setPropertyAge] = useState(
    () => getInitialAdvanced().propertyAge,
  );
  const [minArea, setMinArea] = useState(() => getInitialAdvanced().minArea);
  const [maxArea, setMaxArea] = useState(() => getInitialAdvanced().maxArea);
  const [bedrooms, setBedrooms] = useState(() => getInitialAdvanced().bedrooms);
  const [rooms, setRooms] = useState(() => getInitialAdvanced().rooms);
  const [minPlotArea, setMinPlotArea] = useState(
    () => getInitialAdvanced().minPlotArea,
  );
  const [maxPlotArea, setMaxPlotArea] = useState(
    () => getInitialAdvanced().maxPlotArea,
  );
  const [governorate, setGovernorate] = useState(
    () => getInitialAdvanced().governorate,
  );
  const [directorate, setDirectorate] = useState(
    () => getInitialAdvanced().directorate,
  );
  const [village, setVillage] = useState(() => getInitialAdvanced().village);
  const [parcelName, setParcelName] = useState(
    () => getInitialAdvanced().parcelName,
  );
  const [balcony, setBalcony] = useState(() => getInitialAdvanced().balcony);
  const [builtInCloset, setBuiltInCloset] = useState(
    () => getInitialAdvanced().builtInCloset,
  );
  const [garden, setGarden] = useState(() => getInitialAdvanced().garden);
  const [alarmSystem, setAlarmSystem] = useState(
    () => getInitialAdvanced().alarmSystem,
  );
  const [homeAutomation, setHomeAutomation] = useState(
    () => getInitialAdvanced().homeAutomation,
  );
  const [gymAccess, setGymAccess] = useState(
    () => getInitialAdvanced().gymAccess,
  );
  const [parkingAvailable, setParkingAvailable] = useState(
    () => getInitialAdvanced().parkingAvailable,
  );
  const [loadingAccess, setLoadingAccess] = useState(
    () => getInitialAdvanced().loadingAccess,
  );
  const [displayFrontage, setDisplayFrontage] = useState(
    () => getInitialAdvanced().displayFrontage,
  );
  const [airConditioning, setAirConditioning] = useState(
    () => getInitialAdvanced().airConditioning,
  );
  const [storageArea, setStorageArea] = useState(
    () => getInitialAdvanced().storageArea,
  );
  const [roadAccess, setRoadAccess] = useState(
    () => getInitialAdvanced().roadAccess,
  );
  const [utilitiesAvailable, setUtilitiesAvailable] = useState(
    () => getInitialAdvanced().utilitiesAvailable,
  );
  const [zonedUse, setZonedUse] = useState(() => getInitialAdvanced().zonedUse);
  const [waterSource, setWaterSource] = useState(
    () => getInitialAdvanced().waterSource,
  );
  const [electricityNearby, setElectricityNearby] = useState(
    () => getInitialAdvanced().electricityNearby,
  );

  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const propertyTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const areasTriggerRef = useRef<HTMLButtonElement>(null);
  const budgetTriggerRef = useRef<HTMLButtonElement>(null);
  const advFurnitureRef = useRef<HTMLButtonElement>(null);
  const advBedroomsRef = useRef<HTMLButtonElement>(null);
  const advRoomsRef = useRef<HTMLButtonElement>(null);
  const advBathroomsRef = useRef<HTMLButtonElement>(null);
  const advFloorRef = useRef<HTMLButtonElement>(null);
  const advParkingRef = useRef<HTMLButtonElement>(null);
  const advPropertyAgeRef = useRef<HTMLButtonElement>(null);
  const [advFurnitureOpen, setAdvFurnitureOpen] = useState(false);
  const [advBedroomsOpen, setAdvBedroomsOpen] = useState(false);
  const [advRoomsOpen, setAdvRoomsOpen] = useState(false);
  const [advBathroomsOpen, setAdvBathroomsOpen] = useState(false);
  const [advFloorOpen, setAdvFloorOpen] = useState(false);
  const [advParkingOpen, setAdvParkingOpen] = useState(false);
  const [advPropertyAgeOpen, setAdvPropertyAgeOpen] = useState(false);

  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const authUser = useAppSelector(selectCurrentUser);
  const locale = useLocale();
  const queryString = searchParams.toString();

  const closeAllAdvancedDropdowns = () => {
    setAdvFurnitureOpen(false);
    setAdvBedroomsOpen(false);
    setAdvRoomsOpen(false);
    setAdvBathroomsOpen(false);
    setAdvFloorOpen(false);
    setAdvParkingOpen(false);
    setAdvPropertyAgeOpen(false);
  };

  const closeAllTopDropdowns = () => {
    setCategoryOpen(false);
    setPropertyTypeOpen(false);
    setCityOpen(false);
    setAreasOpen(false);
    setIsBudgetOpen(false);
  };

  const toggleTopDropdown = (
    isCurrentlyOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
  ) => {
    if (isCurrentlyOpen) {
      setOpen(false);
      return;
    }
    closeAllTopDropdowns();
    setOpen(true);
  };

  const toggleAdvancedDropdown = (
    isCurrentlyOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
  ) => {
    if (isCurrentlyOpen) {
      setOpen(false);
      return;
    }
    closeAllAdvancedDropdowns();
    setOpen(true);
  };

  const categoryLabel =
    category === "residential"
      ? t.residential
      : category === "commercial"
        ? t.commercial
        : t.land;
  const propertyTypeOptions = CATEGORY_TO_PROPERTY_TYPES[category];
  const hasSelectedPropertyType = propertyType.trim().length > 0;
  const isResidentialType = (types: Set<string>) =>
    category === "residential" &&
    hasSelectedPropertyType &&
    types.has(propertyType);
  const isCommercialType = (types: Set<string>) =>
    category === "commercial" &&
    hasSelectedPropertyType &&
    types.has(propertyType);

  const showFurnitureStatus = isResidentialType(RESIDENTIAL_FURNITURE_TYPES);
  const showBedrooms = category === "residential";
  const showRooms = category === "commercial";
  const showBathrooms = category === "residential" || category === "commercial";
  const showFloorLevel =
    isResidentialType(RESIDENTIAL_FLOOR_LEVEL_TYPES) ||
    isCommercialType(COMMERCIAL_FLOOR_LEVEL_TYPES);
  const showParking = category === "residential" || category === "commercial";
  const showAreaRange = category === "residential" || category === "commercial";
  const showPropertyAge =
    category === "residential" || category === "commercial";
  const showPlotAreaRange = category === "land";
  const showGovernorate = category === "land";
  const showDirectorate = category === "land";
  const showVillage = category === "land";
  const showParcelName = category === "land" && hasSelectedPropertyType;
  const showBalconyAmenity = isResidentialType(RESIDENTIAL_BALCONY_TYPES);
  const showBuiltInClosetAmenity = isResidentialType(RESIDENTIAL_CLOSET_TYPES);
  const showGardenAmenity = isResidentialType(RESIDENTIAL_GARDEN_TYPES);
  const showAlarmSystemAmenity =
    category === "residential" || category === "commercial";
  const showHomeAutomationAmenity = isResidentialType(
    RESIDENTIAL_HOME_AUTOMATION_TYPES,
  );
  const showGymAccessAmenity = isResidentialType(RESIDENTIAL_GYM_ACCESS_TYPES);
  const showParkingAvailableAmenity =
    category === "residential" || category === "commercial";
  const showLoadingAccessAmenity = isCommercialType(
    COMMERCIAL_LOADING_ACCESS_TYPES,
  );
  const showDisplayFrontageAmenity = isCommercialType(
    COMMERCIAL_DISPLAY_FRONTAGE_TYPES,
  );
  const showAirConditioningAmenity = isCommercialType(COMMERCIAL_AC_TYPES);
  const showStorageAreaAmenity = isCommercialType(
    COMMERCIAL_STORAGE_AREA_TYPES,
  );
  const showRoadAccessAmenity = category === "land";
  const showUtilitiesAvailableAmenity =
    category === "land" &&
    hasSelectedPropertyType &&
    LAND_UTILITIES_TYPES.has(propertyType);
  const showZonedUseAmenity =
    category === "land" &&
    hasSelectedPropertyType &&
    LAND_ZONED_USE_TYPES.has(propertyType);
  const showWaterSourceAmenity =
    category === "land" &&
    hasSelectedPropertyType &&
    LAND_WATER_SOURCE_TYPES.has(propertyType);
  const showElectricityNearbyAmenity =
    category === "land" &&
    hasSelectedPropertyType &&
    LAND_ELECTRICITY_TYPES.has(propertyType);

  const amenityOptions = [
    showBalconyAmenity
      ? { key: "balcony", label: "Balcony", checked: balcony, set: setBalcony }
      : null,
    showBuiltInClosetAmenity
      ? {
          key: "builtInCloset",
          label: "Built-in Closet",
          checked: builtInCloset,
          set: setBuiltInCloset,
        }
      : null,
    showGardenAmenity
      ? { key: "garden", label: t.garden, checked: garden, set: setGarden }
      : null,
    showAlarmSystemAmenity
      ? {
          key: "alarmSystem",
          label: "Alarm System",
          checked: alarmSystem,
          set: setAlarmSystem,
        }
      : null,
    showHomeAutomationAmenity
      ? {
          key: "homeAutomation",
          label: "Home Automation",
          checked: homeAutomation,
          set: setHomeAutomation,
        }
      : null,
    showGymAccessAmenity
      ? {
          key: "gymAccess",
          label: "Gym Access",
          checked: gymAccess,
          set: setGymAccess,
        }
      : null,
    showParkingAvailableAmenity
      ? {
          key: "parkingAvailable",
          label: "Parking Available",
          checked: parkingAvailable,
          set: setParkingAvailable,
        }
      : null,
    showLoadingAccessAmenity
      ? {
          key: "loadingAccess",
          label: "Loading Access",
          checked: loadingAccess,
          set: setLoadingAccess,
        }
      : null,
    showDisplayFrontageAmenity
      ? {
          key: "displayFrontage",
          label: "Display Frontage",
          checked: displayFrontage,
          set: setDisplayFrontage,
        }
      : null,
    showAirConditioningAmenity
      ? {
          key: "airConditioning",
          label: t.airConditioning,
          checked: airConditioning,
          set: setAirConditioning,
        }
      : null,
    showStorageAreaAmenity
      ? {
          key: "storageArea",
          label: "Storage Area",
          checked: storageArea,
          set: setStorageArea,
        }
      : null,
    showRoadAccessAmenity
      ? {
          key: "roadAccess",
          label: "Road Access",
          checked: roadAccess,
          set: setRoadAccess,
        }
      : null,
    showUtilitiesAvailableAmenity
      ? {
          key: "utilitiesAvailable",
          label: "Utilities Available",
          checked: utilitiesAvailable,
          set: setUtilitiesAvailable,
        }
      : null,
    showZonedUseAmenity
      ? {
          key: "zonedUse",
          label: "Zoned Use",
          checked: zonedUse,
          set: setZonedUse,
        }
      : null,
    showWaterSourceAmenity
      ? {
          key: "waterSource",
          label: "Water Source",
          checked: waterSource,
          set: setWaterSource,
        }
      : null,
    showElectricityNearbyAmenity
      ? {
          key: "electricityNearby",
          label: "Electricity Nearby",
          checked: electricityNearby,
          set: setElectricityNearby,
        }
      : null,
  ].filter(
    (
      option,
    ): option is {
      key: string;
      label: string;
      checked: boolean;
      set: Dispatch<SetStateAction<boolean>>;
    } => option !== null,
  );

  const areaOptions = city ? getAreasByCityName(city) : [];

  const formatBudgetLabel = () => {
    if (!budgetMin && !budgetMax) return t.budgetPlaceholder;
    const formatNumber = (value: string) =>
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        Number(value),
      );
    const minLabel = budgetMin ? formatNumber(budgetMin) : t.budgetMin;
    const maxLabel = budgetMax ? formatNumber(budgetMax) : t.budgetMax;
    return `${minLabel} - ${maxLabel}`;
  };

  const exclusiveParam = searchParams.get("exclusive");
  const similarToParam = searchParams.get("similar_to");

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (exclusiveParam === "1" || exclusiveParam === "true")
      params.set("exclusive", "1");
    if (similarToParam && similarToParam.trim())
      params.set("similar_to", similarToParam.trim());
    params.set("status", status);
    params.set("category", category);
    if (propertyType) params.set("type", slugify(propertyType));
    if (city) params.set("city", city);
    if (selectedAreas.length > 0)
      params.set("locations", selectedAreas.join(","));
    if (budgetMin.trim()) params.set("budgetMin", budgetMin.trim());
    if (budgetMax.trim()) params.set("budgetMax", budgetMax.trim());
    if (showFurnitureStatus && furnitureStatus)
      params.set("furnitureStatus", furnitureStatus);
    if (showBathrooms && bathrooms) params.set("bathrooms", bathrooms);
    if (showFloorLevel && floorLevel) params.set("floorLevel", floorLevel);
    if (showParking && parking) params.set("parking", parking);
    if (showPropertyAge && propertyAge) params.set("propertyAge", propertyAge);
    if (showAreaRange && minArea.trim()) params.set("minArea", minArea.trim());
    if (showAreaRange && maxArea.trim()) params.set("maxArea", maxArea.trim());
    if (showBedrooms && bedrooms) params.set("bedrooms", bedrooms);
    if (showRooms && rooms) params.set("rooms", rooms);
    if (showPlotAreaRange && minPlotArea.trim())
      params.set("minPlotArea", minPlotArea.trim());
    if (showPlotAreaRange && maxPlotArea.trim())
      params.set("maxPlotArea", maxPlotArea.trim());
    if (showGovernorate && governorate.trim())
      params.set("governorate", governorate.trim());
    if (showDirectorate && directorate.trim())
      params.set("directorate", directorate.trim());
    if (showVillage && village.trim()) params.set("village", village.trim());
    if (showParcelName && parcelName.trim())
      params.set("parcelName", parcelName.trim());
    const amenityList: string[] = [];
    if (showBalconyAmenity && balcony) amenityList.push("balcony");
    if (showBuiltInClosetAmenity && builtInCloset)
      amenityList.push("builtInCloset");
    if (showGardenAmenity && garden) amenityList.push("garden");
    if (showAlarmSystemAmenity && alarmSystem) amenityList.push("alarmSystem");
    if (showHomeAutomationAmenity && homeAutomation)
      amenityList.push("homeAutomation");
    if (showGymAccessAmenity && gymAccess) amenityList.push("gymAccess");
    if (showParkingAvailableAmenity && parkingAvailable)
      amenityList.push("parkingAvailable");
    if (showLoadingAccessAmenity && loadingAccess)
      amenityList.push("loadingAccess");
    if (showDisplayFrontageAmenity && displayFrontage)
      amenityList.push("displayFrontage");
    if (showAirConditioningAmenity && airConditioning)
      amenityList.push("airConditioning");
    if (showStorageAreaAmenity && storageArea) amenityList.push("storageArea");
    if (showRoadAccessAmenity && roadAccess) amenityList.push("roadAccess");
    if (showUtilitiesAvailableAmenity && utilitiesAvailable)
      amenityList.push("utilitiesAvailable");
    if (showZonedUseAmenity && zonedUse) amenityList.push("zonedUse");
    if (showWaterSourceAmenity && waterSource) amenityList.push("waterSource");
    if (showElectricityNearbyAmenity && electricityNearby)
      amenityList.push("electricityNearby");
    if (amenityList.length > 0) params.set("amenities", amenityList.join(","));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [
    exclusiveParam,
    similarToParam,
    status,
    category,
    propertyType,
    city,
    selectedAreas,
    budgetMin,
    budgetMax,
    furnitureStatus,
    bathrooms,
    floorLevel,
    parking,
    propertyAge,
    minArea,
    maxArea,
    bedrooms,
    rooms,
    minPlotArea,
    maxPlotArea,
    governorate,
    directorate,
    village,
    parcelName,
    balcony,
    builtInCloset,
    garden,
    alarmSystem,
    homeAutomation,
    gymAccess,
    parkingAvailable,
    loadingAccess,
    displayFrontage,
    airConditioning,
    storageArea,
    roadAccess,
    utilitiesAvailable,
    zonedUse,
    waterSource,
    electricityNearby,
    showFurnitureStatus,
    showBedrooms,
    showRooms,
    showBathrooms,
    showFloorLevel,
    showParking,
    showAreaRange,
    showPropertyAge,
    showPlotAreaRange,
    showGovernorate,
    showDirectorate,
    showVillage,
    showParcelName,
    showBalconyAmenity,
    showBuiltInClosetAmenity,
    showGardenAmenity,
    showAlarmSystemAmenity,
    showHomeAutomationAmenity,
    showGymAccessAmenity,
    showParkingAvailableAmenity,
    showLoadingAccessAmenity,
    showDisplayFrontageAmenity,
    showAirConditioningAmenity,
    showStorageAreaAmenity,
    showRoadAccessAmenity,
    showUtilitiesAvailableAmenity,
    showZonedUseAmenity,
    showWaterSourceAmenity,
    showElectricityNearbyAmenity,
    pathname,
    router,
  ]);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    syncToUrl();
  }, [syncToUrl]);

  const handleClearAdvanced = () => {
    setFurnitureStatus("");
    setBathrooms("");
    setFloorLevel("");
    setParking("");
    setPropertyAge("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("");
    setRooms("");
    setMinPlotArea("");
    setMaxPlotArea("");
    setGovernorate("");
    setDirectorate("");
    setVillage("");
    setParcelName("");
    setBalcony(false);
    setBuiltInCloset(false);
    setGarden(false);
    setAlarmSystem(false);
    setHomeAutomation(false);
    setGymAccess(false);
    setParkingAvailable(false);
    setLoadingAccess(false);
    setDisplayFrontage(false);
    setAirConditioning(false);
    setStorageArea(false);
    setRoadAccess(false);
    setUtilitiesAvailable(false);
    setZonedUse(false);
    setWaterSource(false);
    setElectricityNearby(false);
  };

  /** Clear all filters (main + advanced) and sync URL to pathname (preserving query flags). */
  const handleClearAll = () => {
    setStatus("buy");
    setCategory("residential");
    setPropertyType("");
    setCity("");
    setSelectedAreas([]);
    setBudgetMin("");
    setBudgetMax("");
    setAdvancedSearchOpen(false);
    handleClearAdvanced();
    const nextParams = new URLSearchParams();
    const exclusiveParam = searchParams.get("exclusive");
    const similarToParam = searchParams.get("similar_to");
    if (exclusiveParam === "1" || exclusiveParam === "true") {
      nextParams.set("exclusive", "1");
    }
    if (similarToParam && similarToParam.trim()) {
      nextParams.set("similar_to", similarToParam.trim());
    }
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const activeStatusIndex = Math.max(
    0,
    STATUS_TABS.findIndex((tabKey) => tabKey === status),
  );

  return (
    <section
      className="min-w-0 w-full"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          // Grid layout for small–large screens
          "grid grid-cols-1",
          "sm:grid-cols-2",
          "md:grid-cols-3",
          "lg:grid-cols-4",
          // Single-row flex layout on xl+ screens
          "xl:flex xl:flex-nowrap xl:items-stretch",
          "gap-y-2 sm:gap-3",
        )}
      >
        {/* Rent / Buy tabs (same style as HeroSearchCard) */}
        <div className="col-span-2 md:col-span-1 flex items-center" dir={isRtl ? "rtl" : "ltr"}>
          <div
            className={cn(
              "relative inline-flex bg-gray-200 rounded-[10px] p-1 w-full h-11",
              isRtl && "flex-row-reverse",
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-secondary shadow-sm transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${isRtl ? (1 - activeStatusIndex) * 100 : activeStatusIndex * 100}%)`,
              }}
            />
            {STATUS_TABS.map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                title={t[tabKey]}
                onClick={() => {
                  setStatus(tabKey);
                }}
                className={cn(
                  "relative z-10 flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-5 text-size-sm fw-medium capitalize transition-colors duration-300",
                  status === tabKey
                    ? "text-white"
                    : "text-[rgba(51,51,51,0.7)] hover:text-secondary",
                )}
              >
                {t[tabKey]}
              </button>
            ))}
          </div>
        </div>

        {/* Commercial / Category dropdown */}
        <div
          className="relative col-span-2 md:col-span-1 min-w-0"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={categoryTriggerRef}
            type="button"
            title={categoryLabel}
            onClick={() => toggleTopDropdown(categoryOpen, setCategoryOpen)}
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-4 py-2 text-size-sm text-charcoal transition hover:border-[rgba(43,91,166,0.6)]",
              categoryOpen && "border-secondary",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="min-w-0 truncate text-left" dir={isRtl ? "rtl" : "ltr"}>
              {categoryLabel}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={categoryOpen}
            onClose={() => setCategoryOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={categoryTriggerRef}
            closeOnSelect
          >
            <div className={dropdownPanelClass}>
              {CATEGORY_OPTIONS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key);
                    setPropertyType("");
                    setCategoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-size-sm transition hover:bg-surface",
                    category === key
                      ? "bg-surface text-secondary fw-medium"
                      : "text-charcoal",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {t[labelKey] as string}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* Property Type dropdown (depends on category) */}
        <div
          className="relative min-w-0 col-span-2 md:col-span-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={propertyTypeTriggerRef}
            type="button"
            title={propertyType || PROPERTY_TYPE_PLACEHOLDER}
            onClick={() =>
              toggleTopDropdown(propertyTypeOpen, setPropertyTypeOpen)
            }
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-4 py-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
              propertyType ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
              propertyTypeOpen && "border-secondary",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="min-w-0 truncate text-left" dir={isRtl ? "rtl" : "ltr"}>
              {propertyType || PROPERTY_TYPE_PLACEHOLDER}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={propertyTypeOpen}
            onClose={() => setPropertyTypeOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={propertyTypeTriggerRef}
            closeOnSelect
          >
            <div className={dropdownPanelClass}>
              <button
                type="button"
                onClick={() => {
                  setPropertyType("");
                  setPropertyTypeOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                  !propertyType
                    ? "bg-surface text-secondary fw-medium"
                    : "text-charcoal",
                  isRtl && "flex-row-reverse text-right",
                )}
              >
                {PROPERTY_TYPE_PLACEHOLDER}
              </button>
              {propertyTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPropertyType(type);
                    setPropertyTypeOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                    propertyType === type
                      ? "bg-surface text-secondary fw-medium"
                      : "text-charcoal",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* City dropdown */}
        <div
          className="relative min-w-0 col-span-2 md:col-span-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={cityTriggerRef}
            type="button"
            title={city || t.cityPlaceholder}
            onClick={() => toggleTopDropdown(cityOpen, setCityOpen)}
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-4 py-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
              city ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
              cityOpen && "border-secondary",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="min-w-0 truncate text-left" dir={isRtl ? "rtl" : "ltr"}>
              {city || t.cityPlaceholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={cityOpen}
            onClose={() => setCityOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={cityTriggerRef}
            closeOnSelect
          >
            <div className="min-w-48 max-h-64 overflow-y-auto rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => {
                  setCity("");
                  setSelectedAreas([]);
                  setCityOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                  !city
                    ? "bg-surface text-secondary fw-medium"
                    : "text-charcoal",
                  isRtl && "flex-row-reverse text-right",
                )}
              >
                {t.cityPlaceholder}
              </button>
              {JORDAN_CITIES_WITH_AREAS.map((cityOption) => (
                <button
                  key={cityOption.id}
                  type="button"
                  onClick={() => {
                    setCity(cityOption.name);
                    setSelectedAreas([]);
                    setCityOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                    city === cityOption.name
                      ? "bg-surface text-secondary fw-medium"
                      : "text-charcoal",
                    isRtl && "flex-row-reverse text-right",
                  )}
                >
                  {cityOption.name}
                </button>
              ))}
            </div>
          </HeroDropdown>
        </div>

        {/* Areas (locations) multi-select - like HeroAreaSelect, disabled when no city */}
        <div
          className="relative min-w-0 col-span-2 md:col-span-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={areasTriggerRef}
            type="button"
            title={
              city
                ? selectedAreas.length > 0
                  ? selectedAreas.join(", ")
                  : t.areasPlaceholder
                : "Select city first"
            }
            disabled={!city}
            onClick={() => {
              if (!city) return;
              toggleTopDropdown(areasOpen, setAreasOpen);
            }}
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-4 py-3 text-size-sm transition",
              !city
                ? "cursor-not-allowed border-[rgba(43,91,166,0.2)] bg-surface/50 text-[rgba(51,51,51,0.5)]"
                : "border-[rgba(43,91,166,0.35)] hover:border-[rgba(43,91,166,0.6)]",
              selectedAreas.length > 0
                ? "text-charcoal fw-medium"
                : "text-[rgba(51,51,51,0.5)] fw-normal",
              areasOpen && city && "border-secondary",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="min-w-0 flex-1 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
              {selectedAreas.length === 0 ? (
                <span className="block truncate text-left">
                  {city ? t.areasPlaceholder : "Select city first"}
                </span>
              ) : selectedAreas.length <= 2 ? (
                <span className="block truncate text-left">
                  {selectedAreas.join(", ")}
                </span>
              ) : (
                <span
                  className={cn(
                    "flex min-w-0 items-center gap-1 overflow-hidden",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="min-w-0 truncate text-left">
                    {selectedAreas.slice(0, 2).join(", ")}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 fw-medium text-secondary">
                    <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                    {t.areasMoreLabel(selectedAreas.length - 2)}
                  </span>
                </span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={areasOpen && !!city}
            onClose={() => setAreasOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={areasTriggerRef}
          >
            <div className="min-w-48 max-h-64 overflow-y-auto rounded-xl border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => {
                  const allSelected =
                    areaOptions.length > 0 &&
                    areaOptions.every((a) => selectedAreas.includes(a));
                  if (allSelected) {
                    setSelectedAreas([]);
                  } else {
                    setSelectedAreas([...areaOptions]);
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-size-sm fw-medium transition hover:bg-surface",
                  "text-secondary",
                  isRtl && "text-right",
                )}
              >
                {areaOptions.length > 0 &&
                areaOptions.every((a) => selectedAreas.includes(a))
                  ? t.areasDeselectAll
                  : t.areasSelectAll}
              </button>
              <div className="my-1 border-t border-subtle" />
              {areaOptions.map((areaName) => {
                const isSelected = selectedAreas.includes(areaName);
                return (
                  <label
                    key={areaName}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                      isSelected
                        ? "bg-surface text-secondary fw-medium"
                        : "text-charcoal",
                      isRtl && "flex-row-reverse text-right",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedAreas((prev) =>
                            prev.includes(areaName)
                              ? prev.filter((a) => a !== areaName)
                              : [...prev, areaName],
                          );
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-subtle text-secondary focus:ring-primary"
                      />
                      <span>{areaName}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </HeroDropdown>
        </div>

        {/* Budget (JD) - dropdown like HeroSearchCard */}
        <div
          className="relative min-w-0 col-span-2 md:col-span-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <button
            ref={budgetTriggerRef}
            type="button"
            title={formatBudgetLabel()}
            onClick={() => toggleTopDropdown(isBudgetOpen, setIsBudgetOpen)}
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-4 py-3 text-size-sm text-charcoal transition hover:border-[rgba(43,91,166,0.6)]",
              budgetMin || budgetMax ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
              isBudgetOpen && "border-secondary",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-size-2xs fw-medium text-secondary">
              JD
            </span>
            <span className={`min-w-0 truncate text-size-sm ${budgetMin || budgetMax ? "fw-medium" : "fw-normal"}`}>
              {formatBudgetLabel()}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <HeroDropdown
            isOpen={isBudgetOpen}
            onClose={() => setIsBudgetOpen(false)}
            align={isRtl ? "right" : "left"}
            anchorRef={budgetTriggerRef}
            minPanelWidth={300}
          >
            <BudgetRangeInputs
              minBudget={budgetMin}
              maxBudget={budgetMax}
              onChangeMin={setBudgetMin}
              onChangeMax={setBudgetMax}
              onReset={() => {
                setBudgetMin("");
                setBudgetMax("");
              }}
              onDone={() => setIsBudgetOpen(false)}
              minLabel={status === "rent" ? t.budgetYearlyMinLabel : undefined}
              maxLabel={status === "rent" ? t.budgetYearlyMaxLabel : undefined}
            />
          </HeroDropdown>
        </div>

        {/* Advanced Search toggle (+/–) + Clear + Save Search — small: grid (row1=Advanced full, row2=Clear|Save equal); md+: flex row equal */}
        <div
          className={cn(
            "col-span-full grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-nowrap xl:flex-1",
            isRtl && "flex-row-reverse",
          )}
        >
          <button
            type="button"
            title={t.advancedSearch}
            onClick={() => setAdvancedSearchOpen((o) => !o)}
            className={cn(
              "col-span-2 flex h-11 min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-secondary bg-secondary px-4 py-2.5 text-size-sm fw-medium text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 md:col-span-1 md:min-w-0 md:flex-1 md:shrink-0",
              isRtl && "flex-row-reverse",
            )}
          >
            {advancedSearchOpen ? (
              <CircleMinus className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CirclePlus className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span className="min-w-0 truncate">{t.advancedSearch}</span>
          </button>
          <button
            type="button"
            title={t.resetSearch}
            onClick={() => {
              handleClearAll();
            }}
            className={cn(
              "col-start-1 row-start-2 flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg bg-[#F3F4F6] px-4 py-2 text-size-sm fw-semibold text-charcoal transition hover:border-secondary/50 hover:bg-[#E5E7EB] md:col-start-auto md:row-start-auto",
              t.saveSearch == null || t.saveSearch === "" ? "col-span-2" : "",
              isRtl && "flex-row-reverse",
            )}
          >
            {t.resetSearch}
          </button>
          {trailingAction != null ? (
            <div className="col-span-2 row-start-3 md:col-span-1 md:row-start-auto md:min-w-0 md:flex-1">
              {trailingAction}
            </div>
          ) : null}
          {t.saveSearch != null && t.saveSearch !== "" ? (
            <button
              type="button"
              title={t.saveSearch ?? ""}
              onClick={() =>
                authUser ? setSaveSearchOpen(true) : setAuthOpen(true)
              }
              className={cn(
                "col-start-2 row-start-2 flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#F3F4F6] px-3 py-2 text-size-sm fw-semibold text-charcoal transition hover:border-secondary/50 hover:bg-[#E5E7EB] md:col-start-auto md:row-start-auto",
                isRtl && "flex-row-reverse",
              )}
            >
              <span className="truncate">{t.saveSearch}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Collapsible Advanced Search section — uses normal page scroll on mobile */}
      {advancedSearchOpen && (
        <div
          className={cn(
            "mt-4 border-t border-subtle pt-4",
            isRtl && "text-right",
          )}
        >
          <div className={cn("-mx-1 px-1", "touch-pan-y")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Residential + Commercial: Furniture Status */}
              {showFurnitureStatus && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.furnitureStatus}
                  </label>
                  <button
                    ref={advFurnitureRef}
                    type="button"
                    title={t.furnitureStatus}
                    onClick={() =>
                      toggleAdvancedDropdown(
                        advFurnitureOpen,
                        setAdvFurnitureOpen,
                      )
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      furnitureStatus
                        ? "text-charcoal fw-medium"
                        : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advFurnitureOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {furnitureStatus === "furnished"
                      ? t.furnitureFurnished
                      : furnitureStatus === "semi-furnished"
                        ? t.furnitureSemiFurnished
                        : furnitureStatus === "unfurnished"
                          ? t.furnitureUnfurnished
                          : t.selectFurnitureStatus}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advFurnitureOpen}
                    onClose={() => setAdvFurnitureOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advFurnitureRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setFurnitureStatus("");
                          setAdvFurnitureOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !furnitureStatus
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.selectFurnitureStatus}
                      </button>
                      {[
                        { value: "furnished", label: t.furnitureFurnished },
                        {
                          value: "semi-furnished",
                          label: t.furnitureSemiFurnished,
                        },
                        { value: "unfurnished", label: t.furnitureUnfurnished },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setFurnitureStatus(value);
                            setAdvFurnitureOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            furnitureStatus === value
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Residential only: Bedrooms */}
              {showBedrooms && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.bedrooms}
                  </label>
                  <button
                    ref={advBedroomsRef}
                    type="button"
                    title={t.bedrooms}
                    onClick={() =>
                      toggleAdvancedDropdown(
                        advBedroomsOpen,
                        setAdvBedroomsOpen,
                      )
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      bedrooms ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advBedroomsOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {bedrooms || t.allRooms}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advBedroomsOpen}
                    onClose={() => setAdvBedroomsOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advBedroomsRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setBedrooms("");
                          setAdvBedroomsOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !bedrooms
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.allRooms}
                      </button>
                      {ROOM_OPTIONS.filter(Boolean).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setBedrooms(n);
                            setAdvBedroomsOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            bedrooms === n
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Commercial only: Rooms */}
              {showRooms && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.rooms}
                  </label>
                  <button
                    ref={advRoomsRef}
                    type="button"
                    title={t.rooms}
                    onClick={() =>
                      toggleAdvancedDropdown(advRoomsOpen, setAdvRoomsOpen)
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      rooms ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advRoomsOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {rooms || t.allRooms}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advRoomsOpen}
                    onClose={() => setAdvRoomsOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advRoomsRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setRooms("");
                          setAdvRoomsOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !rooms
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.allRooms}
                      </button>
                      {ROOM_OPTIONS.filter(Boolean).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setRooms(n);
                            setAdvRoomsOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            rooms === n
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Residential + Commercial: Bathrooms */}
              {showBathrooms && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.bathrooms}
                  </label>
                  <button
                    ref={advBathroomsRef}
                    type="button"
                    title={t.bathrooms}
                    onClick={() =>
                      toggleAdvancedDropdown(
                        advBathroomsOpen,
                        setAdvBathroomsOpen,
                      )
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      bathrooms ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advBathroomsOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {bathrooms || t.allBaths}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advBathroomsOpen}
                    onClose={() => setAdvBathroomsOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advBathroomsRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setBathrooms("");
                          setAdvBathroomsOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !bathrooms
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.allBaths}
                      </button>
                      {BATH_OPTIONS.filter(Boolean).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setBathrooms(n);
                            setAdvBathroomsOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            bathrooms === n
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Residential + Commercial: Floor Level */}
              {showFloorLevel && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.floorLevel}
                  </label>
                  <button
                    ref={advFloorRef}
                    type="button"
                    title={t.floorLevel}
                    onClick={() =>
                      toggleAdvancedDropdown(advFloorOpen, setAdvFloorOpen)
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      floorLevel
                        ? "text-charcoal fw-medium"
                        : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advFloorOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {floorLevel === "ground"
                      ? "Ground"
                      : floorLevel === "penthouse"
                        ? "Penthouse"
                        : floorLevel || t.selectFloorLevel}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advFloorOpen}
                    onClose={() => setAdvFloorOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advFloorRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setFloorLevel("");
                          setAdvFloorOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !floorLevel
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.selectFloorLevel}
                      </button>
                      {FLOOR_OPTIONS.filter(Boolean).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFloorLevel(opt);
                            setAdvFloorOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            floorLevel === opt
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {opt === "ground"
                            ? "Ground"
                            : opt === "penthouse"
                              ? "Penthouse"
                              : opt}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Residential + Commercial: Parking */}
              {showParking && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.parking}
                  </label>
                  <button
                    ref={advParkingRef}
                    type="button"
                    title={t.parking}
                    onClick={() =>
                      toggleAdvancedDropdown(advParkingOpen, setAdvParkingOpen)
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      parking ? "text-charcoal fw-medium" : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advParkingOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {parking !== "" ? parking : t.allParking}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advParkingOpen}
                    onClose={() => setAdvParkingOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advParkingRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setParking("");
                          setAdvParkingOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !parking
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.allParking}
                      </button>
                      {PARKING_OPTIONS.filter(Boolean).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setParking(n);
                            setAdvParkingOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            parking === n
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Residential + Commercial: Min & Max Area */}
              {showAreaRange && (
                <>
                  <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      {t.minArea}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.minArea}
                      title={t.minArea}
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      {t.maxArea}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.maxArea}
                      title={t.maxArea}
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Residential + Commercial: Property Age */}
              {showPropertyAge && (
                <div className="relative min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    {t.propertyAge}
                  </label>
                  <button
                    ref={advPropertyAgeRef}
                    type="button"
                    title={t.propertyAge}
                    onClick={() =>
                      toggleAdvancedDropdown(
                        advPropertyAgeOpen,
                        setAdvPropertyAgeOpen,
                      )
                    }
                    className={cn(
                      "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-[rgba(43,91,166,0.35)] bg-white px-3 text-size-sm transition hover:border-[rgba(43,91,166,0.6)]",
                      propertyAge
                        ? "text-charcoal fw-medium"
                        : "text-[rgba(51,51,51,0.5)] fw-normal",
                      advPropertyAgeOpen && "border-secondary",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    {propertyAge === "new"
                      ? "New"
                      : propertyAge === "1-5"
                        ? "1-5 years"
                        : propertyAge === "5-10"
                          ? "5-10 years"
                          : propertyAge === "10-20"
                            ? "10-20 years"
                            : propertyAge === "20+"
                              ? "20+ years"
                              : propertyAge || t.selectPropertyAge}
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                  <HeroDropdown
                    isOpen={advPropertyAgeOpen}
                    onClose={() => setAdvPropertyAgeOpen(false)}
                    align={isRtl ? "right" : "left"}
                    anchorRef={advPropertyAgeRef}
                    closeOnSelect
                  >
                    <div className={advancedDropdownPanelClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setPropertyAge("");
                          setAdvPropertyAgeOpen(false);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                          !propertyAge
                            ? "bg-surface text-secondary fw-medium"
                            : "text-charcoal",
                          isRtl && "flex-row-reverse text-right",
                        )}
                      >
                        {t.selectPropertyAge}
                      </button>
                      {PROPERTY_AGE_OPTIONS.filter(Boolean).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setPropertyAge(opt);
                            setAdvPropertyAgeOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                            propertyAge === opt
                              ? "bg-surface text-secondary fw-medium"
                              : "text-charcoal",
                            isRtl && "flex-row-reverse text-right",
                          )}
                        >
                          {opt === "new"
                            ? "New"
                            : opt === "1-5"
                              ? "1-5 years"
                              : opt === "5-10"
                                ? "5-10 years"
                                : opt === "10-20"
                                  ? "10-20 years"
                                  : "20+ years"}
                        </button>
                      ))}
                    </div>
                  </HeroDropdown>
                </div>
              )}

              {/* Lands only: Min & Max Plot Area */}
              {showPlotAreaRange && (
                <>
                  <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      {t.minPlotArea}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.minPlotArea}
                      title={t.minPlotArea}
                      value={minPlotArea}
                      onChange={(e) => setMinPlotArea(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      {t.maxPlotArea}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.maxPlotArea}
                      title={t.maxPlotArea}
                      value={maxPlotArea}
                      onChange={(e) => setMaxPlotArea(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                </>
              )}

              {showGovernorate && (
                <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Governorate
                  </label>
                  <input
                    type="text"
                    placeholder="Governorate"
                    title="Governorate"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  />
                </div>
              )}

              {showDirectorate && (
                <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Directorate
                  </label>
                  <input
                    type="text"
                    placeholder="Directorate"
                    title="Directorate"
                    value={directorate}
                    onChange={(e) => setDirectorate(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  />
                </div>
              )}

              {showVillage && (
                <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Village
                  </label>
                  <input
                    type="text"
                    placeholder="Village"
                    title="Village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  />
                </div>
              )}

              {showParcelName && (
                <div className="min-w-0" dir={isRtl ? "rtl" : "ltr"}>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Parcel Name
                  </label>
                  <input
                    type="text"
                    placeholder="Parcel Name"
                    title="Parcel Name"
                    value={parcelName}
                    onChange={(e) => setParcelName(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-subtle bg-surface/60 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  />
                </div>
              )}
            </div>

            {amenityOptions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-subtle pt-4">
                {amenityOptions.map(({ key, label, checked, set }) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 text-size-sm text-charcoal",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => set(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-subtle text-secondary focus:ring-primary"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <SaveSearchModal
        open={saveSearchOpen}
        onClose={() => setSaveSearchOpen(false)}
        queryString={queryString}
        isRtl={isRtl}
      />
      <AuthPopup
        open={authOpen}
        locale={locale}
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}
