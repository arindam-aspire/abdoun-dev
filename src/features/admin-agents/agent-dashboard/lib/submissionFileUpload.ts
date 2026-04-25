"use client";

import {
  putFileToPresignedUrl,
  requestPresignedUpload,
  type UploadContext,
} from "../api/uploads.api";

export async function uploadFileForSubmission(
  submissionId: string,
  file: File,
  context: UploadContext,
): Promise<{ file_name: string; url: string }> {
  const contentType =
    file.type && file.type.length > 0 ? file.type : "application/octet-stream";
  const presign = await requestPresignedUpload({
    submission_id: submissionId,
    context,
    file_name: file.name,
    content_type: contentType,
    file_size: file.size,
  });
  await putFileToPresignedUrl(presign.upload_url, file, contentType);
  return { file_name: file.name, url: presign.url };
}
