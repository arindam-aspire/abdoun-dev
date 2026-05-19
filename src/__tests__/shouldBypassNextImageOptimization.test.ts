import { shouldBypassNextImageOptimization } from "@/lib/images/shouldBypassNextImageOptimization";

describe("shouldBypassNextImageOptimization", () => {
  it("returns true for presigned S3 URLs", () => {
    expect(
      shouldBypassNextImageOptimization(
        "https://abdoun-dev-assets-usw2.s3.amazonaws.com/drafts/x.jpg?AWSAccessKeyId=AKIA&Signature=abc&Expires=123",
      ),
    ).toBe(true);
  });

  it("returns true for private S3 object URLs without signing query", () => {
    expect(
      shouldBypassNextImageOptimization(
        "https://abdoun-dev-assets-usw2.s3.us-west-2.amazonaws.com/drafts/property-submissions/448c0904-7476-4aef-8fdb-8e3ed83f9d21/images/pexels.jpg",
      ),
    ).toBe(true);
  });

  it("returns false for public CDN URLs", () => {
    expect(
      shouldBypassNextImageOptimization(
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress",
      ),
    ).toBe(false);
  });
});
