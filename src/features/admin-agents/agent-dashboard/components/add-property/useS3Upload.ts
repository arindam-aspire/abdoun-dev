"use client";

import { useCallback } from "react";
import {
  uploadPropertyFile,
  type UploadPropertyFileOptions,
} from "@/features/admin-agents/agent-dashboard/lib/submissionFileUpload";

/**
 * Presign + PUT to S3; returns `{ file_name, url }` for Redux (no s3_key / content_type in state).
 */
export function useS3Upload() {
  return useCallback((options: UploadPropertyFileOptions) => uploadPropertyFile(options), []);
}
