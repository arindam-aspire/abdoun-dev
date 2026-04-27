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

export type PresignRequestWithDraft = {
  draft_client_id: string;
  context: UploadContext;
  file_name: string;
  content_type: string;
  file_size?: number;
};

export type PresignRequestWithSubmission = {
  submission_id: string;
  context: UploadContext;
  file_name: string;
  content_type: string;
  file_size?: number;
};

export type PresignRequest = PresignRequestWithDraft | PresignRequestWithSubmission;

export type PresignResponse = {
  upload_url: string;
  url: string;
  expires_in: number;
};

export async function createPresignedUploadUrl(
  body: PresignRequest,
): Promise<PresignResponse> {
  const response = await authApi.post<StandardApiResponse<PresignResponse>>(
    "/uploads/presigned-url",
    body,
  );
  return unwrap(response.data);
}

export async function requestPresignedUpload(
  body: PresignRequest,
): Promise<PresignResponse> {
  return createPresignedUploadUrl(body);
}

const UPLOAD_CORS_MSG =
  "Upload failed. Check file type, presigned URL expiry, or storage CORS.";

/**
 * PUT file bytes to the presigned URL (S3 or compatible). No Authorization header.
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
