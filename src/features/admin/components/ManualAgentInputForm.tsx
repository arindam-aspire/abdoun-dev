"use client";

import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Input, PhoneNumberInputField } from "@/components/ui";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { cn } from "@/lib/cn";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/constants/jordanCities";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  fetchLocationTaxonomyIfNeeded,
  selectLocationTaxonomyState,
  selectServiceAreaOptions,
} from "@/features/location-taxonomy/locationTaxonomySlice";

const FALLBACK_SERVICE_AREA_OPTIONS = Array.from(
  new Set(JORDAN_CITIES_WITH_AREAS.flatMap((city) => city.areas)),
)
  .sort((a, b) => a.localeCompare(b))
  .map((area) => ({ value: area, label: area }));

export interface ManualAgentInputFormProps {
  fullName: string;
  email: string;
  phone: string | undefined;
  serviceArea: string[];
  loading?: boolean;
  fullNameError?: string;
  emailError?: string;
  phoneError?: string;
  serviceAreaError?: string;
  onFocusFullName?: () => void;
  onFocusEmail?: () => void;
  onFocusPhone?: () => void;
  onFocusServiceArea?: () => void;
  onBack?: () => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string | undefined) => void;
  onServiceAreaChange: (value: string[]) => void;
}

export function ManualAgentInputForm({
  fullName,
  email,
  phone,
  serviceArea,
  loading = false,
  fullNameError,
  emailError,
  phoneError,
  serviceAreaError,
  onFocusFullName,
  onFocusEmail,
  onFocusPhone,
  onFocusServiceArea,
  onBack,
  onSubmit,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onServiceAreaChange,
}: ManualAgentInputFormProps) {
  const dispatch = useAppDispatch();
  const taxonomy = useAppSelector(selectLocationTaxonomyState);
  const serviceAreaOptionsFromStore = useAppSelector(selectServiceAreaOptions);
  const [isServiceAreaOpen, setIsServiceAreaOpen] = useState(false);
  const [serviceAreaQuery, setServiceAreaQuery] = useState("");
  const serviceAreaTriggerRef = useRef<HTMLButtonElement>(null);
  const selectedServiceAreaLabel =
    serviceArea.length > 0 ? serviceArea.join(", ") : "Select service area";

  useEffect(() => {
    void dispatch(fetchLocationTaxonomyIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    if (!isServiceAreaOpen && serviceAreaQuery) {
      setServiceAreaQuery("");
    }
  }, [isServiceAreaOpen, serviceAreaQuery]);

  const serviceAreaOptions = useMemo(() => {
    return serviceAreaOptionsFromStore.length
      ? serviceAreaOptionsFromStore
      : FALLBACK_SERVICE_AREA_OPTIONS;
  }, [serviceAreaOptionsFromStore]);

  const filteredServiceAreaOptions = useMemo(() => {
    const q = serviceAreaQuery.trim().toLowerCase();
    if (!q) return serviceAreaOptions;
    return serviceAreaOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [serviceAreaOptions, serviceAreaQuery]);

  return (
    <form className="mt-3 space-y-3" onSubmit={onSubmit}>
      <Input
        type="text"
        value={fullName}
        onChange={(event) => onFullNameChange(event.target.value)}
        placeholder="Full name"
        required
        error={fullNameError}
        onFocus={onFocusFullName}
        className="h-10 rounded-xl"
      />
      <Input
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="agent@example.com"
        required
        error={emailError}
        onFocus={onFocusEmail}
        className="h-10 rounded-xl"
      />
      <PhoneNumberInputField
        value={phone}
        onChange={onPhoneChange}
        placeholder="Phone number"
        error={phoneError}
        onFocus={onFocusPhone}
        fieldClassName="h-10 rounded-xl"
      />
      <div className="relative">
        <button
          ref={serviceAreaTriggerRef}
          type="button"
          onFocus={onFocusServiceArea}
          onClick={() => setIsServiceAreaOpen((open) => !open)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-size-sm shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            serviceAreaError
              ? "border-red-500 ring-2 ring-red-500/20"
              : "border-zinc-300",
          )}
        >
          <span
            className={cn(
              "truncate",
              serviceArea.length > 0 ? "text-zinc-900" : "text-zinc-500",
            )}
          >
            {selectedServiceAreaLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        </button>
        <HeroDropdown
          isOpen={isServiceAreaOpen}
          onClose={() => setIsServiceAreaOpen(false)}
          align="left"
          anchorRef={serviceAreaTriggerRef}
        >
          <div className="w-full rounded-xl border border-zinc-200 bg-white p-2 shadow-lg focus:outline-none">
            <div className="pb-2">
              <Input
                type="text"
                value={serviceAreaQuery}
                onChange={(e) => setServiceAreaQuery(e.target.value)}
                placeholder="Search service area..."
                className="h-9 rounded-lg"
                onFocus={onFocusServiceArea}
              />
            </div>

            <div className="max-h-56 w-full overflow-y-auto">
              {taxonomy.status === "loading" && serviceAreaOptions.length === 0 ? (
                <div className="p-2 text-size-sm text-zinc-500">Loading service areas…</div>
              ) : null}
              {filteredServiceAreaOptions.length === 0 ? (
                <div className="p-2 text-size-sm text-zinc-500">No matches.</div>
              ) : null}
              {filteredServiceAreaOptions.map((option) => {
                const isSelected = serviceArea.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-size-sm hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onFocus={onFocusServiceArea}
                      onChange={() => {
                        const nextServiceAreas = isSelected
                          ? serviceArea.filter((area) => area !== option.value)
                          : [...serviceArea, option.value];
                        onServiceAreaChange(nextServiceAreas);
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                    <span className="text-zinc-800">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </HeroDropdown>
      </div>
      {serviceAreaError ? (
        <p className="mt-1.5 text-size-sm text-red-600" role="alert">
          {serviceAreaError}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          className="h-10 flex-1 rounded-xl"
          onClick={() => onBack?.()}
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-10 flex-1 rounded-xl text-white"
        >
          {loading ? "Onboarding..." : "Onboard agent"}
        </Button>
      </div>
    </form>
  );
}

