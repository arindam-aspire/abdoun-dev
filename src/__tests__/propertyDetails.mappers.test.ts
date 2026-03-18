import { mapAmenities } from "@/features/property-details/utils/amenitiesMapper";
import { mapGallery } from "@/features/property-details/utils/galleryMapper";
import { mapNeighborhoodLatLng } from "@/features/property-details/utils/neighborhoodMapper";
import { toDetailedProperty } from "@/features/property-details/utils/propertyDetailsMapper";
import { mapPropertyStats } from "@/features/property-details/utils/statsMapper";
import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

const tBackend = (field: any) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field.en || field.ar || "";
  return String(field);
};

describe("property-details mappers", () => {
  const base: PropertyDetailsApiResponse = {
    id: 123,
    title: { en: "Nice home" },
    description: { en: "Desc" },
    category: "Apartments",
    status: "available",
    selling_price_amount: 100000,
    selling_price_currency: "JD",
    bedrooms: 2,
    bathrooms: 2,
    built_up_area: 120,
    features: ["Pool", "Pool", { en: "Balcony" }],
    more_features: { parking: true, note: { en: "Near park" } },
    images: ["img1.jpg", "img2.jpg"],
    media: { thumbnail: "thumb.jpg", virtual_tour_url: "https://example.com" },
    latitude: 31.95,
    longitude: 35.93,
    location_name: "Amman",
  };

  it("mapAmenities deduplicates and stringifies values", () => {
    const out = mapAmenities(base, tBackend);
    expect(out).toEqual(
      expect.arrayContaining(["Pool", "Balcony", "parking: true", "note: Near park"]),
    );
    expect(out.filter((x) => x === "Pool")).toHaveLength(1);
  });

  it("mapAmenities extracts object fields when translation returns empty", () => {
    const tEmpty = () => "";
    const item: PropertyDetailsApiResponse = {
      ...base,
      features: [{ name: "Named feature" }, { label: "Labeled feature" }] as any,
      more_features: null,
    };
    const out = mapAmenities(item, tEmpty as any);
    expect(out).toEqual(expect.arrayContaining(["Named feature", "Labeled feature"]));
  });

  it("mapGallery prefers item.images and falls back safely", () => {
    expect(mapGallery(base)).toEqual(["img1.jpg", "img2.jpg"]);
    const withoutImages: PropertyDetailsApiResponse = {
      ...base,
      images: null,
      media: { thumbnail: "thumb.jpg" },
    };
    expect(mapGallery(withoutImages)).toEqual(["thumb.jpg"]);
  });

  it("mapGallery supports media.images as string[] and object[] and falls back to placeholder", () => {
    const asStrings: PropertyDetailsApiResponse = {
      ...base,
      images: null,
      media: { images: ["a.jpg", "", "b.jpg"] as any },
    };
    expect(mapGallery(asStrings)).toEqual(["a.jpg", "b.jpg"]);

    const asObjects: PropertyDetailsApiResponse = {
      ...base,
      images: null,
      media: {
        images: [
          { url: "u1.jpg" },
          { thumb_url: "t2.jpg" },
          { url: null, thumb_url: null },
        ] as any,
      },
    };
    expect(mapGallery(asObjects)).toEqual(["u1.jpg", "t2.jpg"]);

    const fallback: PropertyDetailsApiResponse = { ...base, images: null, media: null };
    expect(mapGallery(fallback)[0]).toContain("images.unsplash.com");
  });

  it("mapNeighborhoodLatLng maps from latitude/longitude", () => {
    expect(mapNeighborhoodLatLng(base)).toEqual({ lat: 31.95, lng: 35.93 });
  });

  it("toDetailedProperty maps core display fields", () => {
    const mapped = toDetailedProperty(base, tBackend);
    expect(mapped.id).toBe(123);
    expect(mapped.title).toBe("Nice home");
    expect(mapped.location).toBe("Amman");
    expect(mapped.image).toBe("img1.jpg");
    expect(mapped.lat).toBe(31.95);
    expect(mapped.lng).toBe(35.93);
    expect(mapped.amenities.length).toBeGreaterThan(0);
  });

  it("mapPropertyStats includes category, status, and coordinates", () => {
    const stats = mapPropertyStats(base);
    expect(stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Category", value: "Apartments" }),
        expect.objectContaining({ label: "Listing status", value: "available" }),
        expect.objectContaining({ label: "Coordinates" }),
      ]),
    );
  });
});

