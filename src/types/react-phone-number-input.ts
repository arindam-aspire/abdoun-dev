declare module "react-phone-number-input" {
  import type { ComponentType } from "react";

  export interface CountrySelectProps {
    value?: string;
    options: Array<{ value: string; label: string; divider?: boolean }>;
    onChange: (value: string | undefined) => void;
    onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    name?: string;
    "aria-label"?: string;
    className?: string;
    iconComponent?: React.ComponentType<{
      country: string;
      label: string;
      "aria-hidden"?: boolean;
      aspectRatio?: number;
    }>;
  }

  export interface PhoneInputProps {
    value?: string;
    onChange?: (value: string | undefined) => void;
    onFocus?: () => void;
    defaultCountry?: string;
    international?: boolean;
    countryCallingCodeEditable?: boolean;
    addInternationalOption?: boolean;
    countrySelectComponent?: ComponentType<CountrySelectProps>;
    labels?: Partial<Record<string, string>>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    dir?: "ltr" | "rtl";
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }

  const PhoneInput: ComponentType<PhoneInputProps>;
  export default PhoneInput;
}

declare module "react-phone-number-input/style.css" {
  const url: string;
  export default url;
}
