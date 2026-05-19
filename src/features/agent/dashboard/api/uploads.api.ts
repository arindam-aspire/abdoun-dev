"use client";

import { authApi } from "@/lib/http/clients";
import { putFileToPresignedUrl } from "@/lib/api/upload";

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
  /** Presigned PUT target — use only for uploading bytes, not for `<img src>`. */
  upload_url: string;
  /** Canonical object URL saved on the submission (may require a read presign to display). */
  url: string;
  /** Present when the server stored the watermarked object (image multipart flow). */
  original_url?: string;
  /** When true, the file is already in S3 — do not PUT to `upload_url`. */
  upload_completed?: boolean;
  expires_in: number;
};

export async function createPresignedUploadUrl(
  body: PresignRequest,
): Promise<PresignResponse> {
  const response = await authApi.post<PresignResponse>("/uploads/presigned-url", body);
  return response.data;
}

type PresignImageIdentifiers =
  | { submission_id: string }
  | { draft_client_id: string };

/**
 * Property images: multipart to the same presign endpoint so the server can watermark
 * and upload. Other contexts keep JSON via {@link createPresignedUploadUrl}.
 */
export async function createPresignedImageUpload(
  file: File,
  identifiers: PresignImageIdentifiers,
): Promise<PresignResponse> {
  const contentType =
    file.type && file.type.length > 0 ? file.type : "application/octet-stream";

  const form = new FormData();
  form.append("file", file);
  form.append("context", "property_media_image");
  if ("submission_id" in identifiers) {
    form.append("submission_id", identifiers.submission_id);
  } else {
    form.append("draft_client_id", identifiers.draft_client_id);
  }
  if (file.name) {
    form.append("file_name", file.name);
  }
  form.append("content_type", contentType);
  form.append("file_size", String(file.size));

  const response = await authApi.post<PresignResponse>("/uploads/presigned-url", form);
  return response.data;
}

export async function requestPresignedUpload(
  body: PresignRequest,
): Promise<PresignResponse> {
  return createPresignedUploadUrl(body);
}

export { putFileToPresignedUrl };
