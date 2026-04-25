"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { HeroAreaSelect } from "@/features/public-home/components/HeroAreaSelect";
import { HeroCitySelect } from "@/features/public-home/components/HeroCitySelect";
import { getAreasByCityName } from "@/lib/mocks/jordanCities";
import type { AppLocale } from "@/i18n/routing";

import {
  CardSection,
  FieldLabel,
  FormField,
  wizardTextareaClassName,
} from "../AddPropertyStepLayout";
import {
  selectAddPropertyWizard,
  setAddress,
  setCity,
  setSelectedAreas,
} from "../addPropertyWizardSlice";

type LocationDropdownKey = "city" | "area" | null;

export function LocationStep() {
  const locale = useLocale() as AppLocale;
  const dispatch = useAppDispatch();
  const { city, selectedAreas, address } = useAppSelector(selectAddPropertyWizard);
  const [openDropdown, setOpenDropdown] = useState<LocationDropdownKey>(null);

  const isRtl = locale === "ar";
  const areaOptions = city ? getAreasByCityName(city) : [];

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
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField>
          <FieldLabel htmlFor="location-city" label="City" />
          <div id="location-city">
            <HeroCitySelect
              label="City"
              placeholder="Select city"
              value={city}
              isOpen={openDropdown === "city"}
              onToggle={() => toggleDropdown("city")}
              onClose={() => closeDropdown("city")}
              onChange={(nextCity) => dispatch(setCity(nextCity))}
              isRtl={isRtl}
            />
          </div>
        </FormField>

        <FormField>
          <FieldLabel htmlFor="location-area" label="Community / Area" />
          <div id="location-area">
            <HeroAreaSelect
              label="Area"
              placeholder="Select area"
              selectedAreas={selectedAreas}
              isOpen={openDropdown === "area"}
              onToggle={() => toggleDropdown("area")}
              onClose={() => closeDropdown("area")}
              onSelectionChange={(areas) => dispatch(setSelectedAreas(areas))}
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
