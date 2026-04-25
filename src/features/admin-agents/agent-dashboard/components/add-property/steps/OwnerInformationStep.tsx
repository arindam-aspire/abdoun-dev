"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  FileText,
  Globe,
  Mail,
  Map,
  Plus,
  Shield,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
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
import { getApiErrorMessage } from "@/lib/http/apiError";
import { uploadFileForSubmission } from "@/features/admin-agents/agent-dashboard/lib/submissionFileUpload";

import {
  addOwner,
  removeOwner,
  selectAddPropertyWizard,
  setOwnerDocumentsForOwner,
  updateOwner,
} from "../addPropertyWizardSlice";
import type { OwnerDocumentRef } from "../addPropertyWizard.types";

type DropdownOption = {
  value: string;
  label: string;
};

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
        <Globe className="h-4 w-4 shrink-0 text-[#6b7c93]" />
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

function OwnerDocumentsUpload({
  ownerId,
  submissionId,
  documents,
}: {
  ownerId: number;
  submissionId: string | null;
  documents: OwnerDocumentRef[];
}) {
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const setDocs = (next: OwnerDocumentRef[]) => {
    dispatch(setOwnerDocumentsForOwner({ ownerId, documents: next }));
  };

  const addDocuments = async (files: FileList | null) => {
    if (!files || !submissionId) {
      if (!submissionId) {
        setLocalError("Submission is not ready. Please wait and try again.");
      }
      return;
    }
    const accepted = Array.from(files).filter((file) => {
      const type = file.type.toLowerCase();
      return (
        type.includes("pdf") ||
        type.includes("msword") ||
        type.includes("wordprocessingml") ||
        type.startsWith("image/")
      );
    });
    if (accepted.length === 0) return;
    setUploading(true);
    try {
      const next = [...documents];
      for (const file of accepted) {
        const row = await uploadFileForSubmission(submissionId, file, "owner_document");
        next.push(row);
      }
      setDocs(next);
      setLocalError(null);
    } catch (e) {
      setLocalError(getApiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (targetIndex: number) => {
    setDocs(documents.filter((_, index) => index !== targetIndex));
  };

  return (
    <div className="mt-5">
      <h3 className="text-size-xl fw-semibold text-[#24415c]">Owner Document</h3>
      <p className="mt-1 text-size-sm text-[#6b7c93]">
        Upload multiple documents and verification documents (PDF, DOC, Images).
      </p>

      {localError ? (
        <p className="mt-2 text-size-sm text-red-600" role="alert">
          {localError}
        </p>
      ) : null}

      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={(event) => {
          void addDocuments(event.target.files);
          event.target.value = "";
        }}
        disabled={uploading || !submissionId}
      />

      <div
        className="mt-4 rounded-3xl border-2 border-dashed border-[#cfd8e5] bg-[#eef2f7] p-5"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void addDocuments(event.dataTransfer.files);
        }}
      >
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={() => documentInputRef.current?.click()}
            disabled={uploading || !submissionId}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#c8d3e2] bg-white px-4 text-sm fw-medium text-[#2a4a67] hover:bg-[#f7faff] disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload Document"}
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-center text-size-sm text-[#7a8899]">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((file, index) => (
              <div key={`${file.url}-${index}`} className="rounded-2xl bg-[#e6ecf4] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#cfd8e5] bg-white text-[#3f5368]">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-size-sm fw-semibold text-[#2f3f52]">{file.file_name}</p>
                      <p className="mt-1 text-size-sm text-[#8a97a8]">Stored on server</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#90a0b5] text-[#2f3f52]"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[#cdd5e2]">
                  <div className="h-full w-full rounded-full bg-[#2f4e68]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OwnerInformationStep() {
  const dispatch = useAppDispatch();
  const { owners, submissionId, ownerDocuments } = useAppSelector(selectAddPropertyWizard);
  const [openNationalityOwnerId, setOpenNationalityOwnerId] = useState<number | null>(null);
  const nationalityOptions: DropdownOption[] = [
    { value: "Jordanian", label: "Jordanian" },
    { value: "Saudi", label: "Saudi" },
    { value: "Emirati", label: "Emirati" },
    { value: "Egyptian", label: "Egyptian" },
    { value: "Other", label: "Other" },
  ];

  return (
    <section className="space-y-5">
      {owners.map((owner, index) => (
        <CardSection
          key={owner.id}
          title={`Owner Information${owners.length > 1 ? ` #${index + 1}` : ""}`}
          description="Enter the primary legal owner's details for this property record. This information will be used for official ledger entries and contract generation."
          required
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField>
              <FieldLabel
                htmlFor={`owner-name-${owner.id}`}
                label="Owner Name"
                required
              />
              <div className="relative">
                <Input
                  id={`owner-name-${owner.id}`}
                  value={owner.fullName}
                  onChange={(event) =>
                    dispatch(
                      updateOwner({
                        id: owner.id,
                        key: "fullName",
                        value: event.target.value,
                      }),
                    )
                  }
                  placeholder="e.g. Jonathan Sterling"
                  className={`${wizardFieldClassName} pr-10`}
                />
                <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c93]" />
              </div>
            </FormField>

            <FormField>
              <FieldLabel
                htmlFor={`owner-phone-${owner.id}`}
                label="Phone Number"
                required
              />
              <PhoneNumberInputField
                value={owner.phone || undefined}
                onChange={(value) =>
                  dispatch(
                    updateOwner({
                      id: owner.id,
                      key: "phone",
                      value: value ?? "",
                    }),
                  )
                }
                placeholder="555-0123"
                showFlag={true}
                showCountryCode={true}
                showDialCode={true}
                fieldClassName="h-11 rounded-xl border-[#b8c8ea] bg-white text-slate-700 shadow-sm transition-colors hover:border-[#8fa6d8] focus-within:border-primary focus-within:ring-2 focus-within:ring-[rgba(26,59,92,0.12)] focus-within:ring-offset-0"
                inputClassName="text-sm text-slate-700 placeholder:text-slate-500"
              />
            </FormField>

            <FormField>
              <FieldLabel
                htmlFor={`owner-email-${owner.id}`}
                label="Email Address"
              />
              <div className="relative">
                <Input
                  id={`owner-email-${owner.id}`}
                  type="email"
                  value={owner.email}
                  onChange={(event) =>
                    dispatch(
                      updateOwner({
                        id: owner.id,
                        key: "email",
                        value: event.target.value,
                      }),
                    )
                  }
                  placeholder="j.sterling@luxuryre.com"
                  className={`${wizardFieldClassName} pr-10`}
                />
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c93]" />
              </div>
            </FormField>

            <FormField>
              <FieldLabel
                htmlFor={`owner-nationality-${owner.id}`}
                label="Nationality"
              />
              <WizardDropdownSelect
                id={`owner-nationality-${owner.id}`}
                value={owner.nationality}
                placeholder="Select Country"
                isOpen={openNationalityOwnerId === owner.id}
                onToggle={() => setOpenNationalityOwnerId((current) => (current === owner.id ? null : owner.id))}
                onClose={() => setOpenNationalityOwnerId((current) => (current === owner.id ? null : current))}
                onChange={(value) =>
                  dispatch(
                    updateOwner({
                      id: owner.id,
                      key: "nationality",
                      value,
                    }),
                  )
                }
                options={nationalityOptions}
              />
            </FormField>

            <FormField>
              <FieldLabel
                htmlFor={`owner-social-security-id-${owner.id}`}
                label="Social Security ID"
              />
              <div className="relative">
                <Input
                  id={`owner-social-security-id-${owner.id}`}
                  value={owner.socialSecurityId}
                  onChange={(event) =>
                    dispatch(
                      updateOwner({
                        id: owner.id,
                        key: "socialSecurityId",
                        value: event.target.value,
                      }),
                    )
                  }
                  placeholder="XXX-XX-XXXX"
                  className={`${wizardFieldClassName} pr-10`}
                />
                <Shield className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c93]" />
              </div>
            </FormField>
          </div>

          <FormField className="mt-5">
            <FieldLabel htmlFor={`owner-address-${owner.id}`} label="Address" />
            <div className="relative">
              <Textarea
                id={`owner-address-${owner.id}`}
                value={owner.address}
                onChange={(event) =>
                  dispatch(
                    updateOwner({
                      id: owner.id,
                      key: "address",
                      value: event.target.value,
                    }),
                  )
                }
                placeholder="Enter the full permanent residential address..."
                rows={4}
                className={`${wizardTextareaClassName} pr-10`}
              />
              <Map className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-[#6b7c93]" />
            </div>
          </FormField>

          <OwnerDocumentsUpload
            key={owner.id}
            ownerId={owner.id}
            submissionId={submissionId}
            documents={ownerDocuments[owner.id] ?? []}
          />


          {owners.length > 1 ? (
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(removeOwner(owner.id))}
                className="rounded-xl border-red-200 px-4 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Owner
              </Button>
            </div>
          ) : null}
        </CardSection>
      ))}

      {owners.length < 3 ? (
        <button
          type="button"
          onClick={() => dispatch(addOwner())}
          className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#d7deea] bg-[#f8fafc] text-[#24415c] shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-colors hover:border-[#24415c]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9]">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-size-sm fw-semibold">+ Add Another Owner</span>
        </button>
      ) : null}
    </section>
  );
}
