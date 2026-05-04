"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { HeroAreaSelect } from "@/features/public-home/components/HeroAreaSelect";
import { HeroCitySelect } from "@/features/public-home/components/HeroCitySelect";
import { getAreasByCityName } from "@/lib/constants/jordanCities";
import type { AppLocale } from "@/i18n/routing";
import { useLocationTaxonomy } from "../../../hooks/useLocationTaxonomy";

import {
  CardSection,
  FieldLabel,
  FormField,
  wizardTextareaClassName,
} from "../AddPropertyStepLayout";
import {
  selectAddPropertyIsEditable,
  selectAddPropertyWizard,
  setAddress,
  setCity,
  setCityId,
  setAreaId,
  setSelectedAreas,
} from "../addPropertyWizardSlice";

type LocationDropdownKey = "city" | "area" | null;

export function LocationStep() {
  const locale = useLocale() as AppLocale;
  const dispatch = useAppDispatch();
  const canEdit = useAppSelector(selectAddPropertyIsEditable);
  const { city, selectedAreas, address } = useAppSelector(selectAddPropertyWizard);
  const [openDropdown, setOpenDropdown] = useState<LocationDropdownKey>(null);
  const { cities: taxonomyCities } = useLocationTaxonomy();

  const cities = useMemo(
    () =>
      (taxonomyCities ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        areas: (c.areas ?? []).map((a) => ({ id: a.id, name: a.name })),
      })),
    [taxonomyCities],
  );

  const isRtl = locale === "ar";

  const areaOptions = useMemo(() => {
    if (!city) return [];
    const fromApi = cities.find((c) => c.name === city)?.areas ?? [];
    const names = fromApi.map((a) => a.name).filter(Boolean);
    return names.length ? names : getAreasByCityName(city);
  }, [city, cities]);

  const toggleDropdown = (key: Exclude<LocationDropdownKey, null>) => {
    setOpenDropdown((current) => (current === key ? null : key));
  };

  const closeDropdown = (key: Exclude<LocationDropdownKey, null>) => {
    setOpenDropdown((current) => (current === key ? null : current));
  };

  return (
    <CardSection
      title="Location"
      description="Add the listing location details so the property is easy to identify, map, and review internally."
      required
      readOnlyForm={!canEdit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField>
          <FieldLabel htmlFor="location-city" label="City" required />
          <div id="location-city">
            <HeroCitySelect
              label="City"
              placeholder="Select city"
              value={city}
              isOpen={openDropdown === "city"}
              onToggle={() => toggleDropdown("city")}
              onClose={() => closeDropdown("city")}
              onChange={(nextCity) => {
                dispatch(setCity(nextCity));
                const match = cities.find((c) => c.name === nextCity);
                dispatch(setCityId(match?.id ?? null));
                dispatch(setAreaId(null));
              }}
              isRtl={isRtl}
              cities={cities.length ? cities.map(({ id, name }) => ({ id, name })) : undefined}
            />
          </div>
        </FormField>

        <FormField>
          <FieldLabel htmlFor="location-area" label="Community / Area" required />
          <div id="location-area">
            <HeroAreaSelect
              label="Area"
              placeholder="Select area"
              selectedAreas={selectedAreas}
              isOpen={openDropdown === "area"}
              onToggle={() => toggleDropdown("area")}
              onClose={() => closeDropdown("area")}
              onSelectionChange={(areas) => {
                dispatch(setSelectedAreas(areas));
                const first = areas[0]?.trim() ?? "";
                const matchCity = cities.find((c) => c.name === city);
                const matchArea = matchCity?.areas.find((a) => a.name === first);
                dispatch(setAreaId(matchArea?.id ?? null));
              }}
              areaOptions={areaOptions}
              disabled={!city}
              isRtl={isRtl}
            />
          </div>
        </FormField>

        <FormField className="md:col-span-2">
          <FieldLabel htmlFor="address" label="Address" />
          <Textarea
            id="address"
            value={address}
            onChange={(event) => dispatch(setAddress(event.target.value))}
            placeholder="Building, street, area landmarks, and direction notes"
            rows={4}
            className={wizardTextareaClassName}
          />
        </FormField>
      </div>
    </CardSection>
  );
}
