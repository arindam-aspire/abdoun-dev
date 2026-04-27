"use client";

import { createHttpClients } from "@/lib/http";
import { putFileToPresignedUrl } from "@/features/admin-agents/agent-dashboard/api/uploads.api";

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(raw: StandardApiResponse<T>): T => raw.data;

/** Matches FastAPI `ProfilePictureUploadRequest` (JSON body — not multipart). */
type ProfilePicturePresignRequest = {
  file_name: string;
  content_type: string;
  file_size?: number;
};

/** Presigned PUT target + stable object URL from GET /auth/me (same idea as property uploads). */
type ProfilePictureUploadData = {
  upload_url: string;
  url: string;
  expires_in?: number;
};

/**
 * Presign (POST JSON) + PUT to S3. Backend: POST /auth/me/profile-picture with
 * { file_name, content_type, file_size? } → { upload_url, url, ... }.
 */
export async function uploadProfilePicture(file: File): Promise<void> {
  const contentType =
    file.type && file.type.length > 0 ? file.type : "application/octet-stream";
  const response = await authApi.post<StandardApiResponse<ProfilePictureUploadData>>(
    "/auth/me/profile-picture",
    {
      file_name: file.name,
      content_type: contentType,
      file_size: file.size,
    } satisfies ProfilePicturePresignRequest,
  );
  const data = unwrap(response.data);
  await putFileToPresignedUrl(data.upload_url, file, contentType);
}

export async function deleteProfilePicture(): Promise<void> {
  await authApi.delete("/auth/me/profile-picture");
}

export async function dataUrlToProfileFile(
  dataUrl: string,
  fileName = "profile.jpg",
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}
