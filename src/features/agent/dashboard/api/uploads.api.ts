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
  upload_url: string;
  url: string;
  expires_in: number;
};

export async function createPresignedUploadUrl(
  body: PresignRequest,
): Promise<PresignResponse> {
  const response = await authApi.post<PresignResponse>("/uploads/presigned-url", body);
  return response.data;
}

export async function requestPresignedUpload(
  body: PresignRequest,
): Promise<PresignResponse> {
  return createPresignedUploadUrl(body);
}

export { putFileToPresignedUrl };
