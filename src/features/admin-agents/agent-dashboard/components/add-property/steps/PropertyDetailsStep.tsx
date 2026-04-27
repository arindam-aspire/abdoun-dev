"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { cn } from "@/lib/cn";
import {
  CardSection,
  FieldLabel,
  FormField,
  wizardFieldClassName,
} from "../AddPropertyStepLayout";
import { selectAddPropertyIsEditable, selectAddPropertyWizard, setPropertyDetailsField } from "../addPropertyWizardSlice";

type DropdownOption = {
  value: string;
  label: string;
};

type PropertyDetailsDropdownKey =
  | "bedrooms"
  | "bathrooms"
  | "parkingSpaces"
  | "propertyAge"
  | "completionStatus"
  | "occupancy"
  | "ownershipType"
  | "orientation";

interface WizardDropdownSelectProps {
  id: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
}

function WizardDropdownSelect({
  id,
  value,
  options,
  placeholder,
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
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-[#b8c8ea] bg-white px-4 text-left text-sm text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(26,59,92,0.12)]"
        onClick={onToggle}
      >
        <span className={cn("w-full truncate", selectedLabel ? "font-medium text-slate-700" : "font-normal text-slate-500")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      <HeroDropdown isOpen={isOpen} onClose={onClose} align="left" anchorRef={triggerRef} closeOnSelect>
        <div className="w-full rounded-2xl border border-subtle bg-white p-2 text-size-sm shadow-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1 [scrollbar-width:thin]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-size-sm transition hover:bg-surface",
                  value === option.value ? "bg-surface text-secondary" : "text-charcoal",
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

export function PropertyDetailsStep() {
  const dispatch = useAppDispatch();
  const canEdit = useAppSelector(selectAddPropertyIsEditable);
  const { propertyDetails } = useAppSelector(selectAddPropertyWizard);
  const [openDropdown, setOpenDropdown] = useState<PropertyDetailsDropdownKey | null>(null);

  return (
    <CardSection
      title="Property Details"
      description="Enter the primary legal property details for this property record. This information will be used for official ledger entries and contract generation."
      required
      readOnlyForm={!canEdit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField>
          <FieldLabel htmlFor="bedrooms" label="Bedrooms" />
          <WizardDropdownSelect
            id="bedrooms"
            value={propertyDetails.bedrooms}
            placeholder="Select"
            isOpen={openDropdown === "bedrooms"}
            onToggle={() => setOpenDropdown((current) => (current === "bedrooms" ? null : "bedrooms"))}
            onClose={() => setOpenDropdown((current) => (current === "bedrooms" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "bedrooms", value }))}
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="bathrooms" label="Bathrooms" />
          <WizardDropdownSelect
            id="bathrooms"
            value={propertyDetails.bathrooms}
            placeholder="Select"
            isOpen={openDropdown === "bathrooms"}
            onToggle={() => setOpenDropdown((current) => (current === "bathrooms" ? null : "bathrooms"))}
            onClose={() => setOpenDropdown((current) => (current === "bathrooms" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "bathrooms", value }))}
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="built-up-area" label="Built-up Area" />
          <Input
            id="built-up-area"
            value={propertyDetails.builtUpArea}
            onChange={(event) => dispatch(setPropertyDetailsField({ key: "builtUpArea", value: event.target.value }))}
            placeholder="e.g 2500"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="parking-spaces" label="Parking Spaces" />
          <WizardDropdownSelect
            id="parking-spaces"
            value={propertyDetails.parkingSpaces}
            placeholder="Select"
            isOpen={openDropdown === "parkingSpaces"}
            onToggle={() => setOpenDropdown((current) => (current === "parkingSpaces" ? null : "parkingSpaces"))}
            onClose={() => setOpenDropdown((current) => (current === "parkingSpaces" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "parkingSpaces", value }))}
            options={[
              { value: "0", label: "0" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3+" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="property-age" label="Property Age" />
          <WizardDropdownSelect
            id="property-age"
            value={propertyDetails.propertyAge}
            placeholder="Select an age"
            isOpen={openDropdown === "propertyAge"}
            onToggle={() => setOpenDropdown((current) => (current === "propertyAge" ? null : "propertyAge"))}
            onClose={() => setOpenDropdown((current) => (current === "propertyAge" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "propertyAge", value }))}
            options={[
              { value: "new", label: "New" },
              { value: "1-5", label: "1 - 5 years" },
              { value: "6-10", label: "6 - 10 years" },
              { value: "10+", label: "10+ years" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="completion-status" label="Completion Status" />
          <WizardDropdownSelect
            id="completion-status"
            value={propertyDetails.completionStatus}
            placeholder="Select Status"
            isOpen={openDropdown === "completionStatus"}
            onToggle={() => setOpenDropdown((current) => (current === "completionStatus" ? null : "completionStatus"))}
            onClose={() => setOpenDropdown((current) => (current === "completionStatus" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "completionStatus", value }))}
            options={[
              { value: "ready", label: "Ready" },
              { value: "off-plan", label: "Off Plan" },
              { value: "under-construction", label: "Under Construction" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="total-floors" label="Total Floors" />
          <Input
            id="total-floors"
            value={propertyDetails.totalFloors}
            onChange={(event) => dispatch(setPropertyDetailsField({ key: "totalFloors", value: event.target.value }))}
            placeholder="e.g 5"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="occupancy" label="Occupancy" />
          <WizardDropdownSelect
            id="occupancy"
            value={propertyDetails.occupancy}
            placeholder="Select Occupancy"
            isOpen={openDropdown === "occupancy"}
            onToggle={() => setOpenDropdown((current) => (current === "occupancy" ? null : "occupancy"))}
            onClose={() => setOpenDropdown((current) => (current === "occupancy" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "occupancy", value }))}
            options={[
              { value: "vacant", label: "Vacant" },
              { value: "owner-occupied", label: "Owner Occupied" },
              { value: "tenant-occupied", label: "Tenant Occupied" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="ownership-type" label="Ownership Type" />
          <WizardDropdownSelect
            id="ownership-type"
            value={propertyDetails.ownershipType}
            placeholder="Select Ownership"
            isOpen={openDropdown === "ownershipType"}
            onToggle={() => setOpenDropdown((current) => (current === "ownershipType" ? null : "ownershipType"))}
            onClose={() => setOpenDropdown((current) => (current === "ownershipType" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "ownershipType", value }))}
            options={[
              { value: "freehold", label: "Freehold" },
              { value: "leasehold", label: "Leasehold" },
            ]}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="reference-number" label="Reference Number" />
          <Input
            id="reference-number"
            value={propertyDetails.referenceNumber}
            onChange={(event) =>
              dispatch(setPropertyDetailsField({ key: "referenceNumber", value: event.target.value }))
            }
            placeholder="e.g REF-1056"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="permit-number" label="Permit/DLD Number" />
          <Input
            id="permit-number"
            value={propertyDetails.permitNumber}
            onChange={(event) => dispatch(setPropertyDetailsField({ key: "permitNumber", value: event.target.value }))}
            placeholder="e.g 12246799"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="orientation" label="Orientation" />
          <WizardDropdownSelect
            id="orientation"
            value={propertyDetails.orientation}
            placeholder="Select direction"
            isOpen={openDropdown === "orientation"}
            onToggle={() => setOpenDropdown((current) => (current === "orientation" ? null : "orientation"))}
            onClose={() => setOpenDropdown((current) => (current === "orientation" ? null : current))}
            onChange={(value) => dispatch(setPropertyDetailsField({ key: "orientation", value }))}
            options={[
              { value: "north", label: "North" },
              { value: "south", label: "South" },
              { value: "east", label: "East" },
              { value: "west", label: "West" },
            ]}
          />
        </FormField>
      </div>
    </CardSection>
  );
}
