"use client";

import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";

import {
  CardSection,
  FieldLabel,
  FormField,
  wizardFieldClassName,
} from "../AddPropertyStepLayout";
import {
  selectAddPropertyWizard,
  setMaintenanceFee,
  setPrice,
  setServiceFee,
} from "../addPropertyWizardSlice";

export function PricingStep() {
  const dispatch = useAppDispatch();
  const { price, maintenanceFee, serviceFee } = useAppSelector(selectAddPropertyWizard);

  return (
    <CardSection
      title="Pricing"
      description="Enter the primary price for this property record. This information will be used for official ledger entries and contract generation."
      required
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField>
          <FieldLabel htmlFor="price" label="Price" />
          <Input
            id="price"
            value={price}
            onChange={(event) => dispatch(setPrice(event.target.value))}
            placeholder="JOD"
            className={wizardFieldClassName}
          />
        </FormField>

        <FormField>
          <FieldLabel htmlFor="maintenance-fee" label="Maintenance Fee" />
          <Input
            id="maintenance-fee"
            value={maintenanceFee}
            onChange={(event) => dispatch(setMaintenanceFee(event.target.value))}
            placeholder="JOD"
            className={wizardFieldClassName}
          />
        </FormField>
        <FormField>
          <FieldLabel htmlFor="service-fee" label="Service Charge" />
          <Input
            id="service-fee"
            value={serviceFee}
            onChange={(event) => dispatch(setServiceFee(event.target.value))}
            placeholder="JOD"
            className={wizardFieldClassName}
          />
        </FormField>
      </div>
    </CardSection>
  );
}
