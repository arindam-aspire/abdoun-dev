"use client";

import {
  createPresignedUploadUrl,
  putFileToPresignedUrl,
  type UploadContext,
} from "../api/uploads.api";

export type UploadPropertyFileOptions = {
  file: File;
  context: UploadContext;
} & (
  | { submissionId: string; draftClientId?: string | null }
  | { draftClientId: string; submissionId?: string | null }
);

/**
 * Presigns and PUTs to S3. Returns only `{ file_name, url }` for Redux.
 * Prefer `submissionId` when the draft is persisted; otherwise `draftClientId`.
 */
export async function uploadPropertyFile(
  options: UploadPropertyFileOptions,
): Promise<{ file_name: string; url: string }> {
  const { file, context } = options;
  const contentType =
    file.type && file.type.length > 0 ? file.type : "application/octet-stream";

  const presignBody =
    options.submissionId != null && options.submissionId !== ""
      ? {
          submission_id: options.submissionId,
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
  return { file_name: file.name, url: presign.url };
}

/** @deprecated Use uploadPropertyFile */
export async function uploadFileForSubmission(
  submissionId: string,
  file: File,
  context: UploadContext,
): Promise<{ file_name: string; url: string }> {
  return uploadPropertyFile({ submissionId, file, context });
}
