"use client";

import { Check, FileText, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { labelForAmenityFeatureId } from "@/features/admin-agents/agent-dashboard/lib/amenityFeatureOptions";
import { selectAddPropertyWizard, setTermsAccepted } from "../addPropertyWizardSlice";
import { REVIEW_TERMS } from "../reviewTerms";

const REVIEW_TITLE = "Review & Submit";
const EDIT_BUTTON_TEXT = "Edit Information";
const AMENITIES_TITLE = "Features & Amenities";
const MEDIA_DOCUMENTS_TITLE = "Media & Documents";
const TERMS_TITLE = "Terms & Conditions";
const PHOTOS_TITLE = "Photos / Images";
const DOCS_TITLE = "Verification Documents";
const BACK_BUTTON_TEXT = "Go Back";
const SUBMIT_BUTTON_TEXT = "Submit Listing";
const TERMS_AGREEMENT_LABEL =
  "I have read the points above and agree to all of them.";

export function ReviewSubmitStep() {
  const dispatch = useAppDispatch();
  const wizard = useAppSelector(selectAddPropertyWizard);
  const firstOwner = wizard.owners[0];
  const safeValue = (value: string | undefined) => (value && value.trim() ? value : "-");
  const allOwnerDocNames = wizard.owners.flatMap(
    (o) => (wizard.ownerDocuments[o.id] ?? []).map((d) => d.file_name),
  );
  const imageCount = wizard.mediaImages.length;
  const videoCount = wizard.mediaVideos.length;
  const propertyDocCount = wizard.propertyListingDocuments.length;
  const sections = [
    {
      title: "Basic Information",
      columns: [
        [
          { label: "Listing Purpose", value: wizard.listingPurpose === "rent" ? "For Rent" : "For Sale" },
          { label: "Property Type", value: safeValue(wizard.propertyType) },
          { label: "Description", value: safeValue(wizard.description) },
        ],
        [
          { label: "Category", value: safeValue(wizard.category) },
          { label: "Property Title", value: safeValue(wizard.propertyTitle) },
        ],
      ],
    },
    {
      title: "Location",
      columns: [
        [
          { label: "City", value: safeValue(wizard.city) },
          { label: "Address", value: safeValue(wizard.address) },
        ],
        [
          { label: "Area", value: wizard.selectedAreas.length > 0 ? wizard.selectedAreas.join(", ") : "-" },
        ],
      ],
    },
    {
      title: "Owner Information",
      columns: [
        [
          { label: "Owner Name", value: safeValue(firstOwner?.fullName) },
          { label: "Email", value: safeValue(firstOwner?.email) },
          { label: "Social Security ID", value: safeValue(firstOwner?.socialSecurityId) },
        ],
        [
          {
            label: "Phone Number",
            value: `${safeValue(firstOwner?.countryCode)} ${safeValue(firstOwner?.phone)}`.trim(),
          },
          { label: "Nationality", value: safeValue(firstOwner?.nationality) },
          { label: "Address", value: safeValue(firstOwner?.address) },
        ],
      ],
    },
    {
      title: "Property Details",
      columns: [
        [
          { label: "Bedrooms", value: safeValue(wizard.propertyDetails.bedrooms) },
          { label: "Parking Spaces", value: safeValue(wizard.propertyDetails.parkingSpaces) },
          { label: "Total Floors", value: safeValue(wizard.propertyDetails.totalFloors) },
          { label: "Reference Number", value: safeValue(wizard.propertyDetails.referenceNumber) },
        ],
        [
          { label: "Bathrooms", value: safeValue(wizard.propertyDetails.bathrooms) },
          { label: "Property Age", value: safeValue(wizard.propertyDetails.propertyAge) },
          { label: "Occupancy", value: safeValue(wizard.propertyDetails.occupancy) },
          { label: "Permit/DLD Number", value: safeValue(wizard.propertyDetails.permitNumber) },
        ],
        [
          { label: "Built-up Area", value: safeValue(wizard.propertyDetails.builtUpArea) },
          { label: "Completion Status", value: safeValue(wizard.propertyDetails.completionStatus) },
          { label: "Ownership Type", value: safeValue(wizard.propertyDetails.ownershipType) },
          { label: "Orientation", value: safeValue(wizard.propertyDetails.orientation) },
        ],
      ],
    },
    {
      title: "Pricing",
      columns: [
        [
          { label: "Price", value: safeValue(wizard.price) },
          { label: "Service Charge", value: safeValue(wizard.serviceFee) },
        ],
        [{ label: "Maintenance Fee", value: safeValue(wizard.maintenanceFee) }],
      ],
    },
  ];

  return (
    <section className="rounded-[28px] border border-[#edf2f7] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-size-2xl fw-semibold text-[#24415c]">{REVIEW_TITLE}</h2>
          <Button type="button" variant="outline" className="h-8 rounded-lg border-[#3c607e] px-3 text-xs text-[#2f4e68]">
            <Pencil className="h-3.5 w-3.5" />
            {EDIT_BUTTON_TEXT}
          </Button>
        </div>

        {sections.map((section, sectionIndex) => (
          <section key={`${section.title}-${sectionIndex}`} className="rounded-xl border border-[#edf2f7] bg-[#fbfcfe] p-4">
            <h3 className="flex items-center gap-2 text-size-sm fw-semibold text-[#2f4e68]">
              <Check className="h-4 w-4 text-[#2f4e68]" />
              {section.title}
            </h3>
            <div
              className="mt-3 grid gap-4"
              style={{ gridTemplateColumns: `repeat(${section.columns.length}, minmax(0, 1fr))` }}
            >
              {section.columns.map((column, index) => (
                <div key={`${sectionIndex}-${index}`} className="space-y-2">
                  {column.map((row) => (
                    <div key={`${row.label}-${row.value}`}>
                      <p className="text-[11px] fw-semibold uppercase tracking-[0.08em] text-[#7d8ca0]">{row.label}</p>
                      <p className="mt-1 text-size-sm text-[#1f2937]">{row.value}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-xl border border-[#edf2f7] bg-[#fbfcfe] p-4">
          <h3 className="flex items-center gap-2 text-size-sm fw-semibold text-[#2f4e68]">
            <Check className="h-4 w-4 text-[#2f4e68]" />
            {AMENITIES_TITLE}
          </h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {wizard.amenityFeatureIds.length === 0 ? (
              <div className="rounded-lg bg-white px-3 py-2 text-size-sm text-[#2b3c50] shadow-sm">-</div>
            ) : (
              wizard.amenityFeatureIds.map((id) => (
                <div
                  key={id}
                  className="rounded-lg bg-white px-3 py-2 text-size-sm text-[#2b3c50] shadow-sm"
                >
                  {labelForAmenityFeatureId(id)}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#edf2f7] bg-[#fbfcfe] p-4">
          <h3 className="flex items-center gap-2 text-size-sm fw-semibold text-[#2f4e68]">
            <Check className="h-4 w-4 text-[#2f4e68]" />
            {MEDIA_DOCUMENTS_TITLE}
          </h3>
          <div className="mt-2 grid gap-2 text-xs text-[#7d8ca0] md:grid-cols-2">
            <p>YouTube URL: {safeValue(wizard.youtubeUrl)}</p>
            <p>Virtual Tour URL: {safeValue(wizard.virtualTourUrl)}</p>
          </div>
          <p className="mt-2 text-xs text-[#7d8ca0]">{PHOTOS_TITLE} ({imageCount})</p>
          {imageCount + videoCount === 0 ? (
            <p className="mt-1 text-size-sm text-[#94a3b8]">No images or videos added.</p>
          ) : (
            <div className="mt-2 space-y-2 text-size-sm text-[#2b3c50]">
              {wizard.mediaImages.map((img, index) => (
                <div
                  key={`img-${img.url}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2"
                >
                  <ImageIcon className="h-4 w-4 shrink-0 text-[#6b7c93]" />
                  <span className="min-w-0 flex-1 truncate" title={img.file_name}>
                    {img.file_name}
                  </span>
                  {img.is_primary ? (
                    <span className="shrink-0 text-[10px] uppercase text-[#64748b]">Primary</span>
                  ) : null}
                </div>
              ))}
              {wizard.mediaVideos.map((vid, index) => (
                <div
                  key={`vid-${vid.url}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#6b7c93]" />
                  <span className="min-w-0 flex-1 truncate" title={vid.file_name}>
                    {vid.file_name} (video)
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-[#7d8ca0]">{DOCS_TITLE} (property) ({propertyDocCount})</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
            {wizard.propertyListingDocuments.length === 0 ? (
              <div className="px-3 py-2 text-size-sm text-[#94a3b8]">No property documents uploaded.</div>
            ) : (
              wizard.propertyListingDocuments.map((doc, index) => (
                <div
                  key={`${doc.url}-${index}`}
                  className={`flex items-center justify-between px-3 py-2 text-size-sm ${
                    index !== 0 ? "border-t border-[#edf2f7]" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#2b3c50]">
                    <FileText className="h-4 w-4 shrink-0 text-[#6b7c93]" />
                    <span className="truncate">{doc.file_name}</span>
                  </span>
                </div>
              ))
            )}
          </div>

          <p className="mt-4 text-xs text-[#7d8ca0]">Owner KYC / ID documents ({allOwnerDocNames.length})</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
            {allOwnerDocNames.length === 0 ? (
              <div className="px-3 py-2 text-size-sm text-[#94a3b8]">No owner documents uploaded.</div>
            ) : (
              allOwnerDocNames.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className={`flex items-center justify-between px-3 py-2 text-size-sm ${
                    index !== 0 ? "border-t border-[#edf2f7]" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#2b3c50]">
                    <FileText className="h-4 w-4 shrink-0 text-[#6b7c93]" />
                    <span className="truncate">{name}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#edf2f7] bg-[#fbfcfe] p-4">
          <h3 className="flex items-center gap-2 text-size-sm fw-semibold text-[#2f4e68]">
            <Check className="h-4 w-4 text-[#2f4e68]" />
            {TERMS_TITLE}
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-size-sm text-[#2b3c50]">
            {REVIEW_TERMS.map((term) => (
              <li key={term} className="leading-snug">
                {term}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[#e2e8f0] pt-4">
            <label
              htmlFor="review-terms-single"
              className="flex cursor-pointer items-start gap-3"
            >
              <Checkbox
                id="review-terms-single"
                checked={Boolean(wizard.termsAccepted)}
                onChange={(event) => dispatch(setTermsAccepted(event.target.checked))}
                className="mt-0.5 shrink-0 border-[#b8c8ea] text-[#24415c] focus:ring-[#24415c]"
              />
              <span className="text-size-sm font-medium leading-snug text-[#2b3c50]">
                {TERMS_AGREEMENT_LABEL}
              </span>
            </label>
          </div>
        </section>
      </div>
    </section>
  );
}
