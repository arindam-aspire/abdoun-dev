"use client";

import {
  createPresignedImageUpload,
  createPresignedUploadUrl,
  putFileToPresignedUrl,
  type UploadContext,
} from "../api/uploads.api";
import { mediaFileRefFromUpload } from "./mediaFileRefUtils";

export type UploadPropertyFileOptions = {
  file: File;
  context: UploadContext;
} & (
  | { submissionId: string; draftClientId?: string | null }
  | { draftClientId: string; submissionId?: string | null }
);

/**
 * Uploads a property file and returns `{ file_name, url }` for Redux.
 * Images: multipart presign (server watermarks); skip S3 PUT when `upload_completed`.
 * Videos/documents/owner docs: JSON presign + PUT to `upload_url`.
 */
export async function uploadPropertyFile(
  options: UploadPropertyFileOptions,
): Promise<{ file_name: string; url: string }> {
  const { file, context } = options;
  const contentType =
    file.type && file.type.length > 0 ? file.type : "application/octet-stream";

  const hasSubmission =
    options.submissionId != null && options.submissionId !== "";

  if (context === "property_media_image") {
    const identifiers = hasSubmission
      ? { submission_id: options.submissionId as string }
      : { draft_client_id: options.draftClientId as string };

    const presign = await createPresignedImageUpload(file, identifiers);
    if (!presign.upload_completed) {
      await putFileToPresignedUrl(presign.upload_url, file, contentType);
    }
    return mediaFileRefFromUpload(file, presign.url);
  }

  const presignBody = hasSubmission
    ? {
        submission_id: options.submissionId as string,
        context,
        file_name: file.name,
        content_type: contentType,
        file_size: file.size,
      }
    : {
        draft_client_id: options.draftClientId as string,
        context,
        file_name: file.name,
        content_type: contentType,
        file_size: file.size,
      };

  const presign = await createPresignedUploadUrl(presignBody);
  await putFileToPresignedUrl(presign.upload_url, file, contentType);
  return mediaFileRefFromUpload(file, presign.url);
}

/** @deprecated Use uploadPropertyFile */
export async function uploadFileForSubmission(
  submissionId: string,
  file: File,
  context: UploadContext,
): Promise<{ file_name: string; url: string }> {
  return uploadPropertyFile({ submissionId, file, context });
}
