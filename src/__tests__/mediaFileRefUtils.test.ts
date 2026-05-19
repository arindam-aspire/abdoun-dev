import {
  displayMediaFileName,
  mediaFileRefFromApiRow,
  mediaFileRefFromUpload,
  parseMediaFileRefs,
} from "@/features/agent/dashboard/lib/mediaFileRefUtils";

describe("mediaFileRefUtils", () => {
  it("parses GET submission media_documents image rows", () => {
    const rows = parseMediaFileRefs([
      {
        url: "https://abdoun-dev-assets-usw2.s3.us-west-2.amazonaws.com/drafts/property-submissions/448c0904/images/pexels-a.jpg",
        file_name: "pexels-a.jpg",
        is_primary: true,
        display_order: 0,
      },
      {
        url: "https://abdoun-dev-assets-usw2.s3.us-west-2.amazonaws.com/drafts/property-submissions/448c0904/images/pexels-b.jpg",
        file_name: "pexels-b.jpg",
        display_order: 1,
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      file_name: "pexels-a.jpg",
      is_primary: true,
      display_order: 0,
    });
    expect(rows[1]?.file_name).toBe("pexels-b.jpg");
    expect(rows[1]?.is_primary).toBeUndefined();
  });

  it("derives file_name from url when API omits file_name", () => {
    const row = mediaFileRefFromApiRow({
      url: "https://bucket.s3.us-west-2.amazonaws.com/path/photo.jpeg",
    });
    expect(row?.file_name).toBe("photo.jpeg");
  });

  it("prefers API file_name over url basename when resuming a draft", () => {
    expect(
      displayMediaFileName(
        "pexels-the-r-e-editor-849420489-28272345.jpg",
        "https://abdoun-dev-assets-usw2.s3.us-west-2.amazonaws.com/drafts/x/pexels-other.jpg",
      ),
    ).toBe("pexels-the-r-e-editor-849420489-28272345.jpg");
  });

  it("uses the picked file name for new presigned uploads", () => {
    const file = new File(["x"], "my-photo.jpg", { type: "image/jpeg" });
    const ref = mediaFileRefFromUpload(
      file,
      "https://abdoun-dev-assets-usw2.s3.us-west-2.amazonaws.com/drafts/x/my-photo.jpg",
    );
    expect(ref.file_name).toBe("my-photo.jpg");
    expect(ref.url).toContain("my-photo.jpg");
  });
});
