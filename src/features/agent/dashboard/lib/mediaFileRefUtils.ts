import type { MediaFileRef } from "../components/add-property/addPropertyWizard.types";

/** Last path segment of an S3 or CDN URL (decoded). */
export function mediaFileNameFromUrl(url: string): string {
  try {
    const segment = new URL(url).pathname.split("/").pop();
    return segment ? decodeURIComponent(segment) : "";
  } catch {
    return "";
  }
}

/**
 * Display / persist name: prefer explicit `file_name`, then optional local upload name, then URL basename.
 */
export function displayMediaFileName(
  fileName: string,
  url: string,
  localFileName?: string,
): string {
  const fromLocal = localFileName?.trim();
  if (fromLocal) return fromLocal;
  const fromField = fileName.trim();
  if (fromField) return fromField;
  return mediaFileNameFromUrl(url);
}

/** GET submission `media_documents.images[]` (and videos/documents). */
export function mediaFileRefFromApiRow(row: unknown): MediaFileRef | null {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return null;
  const o = row as Record<string, unknown>;
  const url = typeof o.url === "string" ? o.url.trim() : "";
  if (!url) return null;
  let file_name = typeof o.file_name === "string" ? o.file_name.trim() : "";
  if (!file_name) file_name = mediaFileNameFromUrl(url);
  if (!file_name) return null;

  const display_order =
    typeof o.display_order === "number" && Number.isFinite(o.display_order)
      ? o.display_order
      : undefined;
  const caption = typeof o.caption === "string" && o.caption.trim() ? o.caption.trim() : undefined;

  return {
    file_name,
    url,
    ...(o.is_primary === true ? { is_primary: true } : {}),
    ...(display_order !== undefined ? { display_order } : {}),
    ...(caption ? { caption } : {}),
  };
}

export function parseMediaFileRefs(rows: unknown): MediaFileRef[] {
  if (!Array.isArray(rows)) return [];
  const out: MediaFileRef[] = [];
  for (const row of rows) {
    const parsed = mediaFileRefFromApiRow(row);
    if (parsed) out.push(parsed);
  }
  return out;
}

/** After presigned PUT — keep API `url`, name from the file the user picked. */
export function mediaFileRefFromUpload(file: File, url: string): MediaFileRef {
  return {
    file_name: displayMediaFileName("", url, file.name),
    url,
  };
}
