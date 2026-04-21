"use client";

import { useRef, useState } from "react";
import { User, Phone, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthPopupField } from "@/components/auth/AuthPopupField";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/cn";
import { getPhoneValidationError } from "@/lib/phoneValidation";
import { JORDAN_CITIES_WITH_AREAS } from "@/lib/mocks/jordanCities";

const SERVICE_AREA_OPTIONS = Array.from(new Set(JORDAN_CITIES_WITH_AREAS.flatMap((city) => city.areas))).sort(
  (firstArea, secondArea) => firstArea.localeCompare(secondArea),
);

export interface AgentInviteFormPayload {
  name: string;
  phone: string;
  serviceArea: string;
}

interface AgentInviteFormProps {
  email: string;
  onSubmit: (payload: AgentInviteFormPayload) => Promise<void>;
  error: string | null;
  success: boolean;
}

export function AgentInviteForm({ email, onSubmit, error, success }: AgentInviteFormProps) {
  const t = useTranslations("agentAuth");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState<string[]>([]);
  const [isServiceAreaOpen, setIsServiceAreaOpen] = useState(false);
  const serviceAreaTriggerRef = useRef<HTMLButtonElement>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [serviceAreaTouched, setServiceAreaTouched] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [serviceAreaError, setServiceAreaError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const validateName = () => {
    setNameTouched(true);
    const trimmed = name.trim();
    const next = !trimmed ? t("inviteNameRequired") : undefined;
    setNameError(next);
  };

  const validatePhone = () => {
    setPhoneTouched(true);
    const next = getPhoneValidationError(phone || undefined, true);
    if (!next) {
      setPhoneError(undefined);
      return;
    }
    if (!phone?.trim()) {
      setPhoneError(undefined);
      return;
    }
    setPhoneError(t("invitePhoneInvalid"));
  };

  const validateServiceArea = () => {
    setServiceAreaTouched(true);
    const next = serviceArea.length === 0 ? t("inviteServiceAreaRequired") : undefined;
    setServiceAreaError(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setServiceAreaTouched(true);

    const trimmedName = name.trim();
    const trimmedPhone = (phone ?? "").trim();
    const serviceAreaValue = serviceArea.join(", ");

    const nextNameError = !trimmedName ? t("inviteNameRequired") : undefined;
    const phoneValidationError = getPhoneValidationError(trimmedPhone || undefined, true);
    const nextPhoneError = phoneValidationError
      ? trimmedPhone
        ? t("invitePhoneInvalid")
        : t("invitePhoneRequired")
      : undefined;
    const nextServiceAreaError = serviceArea.length === 0 ? t("inviteServiceAreaRequired") : undefined;

    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    setServiceAreaError(nextServiceAreaError);

    if (nextNameError || nextPhoneError || nextServiceAreaError) return;

    setLoading(true);
    try {
      await onSubmit({
        name: trimmedName,
        phone: trimmedPhone,
        serviceArea: serviceAreaValue,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) return null;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm text-[var(--color-charcoal)]/80">
        {email}
      </div>
      <AuthPopupField
        id="agent-invite-name"
        label={t("inviteName")}
        type="text"
        placeholder={t("inviteName")}
        value={name}
        onChange={(value) => {
          setName(value);
          if (nameTouched) {
            const next = !value.trim() ? t("inviteNameRequired") : undefined;
            setNameError(next);
          }
        }}
        onFocus={validateName}
        error={nameError}
        rightAdornment={<User className="h-5 w-5" />}
      />
      <AuthPopupField
        id="agent-invite-phone"
        label={t("invitePhone")}
        type="phone"
        showFlag={true}
        showCountryCode={true}
        showDialCode={false}
        placeholder={t("invitePhone")}
        value={phone}
        onChange={(value) => {
          setPhone(value);
          if (phoneTouched) {
            const next = getPhoneValidationError(value || undefined, true);
            setPhoneError(next ? (value?.trim() ? t("invitePhoneInvalid") : t("invitePhoneRequired")) : undefined);
          }
        }}
        onFocus={validatePhone}
        error={phoneError}
        rightAdornment={<Phone className="h-5 w-5" />}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="agent-invite-service-area" className="text-sm font-medium text-slate-800">
          {t("inviteServiceArea")}
        </label>
        <div className="relative">
          <button
            id="agent-invite-service-area"
            ref={serviceAreaTriggerRef}
            type="button"
            onFocus={validateServiceArea}
            onClick={() => setIsServiceAreaOpen((open) => !open)}
            className={cn(
              "flex h-12 w-full items-center justify-between gap-2 rounded-[0.7rem] border bg-white px-4 text-left text-sm text-slate-900 shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#6f8cff]/15 focus:ring-offset-0",
              serviceAreaError ? "border-red-500 ring-2 ring-red-500/20" : "border-[#b7c6ff] focus:border-[#6f8cff]",
            )}
          >
            <span className={cn("truncate", serviceArea.length > 0 ? "text-slate-900" : "text-slate-400")}>
              {serviceArea.length > 0 ? serviceArea.join(", ") : t("inviteServiceAreaPlaceholder")}
            </span>
            <span className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-5 w-5" />
              <ChevronDown className="h-4 w-4" />
            </span>
          </button>
          <HeroDropdown
            isOpen={isServiceAreaOpen}
            onClose={() => setIsServiceAreaOpen(false)}
            align="left"
            anchorRef={serviceAreaTriggerRef}
          >
            <div className="max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
              {SERVICE_AREA_OPTIONS.map((option) => {
                const isSelected = serviceArea.includes(option);
                return (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-size-sm hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onFocus={validateServiceArea}
                      onChange={() => {
                        const nextServiceAreas = isSelected
                          ? serviceArea.filter((area) => area !== option)
                          : [...serviceArea, option];
                        setServiceArea(nextServiceAreas);
                        if (serviceAreaTouched) {
                          setServiceAreaError(
                            nextServiceAreas.length === 0 ? t("inviteServiceAreaRequired") : undefined,
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                    <span className="text-zinc-800">{option}</span>
                  </label>
                );
              })}
            </div>
          </HeroDropdown>
        </div>
        {serviceAreaError ? (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {serviceAreaError}
          </p>
        ) : null}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" size="lg" className="h-12 w-full rounded-full mt-2" disabled={loading}>
        {loading ? t("inviteSubmitting") : t("inviteSubmit")}
      </Button>
    </form>
  );
}

