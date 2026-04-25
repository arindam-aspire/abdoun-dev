"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { cn } from "@/lib/cn";

import {
  CardSection,
  FieldLabel,
  FormField,
  wizardFieldClassName,
  wizardTextareaClassName,
} from "../AddPropertyStepLayout";
import {
  selectAddPropertyWizard,
  setCategory,
  setDescription,
  setListingPurpose,
  setPropertyTitle,
  setPropertyType,
} from "../addPropertyWizardSlice";
import type { Category, ListingPurpose } from "../addPropertyWizard.types";

type DropdownOption = {
  value: string;
  label: string;
};

interface WizardDropdownSelectProps {
  id: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
}

function WizardDropdownSelect({
  id,
  value,
  options,
  placeholder = "Select option",
  isOpen,
  onToggle,
  onClose,
  onChange,
}: WizardDropdownSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="relative">
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={cn(
          "flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-[#b8c8ea] bg-white px-4 text-left text-sm text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.12)]",
        )}
        onClick={onToggle}
      >
        <span
          className={cn(
            "w-full truncate",
            selectedLabel
              ? "font-medium text-slate-700"
              : "font-normal text-slate-500",
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      <HeroDropdown
        isOpen={isOpen}
        onClose={onClose}
        align="left"
        anchorRef={triggerRef}
        closeOnSelect
      >
        <div className="w-full rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                  value === option.value
                    ? "bg-surface text-secondary"
                    : "text-charcoal",
                )}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </HeroDropdown>
    </div>
  );
}

function getPropertyTypeOptions(category: Category) {
  if (category === "commercial") {
    return [
      { value: "office", label: "Office" },
      { value: "shop", label: "Shop" },
      { value: "warehouse", label: "Warehouse" },
    ];
  }

  if (category === "land") {
    return [
      { value: "residential-land", label: "Residential Land" },
      { value: "commercial-land", label: "Commercial Land" },
      { value: "farm-land", label: "Farm Land" },
    ];
  }

  return [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "building", label: "Building" },
  ];
}

export function BasicInformationStep() {
  const dispatch = useAppDispatch();
  const { listingPurpose, category, propertyType, propertyTitle, description } =
    useAppSelector(selectAddPropertyWizard);
  const [openDropdown, setOpenDropdown] = useState<
    "listingPurpose" | "category" | "propertyType" | null
  >(null);
  const propertyTypeOptions = getPropertyTypeOptions(category);

  return (
    <CardSection
      title="Basic Information"
      description="Enter the primary legal basic information details for this property record. This information will be used for official ledger entries and contract generation."
      required
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField>
          <FieldLabel
            htmlFor="listing-purpose"
            label="Listing Purpose"
            required
          />
          <WizardDropdownSelect
            id="listing-purpose"
            value={listingPurpose}
            onChange={(nextValue) =>
              dispatch(setListingPurpose(nextValue as ListingPurpose))
            }
            isOpen={openDropdown === "listingPurpose"}
            onToggle={() =>
              setOpenDropdown((current) =>
                current === "listingPurpose" ? null : "listingPurpose",
              )
            }
            onClose={() =>
              setOpenDropdown((current) =>
                current === "listingPurpose" ? null : current,
              )
            }
            options={[
              { value: "sale", label: "For Sale" },
              { value: "rent", label: "For Rent" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="category" label="Category" required />
          <WizardDropdownSelect
            id="category"
            value={category}
            onChange={(nextValue) =>
              dispatch(setCategory(nextValue as Category))
            }
            isOpen={openDropdown === "category"}
            onToggle={() =>
              setOpenDropdown((current) =>
                current === "category" ? null : "category",
              )
            }
            onClose={() =>
              setOpenDropdown((current) =>
                current === "category" ? null : current,
              )
            }
            options={[
              { value: "residential", label: "Residential" },
              { value: "commercial", label: "Commercial" },
              { value: "land", label: "Land" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="property-type" label="Property Type" required />
          <WizardDropdownSelect
            id="property-type"
            value={propertyType}
            onChange={(nextValue) => dispatch(setPropertyType(nextValue))}
            isOpen={openDropdown === "propertyType"}
            onToggle={() =>
              setOpenDropdown((current) =>
                current === "propertyType" ? null : "propertyType",
              )
            }
            onClose={() =>
              setOpenDropdown((current) =>
                current === "propertyType" ? null : current,
              )
            }
            options={propertyTypeOptions}
            placeholder="Select property type"
          />
        </FormField>

        <FormField>
          <FieldLabel
            htmlFor="property-title"
            label="Property Title"
            required
          />
          <Input
            id="property-title"
            value={propertyTitle}
            onChange={(event) => dispatch(setPropertyTitle(event.target.value))}
            placeholder="Enter property title"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField className="md:col-span-2">
          <FieldLabel htmlFor="property-description" label="Description" />
          <Textarea
            id="property-description"
            value={description}
            onChange={(event) => dispatch(setDescription(event.target.value))}
            placeholder="Describe the property, key features, views, and any standout details"
            rows={6}
            className={wizardTextareaClassName}
          />
        </FormField>
      </div>
    </CardSection>
  );
}
