import { submissionPayloadToDetailedProperty } from "@/features/admin/dashboard/lib/submissionPayloadToDetailedProperty";

describe("submissionPayloadToDetailedProperty", () => {
  it("maps basic fields from payload into DetailedProperty", () => {
    const property = submissionPayloadToDetailedProperty({
      submissionId: "sub-123",
      status: "submitted",
      payload: {
        basic_information: {
          title: "Modern Apartment in Abdoun",
          description: "Nice place",
          listing_purpose: "rent",
        },
        location: { city_id: "amman", area_id: "abdoun" },
        pricing: { price: 1600, currency: "JOD" },
        property_details: { bedrooms: 3, bathrooms: 2, area: 2100 },
        amenities: { amenities: ["Balcony", "Parking"] },
        media_documents: { images: ["https://example.com/hero.jpg"] },
      },
      propertyReferenceNumber: "A-999",
      submittedByName: "Agent Name",
    });

    expect(property.title).toBe("Modern Apartment in Abdoun");
    expect(property.description).toBe("Nice place");
    expect(property.price).toContain("JOD");
    expect(property.beds).toBe(3);
    expect(property.baths).toBe(2);
    expect(property.area).toBe("2100");
    expect(property.amenities).toEqual(["Balcony", "Parking"]);
    expect(property.image).toBe("https://example.com/hero.jpg");
  });
});

