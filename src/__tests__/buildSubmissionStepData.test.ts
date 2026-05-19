import {
  buildStepData,
  parseNum,
} from "@/features/agent/dashboard/lib/buildSubmissionStepData";
import { resolveLocationIdsForPayload } from "@/features/agent/dashboard/lib/submissionReferenceIds";
import type { AddPropertyWizardState } from "@/features/agent/dashboard/components/add-property/addPropertyWizardSlice";
import { createEmptyAddPropertyWizardState } from "@/features/agent/dashboard/components/add-property/addPropertyWizardSlice";
import type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";

const taxonomy: LocationTaxonomyCity[] = [
  { id: 2, name: "Amman", areas: [{ id: 20, name: "Abdoun" }] },
];

function baseState(): AddPropertyWizardState {
  return {
    ...createEmptyAddPropertyWizardState(),
    city: "Amman",
    cityId: 2,
    selectedAreas: ["Abdoun"],
    areaId: 20,
    price: "1,600",
    serviceFee: "50",
    maintenanceFee: "",
  };
}

describe("parseNum", () => {
  it("strips thousands separators", () => {
    expect(parseNum("1,600")).toBe(1600);
    expect(parseNum(" 2 500 ")).toBe(2500);
  });
});

describe("resolveLocationIdsForPayload", () => {
  it("returns Redux ids when set", () => {
    const s = baseState();
    expect(resolveLocationIdsForPayload(s, taxonomy)).toEqual({
      city_id: 2,
      area_id: 20,
    });
  });

  it("resolves area id from taxonomy labels when areaId is missing", () => {
    const s = { ...baseState(), areaId: null };
    expect(resolveLocationIdsForPayload(s, taxonomy)).toEqual({
      city_id: 2,
      area_id: 20,
    });
  });

  it("returns null when city or area is not selected", () => {
    const s = { ...baseState(), city: "", selectedAreas: [], areaId: null, cityId: null };
    expect(resolveLocationIdsForPayload(s, taxonomy)).toBeNull();
  });
});

describe("buildStepData", () => {
  it("includes location ids and parsed pricing in API payload sections", () => {
    const location = buildStepData("location", baseState(), taxonomy);
    expect(location).toEqual({
      city_id: 2,
      area_id: 20,
      address: "",
    });

    const pricing = buildStepData("pricing", baseState(), taxonomy);
    expect(pricing).toEqual({
      price: 1600,
      currency: "JOD",
      service_charge: 50,
    });
  });
});
