"use client";

import { createHttpClients } from "@/lib/http";

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(raw: StandardApiResponse<T>): T => raw.data;

export type UploadContext =
  | "owner_document"
  | "property_media_image"
  | "property_media_video"
  | "property_document";

export type PresignRequest = {
  submission_id: string;
  context: UploadContext;
  file_name: string;
  content_type: string;
  file_size?: number;
};

export type PresignResponse = {
  upload_url: string;
  url: string;
  expires_in: number;
};

export async function requestPresignedUpload(
  body: PresignRequest,
): Promise<PresignResponse> {
  const response = await authApi.post<StandardApiResponse<PresignResponse>>(
    "/uploads/presigned-url",
    body,
  );
  return unwrap(response.data);
}

/**
 * PUT file bytes to the presigned URL (S3 or compatible). No Authorization header.
 * If this throws "Failed to fetch" in the browser, the storage bucket CORS policy must
 * allow PUT from your app origin and expose `Content-Type` (and often `ETag`).
 */
export async function putFileToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "your deployed origin";

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Failed to fetch" || msg.includes("Failed to fetch")) {
      throw new Error(
        `Could not reach storage to upload the file. Presign worked, so this is usually a CORS issue on the bucket: allow PUT (and OPTIONS preflight) from ${origin}, allow header Content-Type, and expose ETag if required. Fix in AWS S3 CORS or your storage console—not in this app code.`,
      );
    }
    throw e;
  }
}
