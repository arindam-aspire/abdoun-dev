"use client";

import { useState } from "react";
import { User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthPopupField } from "@/components/auth/AuthPopupField";
import { useTranslations } from "@/hooks/useTranslations";
import { getPhoneValidationError } from "@/lib/phoneValidation";

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

export function AgentInviteForm({
  email,
  onSubmit,
  error,
  success,
}: AgentInviteFormProps) {
  const t = useTranslations("agentAuth");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
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
    const trimmed = serviceArea.trim();
    const next = !trimmed ? t("inviteServiceAreaRequired") : undefined;
    setServiceAreaError(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setServiceAreaTouched(true);

    const trimmedName = name.trim();
    const trimmedPhone = (phone ?? "").trim();
    const trimmedServiceArea = serviceArea.trim();

    const nextNameError = !trimmedName ? t("inviteNameRequired") : undefined;
    const phoneValidationError = getPhoneValidationError(trimmedPhone || undefined, true);
    const nextPhoneError = phoneValidationError
      ? trimmedPhone
        ? t("invitePhoneInvalid")
        : t("invitePhoneRequired")
      : undefined;
    const nextServiceAreaError = !trimmedServiceArea ? t("inviteServiceAreaRequired") : undefined;

    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    setServiceAreaError(nextServiceAreaError);

    if (nextNameError || nextPhoneError || nextServiceAreaError) return;

    setLoading(true);
    try {
      await onSubmit({
        name: trimmedName,
        phone: trimmedPhone,
        serviceArea: trimmedServiceArea,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return null;
  }

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
            setPhoneError(
              next ? (value?.trim() ? t("invitePhoneInvalid") : t("invitePhoneRequired")) : undefined,
            );
          }
        }}
        onFocus={validatePhone}
        error={phoneError}
        rightAdornment={<Phone className="h-5 w-5" />}
      />
      <AuthPopupField
        id="agent-invite-service-area"
        label={t("inviteServiceArea")}
        type="text"
        placeholder={t("inviteServiceAreaPlaceholder")}
        value={serviceArea}
        onChange={(value) => {
          setServiceArea(value);
          if (serviceAreaTouched) {
            const next = !value.trim() ? t("inviteServiceAreaRequired") : undefined;
            setServiceAreaError(next);
          }
        }}
        onFocus={validateServiceArea}
        error={serviceAreaError}
        rightAdornment={<MapPin className="h-5 w-5" />}
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="h-12 w-full rounded-full mt-2"
        disabled={loading}
      >
        {loading ? t("inviteSubmitting") : t("inviteSubmit")}
      </Button>
    </form>
  );
}
