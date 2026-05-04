const UPLOAD_CORS_MSG =
  "Upload failed. Check file type, presigned URL expiry, or storage CORS.";

/**
 * Uploads file bytes to a presigned URL (S3-compatible) using raw fetch.
 * Authorization headers must not be sent to the upload URL.
 */
export async function putFileToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(UPLOAD_CORS_MSG);
      }
      throw new Error(`Upload failed (${res.status})`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Failed to fetch" || msg.includes("Failed to fetch")) {
      throw new Error(UPLOAD_CORS_MSG);
    }
    throw e;
  }
}
