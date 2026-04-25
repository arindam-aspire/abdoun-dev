"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Compass,
  DollarSign,
  FileText,
  ImageIcon,
  Lightbulb,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  User,
  Video,
} from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui";
import { CATEGORY_TO_PROPERTY_TYPES } from "@/features/property-search/types";
import type {
  CategoryKey,
  StatusTabKey,
} from "@/features/property-search/types";
import {
  JORDAN_CITIES_WITH_AREAS,
  getAreasByCityName,
} from "@/lib/mocks/jordanCities";
import { addListing } from "@/services/agentDashboardMockService";
import type { PropertyType } from "@/types/agent";
import LocationPicker from "@/components/map/LocationPicker";

import { PropertyFormSection } from "./PropertyFormSection";
import { PropertyFormField } from "./PropertyFormField";
import {
  DocumentUploadField,
  createUploadedFiles,
  type UploadedFile,
} from "./DocumentUploadField";
import { MediaUploadField } from "./MediaUploadField";

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

const RESIDENTIAL_MAID_ROOM_TYPES = new Set(["Villas", "Apartments"]);
const RESIDENTIAL_STUDY_TYPES = new Set(["Villas", "Apartments"]);
const RESIDENTIAL_LAUNDRY_TYPES = new Set(["Villas", "Apartments"]);
const RESIDENTIAL_ELEVATOR_TYPES = new Set(["Buildings", "Apartments"]);
const RESIDENTIAL_CENTRAL_AC_TYPES = new Set(["Apartments", "Villas"]);
const COMMERCIAL_MEETING_ROOM_TYPES = new Set(["Offices", "Ready Businesses"]);
const COMMERCIAL_RECEPTION_TYPES = new Set(["Offices", "Showrooms"]);
const COMMERCIAL_CCTV_TYPES = new Set([
  "Warehouses",
  "Shops",
  "Showrooms",
  "Offices",
]);
const LAND_FENCED_TYPES = new Set([
  "Agricultural Lands",
  "Residential Lands",
  "Industrial Lands",
]);
const LAND_IRRIGATION_TYPES = new Set(["Agricultural Lands"]);

const BATH_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const ROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const PARKING_OPTIONS = ["0", "1", "2", "3", "4", "5"];
const FLOOR_OPTIONS = [
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
const PROPERTY_AGE_OPTIONS = ["new", "1-5", "5-10", "10-20", "20+"];
const ORIENTATION_OPTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
const RENT_FREQUENCY_OPTIONS = ["monthly", "yearly"];
const COMPLETION_STATUS_OPTIONS = ["ready", "off-plan", "under-construction"];
const OCCUPANCY_OPTIONS = ["vacant", "occupied-by-owner", "occupied-by-tenant"];
const OWNERSHIP_OPTIONS = ["freehold", "leasehold"];
const FURNITURE_OPTIONS = ["furnished", "semi-furnished", "unfurnished"];

function mapToAgentPropertyType(
  category: CategoryKey,
  propertyType: string,
): PropertyType {
  const map: Record<string, PropertyType> = {
    apartments: "apartment",
    villas: "villa",
    buildings: "commercial",
    farms: "land",
    offices: "office",
    "ready businesses": "commercial",
    shops: "commercial",
    showrooms: "commercial",
    warehouses: "warehouse",
    "residential lands": "land",
    "commercial lands": "land",
    "industrial lands": "land",
    "agricultural lands": "land",
    "mixed use lands": "land",
  };
  return (
    map[propertyType.toLowerCase()] ?? (category === "land" ? "land" : "villa")
  );
}

interface OwnerFormState {
  id: number;
  name: string;
  phone: string;
  email: string;
  socialSecurityId: string;
  nationality: string;
  address: string;
}

interface PropertyLocation {
  lat: number;
  lng: number;
}

function createOwner(id: number): OwnerFormState {
  return {
    id,
    name: "",
    phone: "",
    email: "",
    socialSecurityId: "",
    nationality: "",
    address: "",
  };
}

export function AddPropertyForm() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations("agentDashboard");

  const [listingPurpose, setListingPurpose] = useState<StatusTabKey>("buy");
  const [category, setCategory] = useState<CategoryKey>("residential");
  const [propertyType, setPropertyType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isExclusive, setIsExclusive] = useState(false);

  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [exactLocation, setExactLocation] = useState<PropertyLocation | null>(
    null,
  );
  const [governorate, setGovernorate] = useState("");
  const [directorate, setDirectorate] = useState("");
  const [village, setVillage] = useState("");
  const [parcelName, setParcelName] = useState("");

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [parking, setParking] = useState("");
  const [furnitureStatus, setFurnitureStatus] = useState("");
  const [propertyAge, setPropertyAge] = useState("");
  const [orientation, setOrientation] = useState("");
  const [rooms, setRooms] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [completionStatus, setCompletionStatus] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [ownership, setOwnership] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [permitNumber, setPermitNumber] = useState("");

  const [owners, setOwners] = useState<OwnerFormState[]>([createOwner(1)]);

  const [price, setPrice] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [maintenanceFee, setMaintenanceFee] = useState("");

  const [rentFrequency, setRentFrequency] = useState("monthly");
  const [rentPrice, setRentPrice] = useState("");

  const [balcony, setBalcony] = useState(false);
  const [builtInCloset, setBuiltInCloset] = useState(false);
  const [garden, setGarden] = useState(false);
  const [alarmSystem, setAlarmSystem] = useState(false);
  const [homeAutomation, setHomeAutomation] = useState(false);
  const [gymAccess, setGymAccess] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [swimmingPool, setSwimmingPool] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [displayFrontage, setDisplayFrontage] = useState(false);
  const [airConditioning, setAirConditioning] = useState(false);
  const [storageArea, setStorageArea] = useState(false);
  const [roadAccess, setRoadAccess] = useState(false);
  const [utilitiesAvailable, setUtilitiesAvailable] = useState(false);
  const [zonedUse, setZonedUse] = useState(false);
  const [waterSource, setWaterSource] = useState(false);
  const [electricityNearby, setElectricityNearby] = useState(false);
  const [maidsRoom, setMaidsRoom] = useState(false);
  const [studyRoom, setStudyRoom] = useState(false);
  const [laundryRoom, setLaundryRoom] = useState(false);
  const [centralAC, setCentralAC] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [meetingRoom, setMeetingRoom] = useState(false);
  const [receptionArea, setReceptionArea] = useState(false);
  const [cctvSecurity, setCctvSecurity] = useState(false);
  const [fencedBoundary, setFencedBoundary] = useState(false);
  const [irrigationSystem, setIrrigationSystem] = useState(false);
  const [concierge, setConcierge] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [doubleGlazing, setDoubleGlazing] = useState(false);
  const [underfloorHeating, setUnderfloorHeating] = useState(false);

  const [propertyImages, setPropertyImages] = useState<UploadedFile[]>([]);
  const [propertyVideos, setPropertyVideos] = useState<UploadedFile[]>([]);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [propertyDocs, setPropertyDocs] = useState<UploadedFile[]>([]);
  const [socialSecurityDocs, setSocialSecurityDocs] = useState<UploadedFile[]>(
    [],
  );

  const [submitting, setSubmitting] = useState(false);
  const isRental = listingPurpose === "rent";

  const hasPropertyType = propertyType.trim().length > 0;
  const isResType = (types: Set<string>) =>
    category === "residential" && hasPropertyType && types.has(propertyType);
  const isComType = (types: Set<string>) =>
    category === "commercial" && hasPropertyType && types.has(propertyType);

  const showBedrooms = category === "residential";
  const showRooms = category === "commercial";
  const showBathrooms = category === "residential" || category === "commercial";
  const showFloorLevel =
    isResType(RESIDENTIAL_FLOOR_LEVEL_TYPES) ||
    isComType(COMMERCIAL_FLOOR_LEVEL_TYPES);
  const showParking = category === "residential" || category === "commercial";
  const showFurniture = isResType(RESIDENTIAL_FURNITURE_TYPES);
  const showAreaRange = category === "residential" || category === "commercial";
  const showPlotArea = category === "land";
  const showPropertyAge =
    category === "residential" || category === "commercial";
  const showGovFields = category === "land";
  const showParcelField = category === "land" && hasPropertyType;

  const amenityItems = useMemo(() => {
    const items: {
      key: string;
      label: string;
      checked: boolean;
      set: (v: boolean) => void;
    }[] = [];
    if (isResType(RESIDENTIAL_BALCONY_TYPES))
      items.push({
        key: "balcony",
        label: t("amenityBalcony"),
        checked: balcony,
        set: setBalcony,
      });
    if (isResType(RESIDENTIAL_CLOSET_TYPES))
      items.push({
        key: "builtInCloset",
        label: t("amenityBuiltInCloset"),
        checked: builtInCloset,
        set: setBuiltInCloset,
      });
    if (isResType(RESIDENTIAL_GARDEN_TYPES))
      items.push({
        key: "garden",
        label: t("amenityGarden"),
        checked: garden,
        set: setGarden,
      });
    if (category === "residential" || category === "commercial")
      items.push({
        key: "alarmSystem",
        label: t("amenityAlarmSystem"),
        checked: alarmSystem,
        set: setAlarmSystem,
      });
    if (isResType(RESIDENTIAL_HOME_AUTOMATION_TYPES))
      items.push({
        key: "homeAutomation",
        label: t("amenityHomeAutomation"),
        checked: homeAutomation,
        set: setHomeAutomation,
      });
    if (isResType(RESIDENTIAL_GYM_ACCESS_TYPES))
      items.push({
        key: "gymAccess",
        label: t("amenityGymAccess"),
        checked: gymAccess,
        set: setGymAccess,
      });
    if (category === "residential" || category === "commercial")
      items.push({
        key: "parkingAvailable",
        label: t("amenityParkingAvailable"),
        checked: parkingAvailable,
        set: setParkingAvailable,
      });
    if (category === "residential" || category === "commercial")
      items.push({
        key: "swimmingPool",
        label: t("amenitySwimmingPool"),
        checked: swimmingPool,
        set: setSwimmingPool,
      });
    if (isComType(COMMERCIAL_LOADING_ACCESS_TYPES))
      items.push({
        key: "loadingAccess",
        label: t("amenityLoadingAccess"),
        checked: loadingAccess,
        set: setLoadingAccess,
      });
    if (isComType(COMMERCIAL_DISPLAY_FRONTAGE_TYPES))
      items.push({
        key: "displayFrontage",
        label: t("amenityDisplayFrontage"),
        checked: displayFrontage,
        set: setDisplayFrontage,
      });
    if (isComType(COMMERCIAL_AC_TYPES))
      items.push({
        key: "airConditioning",
        label: t("amenityAirConditioning"),
        checked: airConditioning,
        set: setAirConditioning,
      });
    if (isComType(COMMERCIAL_STORAGE_AREA_TYPES))
      items.push({
        key: "storageArea",
        label: t("amenityStorageArea"),
        checked: storageArea,
        set: setStorageArea,
      });
    if (category === "land")
      items.push({
        key: "roadAccess",
        label: t("amenityRoadAccess"),
        checked: roadAccess,
        set: setRoadAccess,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_UTILITIES_TYPES.has(propertyType)
    )
      items.push({
        key: "utilitiesAvailable",
        label: t("amenityUtilities"),
        checked: utilitiesAvailable,
        set: setUtilitiesAvailable,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_ZONED_USE_TYPES.has(propertyType)
    )
      items.push({
        key: "zonedUse",
        label: t("amenityZonedUse"),
        checked: zonedUse,
        set: setZonedUse,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_WATER_SOURCE_TYPES.has(propertyType)
    )
      items.push({
        key: "waterSource",
        label: t("amenityWaterSource"),
        checked: waterSource,
        set: setWaterSource,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_ELECTRICITY_TYPES.has(propertyType)
    )
      items.push({
        key: "electricityNearby",
        label: t("amenityElectricity"),
        checked: electricityNearby,
        set: setElectricityNearby,
      });
    if (isResType(RESIDENTIAL_MAID_ROOM_TYPES))
      items.push({
        key: "maidsRoom",
        label: t("amenityMaidsRoom"),
        checked: maidsRoom,
        set: setMaidsRoom,
      });
    if (isResType(RESIDENTIAL_STUDY_TYPES))
      items.push({
        key: "studyRoom",
        label: t("amenityStudyRoom"),
        checked: studyRoom,
        set: setStudyRoom,
      });
    if (isResType(RESIDENTIAL_LAUNDRY_TYPES))
      items.push({
        key: "laundryRoom",
        label: t("amenityLaundryRoom"),
        checked: laundryRoom,
        set: setLaundryRoom,
      });
    if (isResType(RESIDENTIAL_CENTRAL_AC_TYPES))
      items.push({
        key: "centralAC",
        label: t("amenityCentralAC"),
        checked: centralAC,
        set: setCentralAC,
      });
    if (isResType(RESIDENTIAL_ELEVATOR_TYPES))
      items.push({
        key: "elevator",
        label: t("amenityElevator"),
        checked: elevator,
        set: setElevator,
      });
    if (isComType(COMMERCIAL_MEETING_ROOM_TYPES))
      items.push({
        key: "meetingRoom",
        label: t("amenityMeetingRoom"),
        checked: meetingRoom,
        set: setMeetingRoom,
      });
    if (isComType(COMMERCIAL_RECEPTION_TYPES))
      items.push({
        key: "receptionArea",
        label: t("amenityReceptionArea"),
        checked: receptionArea,
        set: setReceptionArea,
      });
    if (isComType(COMMERCIAL_CCTV_TYPES))
      items.push({
        key: "cctvSecurity",
        label: t("amenityCctv"),
        checked: cctvSecurity,
        set: setCctvSecurity,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_FENCED_TYPES.has(propertyType)
    )
      items.push({
        key: "fencedBoundary",
        label: t("amenityFenced"),
        checked: fencedBoundary,
        set: setFencedBoundary,
      });
    if (
      category === "land" &&
      hasPropertyType &&
      LAND_IRRIGATION_TYPES.has(propertyType)
    )
      items.push({
        key: "irrigationSystem",
        label: t("amenityIrrigation"),
        checked: irrigationSystem,
        set: setIrrigationSystem,
      });
    if (category === "residential")
      items.push({
        key: "concierge",
        label: t("amenityConcierge"),
        checked: concierge,
        set: setConcierge,
      });
    if (category === "residential")
      items.push({
        key: "petsAllowed",
        label: t("amenityPetsAllowed"),
        checked: petsAllowed,
        set: setPetsAllowed,
      });
    if (category === "residential")
      items.push({
        key: "doubleGlazing",
        label: t("amenityDoubleGlazing"),
        checked: doubleGlazing,
        set: setDoubleGlazing,
      });
    if (category === "residential")
      items.push({
        key: "underfloorHeating",
        label: t("amenityUnderfloorHeating"),
        checked: underfloorHeating,
        set: setUnderfloorHeating,
      });
    return items;
  }, [
    category,
    propertyType,
    hasPropertyType,
    balcony,
    builtInCloset,
    garden,
    alarmSystem,
    homeAutomation,
    gymAccess,
    parkingAvailable,
    swimmingPool,
    loadingAccess,
    displayFrontage,
    airConditioning,
    storageArea,
    roadAccess,
    utilitiesAvailable,
    zonedUse,
    waterSource,
    electricityNearby,
    maidsRoom,
    studyRoom,
    laundryRoom,
    centralAC,
    elevator,
    meetingRoom,
    receptionArea,
    cctvSecurity,
    fencedBoundary,
    irrigationSystem,
    concierge,
    petsAllowed,
    doubleGlazing,
    underfloorHeating,
    t,
  ]);

  const cityOptions = JORDAN_CITIES_WITH_AREAS.map((c) => ({
    value: c.name,
    label: c.name,
  }));
  const areaOptions = city
    ? getAreasByCityName(city).map((a) => ({ value: a, label: a }))
    : [];
  const propertyTypeOptions = CATEGORY_TO_PROPERTY_TYPES[category].map(
    (pt) => ({ value: pt, label: pt }),
  );

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory as CategoryKey);
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setRooms("");
    setFloorLevel("");
    setFurnitureStatus("");
    setPlotArea("");
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
    setSwimmingPool(false);
    setLoadingAccess(false);
    setDisplayFrontage(false);
    setAirConditioning(false);
    setStorageArea(false);
    setRoadAccess(false);
    setUtilitiesAvailable(false);
    setZonedUse(false);
    setWaterSource(false);
    setElectricityNearby(false);
    setMaidsRoom(false);
    setStudyRoom(false);
    setLaundryRoom(false);
    setCentralAC(false);
    setElevator(false);
    setMeetingRoom(false);
    setReceptionArea(false);
    setCctvSecurity(false);
    setFencedBoundary(false);
    setIrrigationSystem(false);
    setConcierge(false);
    setPetsAllowed(false);
    setDoubleGlazing(false);
    setUnderfloorHeating(false);
  };

  const addFiles = useCallback(
    (setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) =>
      (fileList: FileList) => {
        setter((prev) => [...prev, ...createUploadedFiles(fileList)]);
      },
    [],
  );
  const removeFile = useCallback(
    (setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) =>
      (id: string) => {
        setter((prev) => prev.filter((f) => f.id !== id));
      },
    [],
  );

  const updateOwner = useCallback(
    <K extends keyof Omit<OwnerFormState, "id">>(
      ownerId: number,
      field: K,
      value: OwnerFormState[K],
    ) => {
      setOwners((prev) =>
        prev.map((owner) =>
          owner.id === ownerId ? { ...owner, [field]: value } : owner,
        ),
      );
    },
    [],
  );
  const addOwner = useCallback(() => {
    setOwners((prev) => {
      if (prev.length >= 3) return prev;
      const nextId =
        prev.reduce((maxId, owner) => Math.max(maxId, owner.id), 0) + 1;
      return [...prev, createOwner(nextId)];
    });
  }, []);
  const removeOwner = useCallback((ownerId: number) => {
    setOwners((prev) =>
      prev.length > 1 ? prev.filter((owner) => owner.id !== ownerId) : prev,
    );
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const numericPrice = isRental ? Number(rentPrice) || 0 : Number(price) || 0;
    setSubmitting(true);
    try {
      await addListing({
        title: title.trim(),
        type: mapToAgentPropertyType(category, propertyType),
        price: numericPrice,
      });
      router.push(`/${locale}/agent-dashboard/listings`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/agent-dashboard/listings`);
  };

  // Preserve any side-effects the original file had (even if empty for now)
  useEffect(() => {
    void exactLocation;
  }, [exactLocation]);

  return (
    <div className="space-y-6 pb-32">
      <section id="basic-information" className="scroll-mt-28">
        <PropertyFormSection
          icon={<Tag className="h-5 w-5" />}
          title={t("sectionBasicInfo")}
          subtitle={t("sectionBasicInfoHint")}
          headerAction={
            <span className="rounded-full bg-[#ffe24a] px-3 py-1 text-size-xs fw-semibold text-[#23415f]">
              Required
            </span>
          }
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <PropertyFormField
              label={t("listingPurpose")}
              htmlFor="listing-purpose"
              required
            >
              <Select
                id="listing-purpose"
                value={listingPurpose}
                onChange={(e) =>
                  setListingPurpose(e.target.value as StatusTabKey)
                }
                options={[
                  { value: "buy", label: t("purposeBuy") },
                  { value: "rent", label: t("purposeRent") },
                ]}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("category")}
              htmlFor="category"
              required
            >
              <Select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={[
                  { value: "residential", label: t("catResidential") },
                  { value: "commercial", label: t("catCommercial") },
                  { value: "land", label: t("catLand") },
                ]}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("propertyType")}
              htmlFor="property-type"
              required
            >
              <Select
                id="property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                options={propertyTypeOptions}
                placeholder={t("selectPropertyType")}
              />
            </PropertyFormField>

            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                id="is-exclusive"
                checked={isExclusive}
                onChange={(e) =>
                  setIsExclusive((e.target as HTMLInputElement).checked)
                }
              />
              <label
                htmlFor="is-exclusive"
                className="cursor-pointer text-size-sm fw-medium text-charcoal"
              >
                {t("fieldExclusive")}
              </label>
            </div>
          </div>

          <PropertyFormField
            label={t("propertyTitle")}
            htmlFor="property-title"
            required
          >
            <Input
              id="property-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("propertyTitlePlaceholder")}
            />
          </PropertyFormField>

          <PropertyFormField
            label={t("propertyDescription")}
            htmlFor="property-description"
          >
            <Textarea
              id="property-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("propertyDescriptionPlaceholder")}
              rows={4}
            />
          </PropertyFormField>
        </PropertyFormSection>
      </section>

      <section id="location" className="scroll-mt-28">
        <PropertyFormSection
          icon={<MapPin className="h-5 w-5" />}
          title={t("sectionLocation")}
          subtitle={t("sectionLocationHint")}
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <PropertyFormField label={t("fieldCity")} htmlFor="city">
              <Select
                id="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setArea("");
                }}
                options={cityOptions}
                placeholder={t("selectCity")}
              />
            </PropertyFormField>

            <PropertyFormField label={t("fieldArea")} htmlFor="area">
              <Select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                options={areaOptions}
                placeholder={t("selectArea")}
                disabled={!city}
              />
            </PropertyFormField>
          </div>

          <PropertyFormField label={t("fieldAddress")} htmlFor="address">
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder")}
              rows={4}
            />
          </PropertyFormField>

          <div className="space-y-4 rounded-2xl border border-subtle bg-surface/30 p-4">
            <div className="space-y-1">
              <h4 className="text-size-sm fw-semibold text-charcoal">
                {t("exactLocationTitle")}
              </h4>
              <p className="text-size-xs text-charcoal/65">
                {t("exactLocationHint")}
              </p>
            </div>

            <LocationPicker
              city={city}
              area={area}
              address={address}
              onLocationSelect={setExactLocation}
            />
          </div>

          {showGovFields && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <PropertyFormField
                label={t("fieldGovernorate")}
                htmlFor="governorate"
              >
                <Input
                  id="governorate"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  placeholder={t("governoratePlaceholder")}
                />
              </PropertyFormField>
              <PropertyFormField
                label={t("fieldDirectorate")}
                htmlFor="directorate"
              >
                <Input
                  id="directorate"
                  value={directorate}
                  onChange={(e) => setDirectorate(e.target.value)}
                  placeholder={t("directoratePlaceholder")}
                />
              </PropertyFormField>
              <PropertyFormField label={t("fieldVillage")} htmlFor="village">
                <Input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t("villagePlaceholder")}
                />
              </PropertyFormField>
            </div>
          )}

          {showParcelField && (
            <PropertyFormField
              label={t("fieldParcelName")}
              htmlFor="parcel-name"
            >
              <Input
                id="parcel-name"
                value={parcelName}
                onChange={(e) => setParcelName(e.target.value)}
                placeholder={t("parcelNamePlaceholder")}
              />
            </PropertyFormField>
          )}
        </PropertyFormSection>
      </section>

      <section id="property-details" className="scroll-mt-28">
        <PropertyFormSection
          icon={<Building2 className="h-5 w-5" />}
          title={t("sectionDetails")}
          subtitle={t("sectionDetailsHint")}
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showBedrooms && (
              <PropertyFormField label={t("fieldBedrooms")} htmlFor="bedrooms">
                <Select
                  id="bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  options={BEDROOM_OPTIONS.map((v) => ({ value: v, label: v }))}
                  placeholder={t("selectBedrooms")}
                />
              </PropertyFormField>
            )}

            {showRooms && (
              <PropertyFormField label={t("fieldRooms")} htmlFor="rooms">
                <Select
                  id="rooms"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  options={ROOM_OPTIONS.map((v) => ({ value: v, label: v }))}
                  placeholder={t("selectRooms")}
                />
              </PropertyFormField>
            )}

            {showBathrooms && (
              <PropertyFormField
                label={t("fieldBathrooms")}
                htmlFor="bathrooms"
              >
                <Select
                  id="bathrooms"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  options={BATH_OPTIONS.map((v) => ({ value: v, label: v }))}
                  placeholder={t("selectBathrooms")}
                />
              </PropertyFormField>
            )}

            {showAreaRange && (
              <PropertyFormField
                label={t("fieldBuiltUpArea")}
                htmlFor="built-up-area"
              >
                <Input
                  id="built-up-area"
                  type="number"
                  min={0}
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  placeholder={t("builtUpAreaPlaceholder")}
                  rightAdornment={
                    <span className="text-xs text-charcoal/50">sq ft</span>
                  }
                />
              </PropertyFormField>
            )}

            {showPlotArea && (
              <PropertyFormField label={t("fieldPlotArea")} htmlFor="plot-area">
                <Input
                  id="plot-area"
                  type="number"
                  min={0}
                  value={plotArea}
                  onChange={(e) => setPlotArea(e.target.value)}
                  placeholder={t("plotAreaPlaceholder")}
                  rightAdornment={
                    <span className="text-xs text-charcoal/50">sq ft</span>
                  }
                />
              </PropertyFormField>
            )}

            {showFloorLevel && (
              <PropertyFormField
                label={t("fieldFloorLevel")}
                htmlFor="floor-level"
              >
                <Select
                  id="floor-level"
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  options={FLOOR_OPTIONS.map((v) => ({
                    value: v,
                    label:
                      v === "ground"
                        ? "Ground"
                        : v === "penthouse"
                          ? "Penthouse"
                          : `Floor ${v}`,
                  }))}
                  placeholder={t("selectFloorLevel")}
                />
              </PropertyFormField>
            )}

            {showParking && (
              <PropertyFormField label={t("fieldParking")} htmlFor="parking">
                <Select
                  id="parking"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  options={PARKING_OPTIONS.map((v) => ({
                    value: v,
                    label: v === "0" ? "None" : v,
                  }))}
                  placeholder={t("selectParking")}
                />
              </PropertyFormField>
            )}

            {showFurniture && (
              <PropertyFormField
                label={t("fieldFurnitureStatus")}
                htmlFor="furniture-status"
              >
                <Select
                  id="furniture-status"
                  value={furnitureStatus}
                  onChange={(e) => setFurnitureStatus(e.target.value)}
                  options={FURNITURE_OPTIONS.map((v) => ({
                    value: v,
                    label:
                      v.charAt(0).toUpperCase() + v.slice(1).replace("-", " "),
                  }))}
                  placeholder={t("selectFurnitureStatus")}
                />
              </PropertyFormField>
            )}

            {showPropertyAge && (
              <PropertyFormField
                label={t("fieldPropertyAge")}
                htmlFor="property-age"
              >
                <Select
                  id="property-age"
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(e.target.value)}
                  options={PROPERTY_AGE_OPTIONS.map((v) => ({
                    value: v,
                    label: v === "new" ? "New" : `${v} years`,
                  }))}
                  placeholder={t("selectPropertyAge")}
                />
              </PropertyFormField>
            )}

            <PropertyFormField
              label={t("fieldTotalFloors")}
              htmlFor="total-floors"
            >
              <Input
                id="total-floors"
                type="number"
                min={1}
                value={totalFloors}
                onChange={(e) => setTotalFloors(e.target.value)}
                placeholder={t("totalFloorsPlaceholder")}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("fieldCompletionStatus")}
              htmlFor="completion-status"
            >
              <Select
                id="completion-status"
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value)}
                options={COMPLETION_STATUS_OPTIONS.map((v) => ({
                  value: v,
                  label: v
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" "),
                }))}
                placeholder={t("selectCompletionStatus")}
              />
            </PropertyFormField>

            {completionStatus !== "ready" && (
              <PropertyFormField
                label={t("fieldHandoverDate")}
                htmlFor="handover-date"
              >
                <Input
                  id="handover-date"
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                />
              </PropertyFormField>
            )}

            <PropertyFormField label={t("fieldOccupancy")} htmlFor="occupancy">
              <Select
                id="occupancy"
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value)}
                options={OCCUPANCY_OPTIONS.map((v) => ({
                  value: v,
                  label: v
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" "),
                }))}
                placeholder={t("selectOccupancy")}
              />
            </PropertyFormField>

            <PropertyFormField label={t("fieldOwnership")} htmlFor="ownership">
              <Select
                id="ownership"
                value={ownership}
                onChange={(e) => setOwnership(e.target.value)}
                options={OWNERSHIP_OPTIONS.map((v) => ({
                  value: v,
                  label: v.charAt(0).toUpperCase() + v.slice(1),
                }))}
                placeholder={t("selectOwnership")}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("fieldReferenceNumber")}
              htmlFor="reference-number"
            >
              <Input
                id="reference-number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t("referenceNumberPlaceholder")}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("fieldPermitNumber")}
              htmlFor="permit-number"
            >
              <Input
                id="permit-number"
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                placeholder={t("permitNumberPlaceholder")}
              />
            </PropertyFormField>

            <PropertyFormField
              label={t("fieldOrientation")}
              htmlFor="orientation"
            >
              <Select
                id="orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                options={ORIENTATION_OPTIONS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                placeholder={t("selectOrientation")}
              />
            </PropertyFormField>
          </div>
        </PropertyFormSection>
      </section>

      <section id="owner-information" className="scroll-mt-28 space-y-6">
        <div className="rounded-[24px] bg-[#23415f] px-5 py-4 text-white shadow-[0_16px_36px_rgba(35,65,95,0.2)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffe24a] text-[#23415f]">
              <Lightbulb className="h-4 w-4" />
            </div>
            <p className="text-size-sm text-white/90">
              Pro Tip: If the owner is a corporate entity, you will be prompted
              to upload board resolutions in the pricing or document sections.
            </p>
          </div>
        </div>

        {owners.map((owner, index) => (
          <PropertyFormSection
            key={owner.id}
            icon={<User className="h-5 w-5" />}
            title={`${t("sectionOwnerInfo")} ${owners.length > 1 ? `#${index + 1}` : ""}`}
            subtitle={t("sectionOwnerInfoHint")}
            className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <PropertyFormField
                  label={t("ownerName")}
                  htmlFor={`owner-name-${owner.id}`}
                  required
                >
                  <Input
                    id={`owner-name-${owner.id}`}
                    value={owner.name}
                    onChange={(e) =>
                      updateOwner(owner.id, "name", e.target.value)
                    }
                    placeholder={t("ownerNamePlaceholder")}
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("ownerPhone")}
                  htmlFor={`owner-phone-${owner.id}`}
                  required
                >
                  <PhoneNumberInputField
                    value={owner.phone || undefined}
                    onChange={(v) => updateOwner(owner.id, "phone", v ?? "")}
                    placeholder={t("ownerPhonePlaceholder")}
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("ownerEmail")}
                  htmlFor={`owner-email-${owner.id}`}
                >
                  <Input
                    id={`owner-email-${owner.id}`}
                    type="email"
                    value={owner.email}
                    onChange={(e) =>
                      updateOwner(owner.id, "email", e.target.value)
                    }
                    placeholder={t("ownerEmailPlaceholder")}
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("ownerSocialSecurityId")}
                  htmlFor={`owner-social-security-id-${owner.id}`}
                >
                  <Input
                    id={`owner-social-security-id-${owner.id}`}
                    value={owner.socialSecurityId}
                    onChange={(e) =>
                      updateOwner(owner.id, "socialSecurityId", e.target.value)
                    }
                    placeholder={t("ownerSocialSecurityIdPlaceholder")}
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("ownerNationality")}
                  htmlFor={`owner-nationality-${owner.id}`}
                >
                  <Input
                    id={`owner-nationality-${owner.id}`}
                    value={owner.nationality}
                    onChange={(e) =>
                      updateOwner(owner.id, "nationality", e.target.value)
                    }
                    placeholder={t("ownerNationalityPlaceholder")}
                  />
                </PropertyFormField>
              </div>

              <PropertyFormField
                label={t("ownerAddress")}
                htmlFor={`owner-address-${owner.id}`}
              >
                <Textarea
                  id={`owner-address-${owner.id}`}
                  value={owner.address}
                  onChange={(e) =>
                    updateOwner(owner.id, "address", e.target.value)
                  }
                  placeholder={t("ownerAddressPlaceholder")}
                  rows={3}
                />
              </PropertyFormField>

              {owners.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeOwner(owner.id)}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("removeOwner")}
                  </Button>
                </div>
              )}
            </div>
          </PropertyFormSection>
        ))}

        {owners.length < 3 && (
          <button
            type="button"
            onClick={addOwner}
            className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#d7deea] bg-white text-[#23415f] transition-colors hover:border-[#23415f] hover:bg-[#f8fbff]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7fb]">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-size-sm fw-semibold">
              {t("addAnotherOwner")} ({owners.length}/3)
            </span>
          </button>
        )}
      </section>

      <section id="pricing" className="scroll-mt-28">
        <PropertyFormSection
          icon={<DollarSign className="h-5 w-5" />}
          title={t("sectionPricing")}
          subtitle={t("sectionPricingHint")}
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isRental ? (
              <>
                <PropertyFormField
                  label={t("fieldRentFrequency")}
                  htmlFor="rent-frequency"
                  required
                >
                  <Select
                    id="rent-frequency"
                    value={rentFrequency}
                    onChange={(e) => setRentFrequency(e.target.value)}
                    options={RENT_FREQUENCY_OPTIONS.map((v) => ({
                      value: v,
                      label:
                        v.charAt(0).toUpperCase() +
                        v.slice(1).replace("-", " "),
                    }))}
                    placeholder={t("selectRentFrequency")}
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("fieldRentPrice")}
                  htmlFor="rent-price"
                  required
                >
                  <Input
                    id="rent-price"
                    type="number"
                    min={0}
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                    placeholder="0"
                    rightAdornment={
                      <span className="text-xs text-charcoal/50">
                        JOD /{" "}
                        {rentFrequency === "monthly"
                          ? t("monthShortcut")
                          : t("yearShortcut")}
                      </span>
                    }
                  />
                </PropertyFormField>
              </>
            ) : (
              <>
                <PropertyFormField
                  label={t("fieldPrice")}
                  htmlFor="price"
                  required
                >
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    rightAdornment={
                      <span className="text-xs text-charcoal/50">JOD</span>
                    }
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("fieldServiceCharge")}
                  htmlFor="service-charge"
                >
                  <Input
                    id="service-charge"
                    type="number"
                    min={0}
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    placeholder={t("serviceChargePlaceholder")}
                    rightAdornment={
                      <span className="text-xs text-charcoal/50">JOD</span>
                    }
                  />
                </PropertyFormField>

                <PropertyFormField
                  label={t("fieldMaintenanceFee")}
                  htmlFor="maintenance-fee"
                >
                  <Input
                    id="maintenance-fee"
                    type="number"
                    min={0}
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(e.target.value)}
                    placeholder={t("maintenanceFeePlaceholder")}
                    rightAdornment={
                      <span className="text-xs text-charcoal/50">JOD</span>
                    }
                  />
                </PropertyFormField>
              </>
            )}
          </div>
        </PropertyFormSection>
      </section>

      {amenityItems.length > 0 && (
        <section id="features-media" className="scroll-mt-28">
          <PropertyFormSection
            icon={<Sparkles className="h-5 w-5" />}
            title={t("sectionFeatures")}
            subtitle={t("sectionFeaturesHint")}
            className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {amenityItems.map((item) => (
                <label
                  key={item.key}
                  className="group flex cursor-pointer items-center gap-2.5"
                >
                  <Checkbox
                    checked={item.checked}
                    onChange={(e) =>
                      item.set((e.target as HTMLInputElement).checked)
                    }
                  />
                  <span className="text-size-sm fw-medium text-charcoal/85 transition-colors group-hover:text-charcoal">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </PropertyFormSection>
        </section>
      )}

      <section
        id={amenityItems.length > 0 ? undefined : "features-media"}
        className="scroll-mt-28"
      >
        <PropertyFormSection
          icon={<ImageIcon className="h-5 w-5" />}
          title={t("sectionMedia")}
          subtitle={t("sectionMediaHint")}
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h4 className="text-size-sm fw-semibold text-charcoal">
                  {t("mediaSubsectionImages")}
                </h4>
              </div>
              <MediaUploadField
                title={t("imageUploadTitle")}
                description={t("imageUploadDesc")}
                icon={<ImageIcon className="h-5 w-5 text-white" />}
                accentColor="bg-gradient-to-r from-[#1a3b5c] to-[#2a5580]"
                files={propertyImages}
                onFilesAdd={addFiles(setPropertyImages)}
                onFileRemove={removeFile(setPropertyImages)}
                accept=".jpg,.jpeg,.png,.webp,.gif"
                acceptHint="JPG, PNG, WEBP, GIF"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Video className="h-4 w-4" />
                </div>
                <h4 className="text-size-sm fw-semibold text-charcoal">
                  {t("mediaSubsectionVideos")}
                </h4>
              </div>
              <MediaUploadField
                title={t("videoUploadTitle")}
                description={t("videoUploadDesc")}
                icon={<Video className="h-5 w-5 text-white" />}
                accentColor="bg-gradient-to-r from-[#1a3b5c] to-[#2a5580]"
                files={propertyVideos}
                onFilesAdd={addFiles(setPropertyVideos)}
                onFileRemove={removeFile(setPropertyVideos)}
                accept=".mp4,.mov,.webm,.avi"
                acceptHint="MP4, MOV, WEBM, AVI"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <Video className="h-4 w-4" />
                </div>
                <h4 className="text-size-sm fw-semibold text-charcoal">
                  {t("mediaSubsectionYoutube")}
                </h4>
              </div>
              <PropertyFormField
                label={t("fieldYoutubeUrl")}
                htmlFor="youtube-url"
              >
                <Input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                />
              </PropertyFormField>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <Compass className="h-4 w-4" />
                </div>
                <h4 className="text-size-sm fw-semibold text-charcoal">
                  {t("mediaSubsectionVirtualTour")}
                </h4>
              </div>
              <PropertyFormField
                label={t("fieldVirtualTourUrl")}
                htmlFor="virtual-tour-url"
              >
                <Input
                  id="virtual-tour-url"
                  type="url"
                  value={virtualTourUrl}
                  onChange={(e) => setVirtualTourUrl(e.target.value)}
                  placeholder={t("virtualTourUrlPlaceholder")}
                />
              </PropertyFormField>
            </div>
          </div>
        </PropertyFormSection>
      </section>

      <section id="review-submit" className="scroll-mt-28">
        <PropertyFormSection
          icon={<FileText className="h-5 w-5" />}
          title={t("sectionDocuments")}
          subtitle={t("sectionDocumentsHint")}
          className="rounded-[28px] border-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <DocumentUploadField
              title={t("propertyDocsTitle")}
              description={t("propertyDocsDesc")}
              icon={<FileText className="h-5 w-5 text-white" />}
              files={propertyDocs}
              onFilesAdd={addFiles(setPropertyDocs)}
              onFileRemove={removeFile(setPropertyDocs)}
            />
            <DocumentUploadField
              title={t("socialSecurityDocsTitle")}
              description={t("socialSecurityDocsDesc")}
              icon={<ShieldCheck className="h-5 w-5 text-white" />}
              files={socialSecurityDocs}
              onFilesAdd={addFiles(setSocialSecurityDocs)}
              onFileRemove={removeFile(setSocialSecurityDocs)}
            />
          </div>
        </PropertyFormSection>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-subtle bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="min-w-28"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("cancelForm")}
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
            >
              {t("saveAsDraft")}
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
              className="min-w-32"
            >
              {submitting ? t("saving") : "Next"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
