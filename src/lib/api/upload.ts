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
  onProgress?: (percent: number) => void,
): Promise<void> {
  if (typeof onProgress === "function") {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
        onProgress(pct);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve();
          return;
        }
        if (xhr.status === 403) {
          reject(new Error(UPLOAD_CORS_MSG));
          return;
        }
        reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error(UPLOAD_CORS_MSG));
      xhr.send(file);
    });
    return;
  }
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
