"use client";

import { useState } from "react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import {
  PropertyDetailsHero,
} from "@/components/property/property-details/PropertyDetailsHero";
import {
  PropertyDetailsPriceCard,
} from "@/components/property/property-details/PropertyDetailsPriceCard";
import type {
  DetailedProperty,
} from "@/components/property/property-details/types";
import { MOCK_AGENT_PROPERTY } from "./AgentPropertyDetails";

export interface AgentPropertyEditProps {
  language: AppLocale;
  propertyId?: string;
}

export function AgentPropertyEdit({
  language,
  propertyId,
}: AgentPropertyEditProps) {
  const isRtl = language === "ar";
  const [title, setTitle] = useState(MOCK_AGENT_PROPERTY.title);
  const [subtitle, setSubtitle] = useState(
    MOCK_AGENT_PROPERTY.subtitle ?? "",
  );
  const [price, setPrice] = useState(MOCK_AGENT_PROPERTY.price);
  const [beds, setBeds] = useState(String(MOCK_AGENT_PROPERTY.beds ?? 0));
  const [baths, setBaths] = useState(
    String(MOCK_AGENT_PROPERTY.baths ?? 0),
  );
  const [area, setArea] = useState(MOCK_AGENT_PROPERTY.area ?? "");
  const [status, setStatus] = useState(
    MOCK_AGENT_PROPERTY.status ?? "",
  );
  const [location, setLocation] = useState(
    MOCK_AGENT_PROPERTY.location ?? "",
  );
  const [heroImage, setHeroImage] = useState(
    MOCK_AGENT_PROPERTY.image ?? "",
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    MOCK_AGENT_PROPERTY.gallery ?? [],
  );
  const [description, setDescription] = useState(
    MOCK_AGENT_PROPERTY.description ?? "",
  );
  const [amenitiesText, setAmenitiesText] = useState(
    (MOCK_AGENT_PROPERTY.amenities ?? []).join("\n"),
  );
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(
    null,
  );

  const previewProperty: DetailedProperty = {
    ...MOCK_AGENT_PROPERTY,
    title,
    subtitle,
    price,
    image: heroImage || MOCK_AGENT_PROPERTY.image,
    gallery: galleryImages,
    beds: Number.isFinite(Number(beds)) ? Number(beds) : 0,
    baths: Number.isFinite(Number(baths)) ? Number(baths) : 0,
    area,
    status,
    location,
    description,
    amenities: amenitiesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);

    // In a real app you would call an API here.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    setSavedMessage("Changes saved (mock). This is a demo form.");
    // eslint-disable-next-line no-console
    console.log("Agent property payload", {
      propertyId: propertyId ?? previewProperty.id,
      title,
      subtitle,
      price,
      image: heroImage,
      gallery: galleryImages,
      beds,
      baths,
      area,
      status,
      location,
      description,
      amenities: amenitiesText,
    });
  };

  return (
    <div
      className={cn(
        "relative min-h-screen bg-surface/60 px-4 py-6 text-charcoal md:px-8 md:py-8",
        isRtl ? "text-right" : "text-left",
      )}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Preview first for a \"wow\" hero feel */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-subtle md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-charcoal">
                Agent property editor
              </h1>
              <p className="mt-1 text-size-sm text-charcoal/70">
                See exactly how buyers will experience this listing while you
                fine-tune the details below.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-0">
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-size-2xs fw-medium text-charcoal/70">
                Public listing preview
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-size-2xs fw-medium text-amber-700">
                Demo only – no backend save
              </span>
            </div>
          </div>

          <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 p-[1px] shadow-sm ring-1 ring-subtle/60">
            <div className="h-full rounded-2xl bg-white/95 p-3 md:p-4">
              <div className="max-h-[560px] overflow-y-auto rounded-xl bg-surface/40 p-2 md:p-3">
                <PropertyDetailsHero property={previewProperty} isRtl={isRtl} />
                <div className="mt-4">
                  <PropertyDetailsPriceCard price={previewProperty.price} />
                </div>
                {(previewProperty.beds ||
                  previewProperty.baths ||
                  previewProperty.area) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-size-xs text-charcoal/75">
                    {previewProperty.beds ? (
                      <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5">
                        {previewProperty.beds} bd
                      </span>
                    ) : null}
                    {previewProperty.baths ? (
                      <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5">
                        {previewProperty.baths} ba
                      </span>
                    ) : null}
                    {previewProperty.area ? (
                      <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5">
                        {previewProperty.area} sqft
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Form below, full-width, with clear sections */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-subtle md:p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-4">
                <div>
                  <p className="text-size-xs fw-semibold uppercase tracking-wide text-charcoal/60">
                    Basic info
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    placeholder="Property title"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    placeholder="Short marketing line"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-size-xs fw-semibold uppercase tracking-wide text-charcoal/60">
                    Pricing & stats
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      Price
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                      placeholder="e.g. 495,000 JD"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      Status label
                    </label>
                    <input
                      type="text"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                      placeholder="e.g. Ready to move"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={baths}
                      onChange={(e) => setBaths(e.target.value)}
                      className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                      Area (sqft)
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                      placeholder="e.g. 4,000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-3">
                <p className="text-size-xs fw-semibold uppercase tracking-wide text-charcoal/60">
                  Media & location
                </p>
                <div>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length === 0) return;
                      const urls = files.map((file) =>
                        URL.createObjectURL(file),
                      );
                      setHeroImage(urls[0]);
                      setGalleryImages((prev) => [...urls, ...prev]);
                    }}
                    className="block w-full text-size-sm text-charcoal/80 file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-size-sm file:fw-medium file:text-white hover:file:bg-secondary/90"
                  />
                  <p className="mt-1 text-size-2xs text-charcoal/50">
                    Demo upload only. Images are used for preview and are not
                    persisted.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-10 w-full rounded-lg border border-subtle bg-surface/40 px-3 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                    placeholder="Neighborhood, city"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-size-xs fw-semibold uppercase tracking-wide text-charcoal/60">
                  Description & highlights
                </p>
              </div>
              <div>
                <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[96px] w-full rounded-lg border border-subtle bg-surface/40 px-3 py-2 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  placeholder="Short description of the property"
                />
              </div>
              <div>
                <label className="mb-1 block text-size-xs fw-medium text-charcoal/80">
                  Amenities (one per line)
                </label>
                <textarea
                  value={amenitiesText}
                  onChange={(e) => setAmenitiesText(e.target.value)}
                  className="min-h-[96px] w-full rounded-lg border border-subtle bg-surface/40 px-3 py-2 text-size-sm text-charcoal placeholder:text-charcoal/50 focus:border-secondary focus:outline-none"
                  placeholder={
                    "Open-plan living and dining\nCovered balcony\nAllocated parking space"
                  }
                />
              </div>
            </div>

            {savedMessage && (
              <p className="text-size-xs text-emerald-600">{savedMessage}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-4 text-size-sm fw-medium text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save changes (mock)"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

