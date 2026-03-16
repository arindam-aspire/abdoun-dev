"use client";

import type * as React from "react";
import { Button, Input, PhoneNumberInputField } from "@/components/ui";

export interface ManualAgentInputFormProps {
  fullName: string;
  email: string;
  phone: string | undefined;
  serviceArea: string;
  loading?: boolean;
  fullNameError?: string;
  emailError?: string;
  phoneError?: string;
  serviceAreaError?: string;
  onFocusFullName?: () => void;
  onFocusEmail?: () => void;
  onFocusPhone?: () => void;
  onFocusServiceArea?: () => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string | undefined) => void;
  onServiceAreaChange: (value: string) => void;
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
  onSubmit,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onServiceAreaChange,
}: ManualAgentInputFormProps) {
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
        showCountryCode={true}
        onChange={onPhoneChange}
        placeholder="Phone number"
        error={phoneError}
        onFocus={onFocusPhone}
        fieldClassName="h-10 rounded-xl"
      />
      <Input
        type="text"
        value={serviceArea}
        onChange={(event) => onServiceAreaChange(event.target.value)}
        placeholder="Service area"
        required
        error={serviceAreaError}
        onFocus={onFocusServiceArea}
        className="h-10 rounded-xl"
      />
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-10 w-full rounded-xl text-white"
      >
        {loading ? "Onboarding..." : "Onboard agent"}
      </Button>
    </form>
  );
}

