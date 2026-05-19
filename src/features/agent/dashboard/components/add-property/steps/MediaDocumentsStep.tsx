"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { AppImage } from "@/components/ui/AppImage";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { useRestoredMediaPreviews } from "@/features/agent/dashboard/hooks/useRestoredMediaPreviews";
import { displayMediaFileName } from "@/features/agent/dashboard/lib/mediaFileRefUtils";
import { uploadPropertyFile } from "@/features/agent/dashboard/lib/submissionFileUpload";
import {
  deleteMediaPreviewCache,
  putMediaPreviewCache,
} from "@/lib/media/mediaPreviewCache";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { CardSection, FieldLabel, FormField, wizardFieldClassName } from "../AddPropertyStepLayout";
import {
  addMediaImage,
  addMediaVideo,
  addPropertyListingDocument,
  selectAddPropertyIsEditable,
  selectAddPropertyWizard,
  setMediaImages,
  setMediaVideos,
  setPropertyListingDocuments,
  setVirtualTourUrl,
  setYoutubeUrl,
} from "../addPropertyWizardSlice";
import type { MediaFileRef } from "../addPropertyWizard.types";

type PendingPreview = {
  id: string;
  file: File;
  url: string;
  kind: "image" | "video";
};

const IMAGE_MAX_SIZE_MB = 5;
const DOCUMENT_MAX_SIZE_MB = 10;
const VIDEO_MAX_SIZE_MB = 5;
const VIDEO_REQUIRED_WIDTH = 1280;
const VIDEO_REQUIRED_HEIGHT = 720;
const VIDEO_MIN_DURATION_SEC = 10;
const VIDEO_MAX_DURATION_SEC = 15;

function maxBytes(mb: number): number {
  return mb * 1024 * 1024;
}

function prettyMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
}

async function getVideoMeta(file: File): Promise<{ width: number; height: number; duration: number }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onerror = null;
      };
      video.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("Unable to read video metadata."));
      };
      video.src = url;
    });

    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MediaDocumentsStep() {
  const dispatch = useAppDispatch();
  const { youtubeUrl, virtualTourUrl, submissionId, draftClientId, mediaImages, mediaVideos, propertyListingDocuments } =
    useAppSelector(selectAddPropertyWizard);
  const canEdit = useAppSelector(selectAddPropertyIsEditable);
  const canUpload = canEdit && (Boolean(submissionId) || Boolean(draftClientId));
  const [pending, setPending] = useState<PendingPreview[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  /** In-session blob preview + original file name; API `url` is private S3, not `<img src>`. */
  const localPreviewByUrlRef = useRef<Record<string, { blobUrl: string; fileName: string }>>({});
  const [, setPreviewEpoch] = useState(0);
  /** Canonical URLs where private S3 GET failed and no local/cache preview exists. */
  const [previewUnavailableUrls, setPreviewUnavailableUrls] = useState<Set<string>>(() => new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const showErrorToast = (message: string) => {
    setToast({ kind: "error", message });
  };

  const getDisplaySrc = (storedUrl: string) =>
    localPreviewByUrlRef.current[storedUrl]?.blobUrl ?? storedUrl;

  const getMediaDisplayName = (storedUrl: string, fileName: string) => {
    const local = localPreviewByUrlRef.current[storedUrl]?.fileName;
    return displayMediaFileName(fileName, storedUrl, local);
  };

  const retainLocalPreview = (storedUrl: string, blobUrl: string, fileName: string) => {
    localPreviewByUrlRef.current[storedUrl] = { blobUrl, fileName };
    setPreviewUnavailableUrls((prev) => {
      if (!prev.has(storedUrl)) return prev;
      const next = new Set(prev);
      next.delete(storedUrl);
      return next;
    });
    setPreviewEpoch((n) => n + 1);
  };

  const releaseLocalPreview = (storedUrl: string) => {
    const entry = localPreviewByUrlRef.current[storedUrl];
    if (entry?.blobUrl) URL.revokeObjectURL(entry.blobUrl);
    delete localPreviewByUrlRef.current[storedUrl];
    void deleteMediaPreviewCache(storedUrl);
  };

  useRestoredMediaPreviews(
    [...mediaImages, ...mediaVideos],
    (storedUrl, blobUrl, fileName) => {
      if (localPreviewByUrlRef.current[storedUrl]) return;
      retainLocalPreview(storedUrl, blobUrl, fileName);
    },
  );

  const markPreviewUnavailable = (storedUrl: string) => {
    if (localPreviewByUrlRef.current[storedUrl]) return;
    setPreviewUnavailableUrls((prev) => {
      if (prev.has(storedUrl)) return prev;
      const next = new Set(prev);
      next.add(storedUrl);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.url));
      Object.values(localPreviewByUrlRef.current).forEach((entry) =>
        URL.revokeObjectURL(entry.blobUrl),
      );
      localPreviewByUrlRef.current = {};
    };
  }, [pending]);

  const removePendingPreview = (id: string) => {
    setPending((current) => {
      const item = current.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return current.filter((x) => x.id !== id);
    });
  };

  const uploadMediaBatch = async (files: File[]) => {
    if (!canEdit || !canUpload) {
      if (!canUpload) {
        showErrorToast("Upload is not available. Save a draft or try again.");
      }
      return;
    }

    const validFiles: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const name = file.name.toLowerCase();
      const isImage = /\.(jpg|jpeg|png|webp)$/.test(name);
      const isVideo = /\.(mp4|mov|avi)$/.test(name);
      if (!isImage && !isVideo) {
        rejected.push(`${file.name}: unsupported file type.`);
        continue;
      }

      if (isImage) {
        if (file.size > maxBytes(IMAGE_MAX_SIZE_MB)) {
          rejected.push(
            `${file.name}: image must be ≤ ${IMAGE_MAX_SIZE_MB}MB (selected ${prettyMb(file.size)}).`,
          );
          continue;
        }
        validFiles.push(file);
        continue;
      }

      // video
      if (file.size > maxBytes(VIDEO_MAX_SIZE_MB)) {
        rejected.push(
          `${file.name}: video must be ≤ ${VIDEO_MAX_SIZE_MB}MB (selected ${prettyMb(file.size)}).`,
        );
        continue;
      }
      try {
        const meta = await getVideoMeta(file);
        if (meta.width !== VIDEO_REQUIRED_WIDTH || meta.height !== VIDEO_REQUIRED_HEIGHT) {
          rejected.push(
            `${file.name}: video resolution must be ${VIDEO_REQUIRED_WIDTH}x${VIDEO_REQUIRED_HEIGHT} (got ${meta.width}x${meta.height}).`,
          );
          continue;
        }
        if (meta.duration < VIDEO_MIN_DURATION_SEC || meta.duration > VIDEO_MAX_DURATION_SEC) {
          rejected.push(
            `${file.name}: video duration must be ${VIDEO_MIN_DURATION_SEC}-${VIDEO_MAX_DURATION_SEC}s (got ${meta.duration.toFixed(1)}s).`,
          );
          continue;
        }
      } catch {
        rejected.push(`${file.name}: unable to validate video metadata.`);
        continue;
      }
      validFiles.push(file);
    }

    if (rejected.length) {
      const rejectionMessage =
        rejected.slice(0, 3).join(" ") + (rejected.length > 3 ? ` (+${rejected.length - 3} more)` : "");
      showErrorToast(rejectionMessage);
      if (!validFiles.length) return;
    }

    const nextPending: PendingPreview[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      kind: /\.(mp4|mov|avi)$/.test(file.name.toLowerCase()) ? "video" : "image",
    }));
    setPending((c) => [...c, ...nextPending]);
    setMediaUploading(true);

    try {
      for (const preview of nextPending) {
        const { file } = preview;
        const isVideo = /\.(mp4|mov|avi)$/.test(file.name.toLowerCase());
        const context = isVideo ? "property_media_video" : "property_media_image";
        try {
          const row: MediaFileRef = submissionId
            ? await uploadPropertyFile({ submissionId, file, context })
            : await uploadPropertyFile({ draftClientId, file, context });
          retainLocalPreview(row.url, preview.url, file.name);
          void putMediaPreviewCache(row.url, file, file.name);
          setPending((current) => current.filter((x) => x.id !== preview.id));
          if (isVideo) {
            dispatch(addMediaVideo(row));
          } else {
            dispatch(addMediaImage(row));
          }
        } catch (e) {
          removePendingPreview(preview.id);
          showErrorToast(
            `${file.name}: ${getApiErrorMessage(
              e,
              "Upload failed. Please check file type, storage access, or try again.",
            )}`,
          );
        }
      }
    } finally {
      setMediaUploading(false);
    }
  };

  const addMediaFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => {
      const name = file.name.toLowerCase();
      const isImage = /\.(jpg|jpeg|png|webp)$/.test(name);
      const isVideo = /\.(mp4|mov|avi)$/.test(name);
      return isImage || isVideo;
    });
    if (accepted.length === 0) return;
    void uploadMediaBatch(accepted);
  };

  const removeUploadedImage = (index: number) => {
    const removed = mediaImages[index];
    if (removed?.url) releaseLocalPreview(removed.url);
    dispatch(setMediaImages(mediaImages.filter((_, i) => i !== index)));
  };

  const removeUploadedVideo = (index: number) => {
    const removed = mediaVideos[index];
    if (removed?.url) releaseLocalPreview(removed.url);
    dispatch(setMediaVideos(mediaVideos.filter((_, i) => i !== index)));
  };

  const addDocuments = async (files: FileList | null) => {
    if (!canEdit || !canUpload) {
      if (files && !canUpload) {
        showErrorToast("Upload is not available. Save a draft or try again.");
      }
      return;
    }
    if (!files) return;
    const accepted = Array.from(files).filter((file) => {
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) return false;
      if (file.size > maxBytes(DOCUMENT_MAX_SIZE_MB)) return false;
      return true;
    });
    const rejected = Array.from(files).filter((file) => !accepted.includes(file));
    if (rejected.length) {
      const reasons = rejected.slice(0, 3).map((f) => {
        if (!f.name.toLowerCase().endsWith(".pdf")) return `${f.name}: documents must be PDF.`;
        return `${f.name}: document must be ≤ ${DOCUMENT_MAX_SIZE_MB}MB (selected ${prettyMb(f.size)}).`;
      });
      showErrorToast(
        reasons.join(" ") + (rejected.length > 3 ? ` (+${rejected.length - 3} more)` : ""),
      );
    }
    if (accepted.length === 0) return;
    setDocUploading(true);
    try {
      for (const file of accepted) {
        try {
          const row = submissionId
            ? await uploadPropertyFile({ submissionId, file, context: "property_document" })
            : await uploadPropertyFile({ draftClientId, file, context: "property_document" });
          dispatch(addPropertyListingDocument(row));
        } catch (e) {
          showErrorToast(
            `${file.name}: ${getApiErrorMessage(
              e,
              "Upload failed. Please check file type, storage access, or try again.",
            )}`,
          );
        }
      }
    } finally {
      setDocUploading(false);
    }
  };

  const removePropertyDocument = (index: number) => {
    dispatch(setPropertyListingDocuments(propertyListingDocuments.filter((_, i) => i !== index)));
  };

  return (
    <CardSection
      title="Media & Documents"
      description="Enter the media details for this property record. This information will be used for official ledger entries and contract generation."
      required
      readOnlyForm={!canEdit}
    >
      <div className="space-y-7">
        <div
          className="rounded-[20px] border-2 border-dashed border-[#cfd8e5] bg-[#fbfdff] px-6 py-10 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addMediaFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/avi"
            multiple
            className="hidden"
            onChange={(event) => {
              addMediaFiles(event.target.files);
              event.target.value = "";
            }}
            disabled={!canUpload || mediaUploading}
          />
          <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e1ee] bg-white text-[#3a5268]">
            {mediaUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <p className="text-[27px] fw-medium text-[#2f3a47]">Choose a file or drag & drop it here</p>
          <p className="mt-2 text-size-sm text-[#8a97a8]">JPG, JPEG, PNG, WEBP, MP4, MOV, AVI formats, up to 50MB</p>
          <p className="mt-1 text-size-xs text-[#8a97a8]">Images: max {IMAGE_MAX_SIZE_MB}MB. Videos: {VIDEO_REQUIRED_WIDTH}x{VIDEO_REQUIRED_HEIGHT}, {VIDEO_MIN_DURATION_SEC}-{VIDEO_MAX_DURATION_SEC}s, max {VIDEO_MAX_SIZE_MB}MB.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload || mediaUploading}
            className="mt-5 inline-flex h-11 min-w-44 items-center justify-center rounded-xl border border-[#c8d3e2] bg-white px-6 text-base fw-medium text-[#2a4a67] shadow-sm transition-colors hover:bg-[#f7faff] disabled:opacity-50"
          >
            {mediaUploading ? "Uploading…" : "Browse File"}
          </button>

          {pending.length > 0 || mediaImages.length > 0 || mediaVideos.length > 0 ? (
            <div>
              <h3 className="mt-7 text-size-xl fw-semibold text-[#24415c]">Media Preview</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                {pending.map((item) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]"
                  >
                    {item.kind === "video" ? (
                      <video
                        src={item.url}
                        className="h-28 w-full object-cover opacity-60"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.file.name}
                        className="h-28 w-full object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/35 px-2 text-white">
                      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                      <p className="text-center text-[10px] fw-medium">Uploading…</p>
                    </div>
                    <p
                      className="truncate border-t border-[#d3dce9] bg-white/95 px-2 py-1 text-[10px] text-[#64748b]"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                  </div>
                ))}
                {mediaVideos.map((item, index) => {
                  const videoSrc = getDisplaySrc(item.url);
                  const isLocalPreview = videoSrc !== item.url;
                  const mediaName = getMediaDisplayName(item.url, item.file_name);
                  const showUnavailable = !isLocalPreview && previewUnavailableUrls.has(item.url);
                  return (
                    <div
                      key={`v-${item.url}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]"
                    >
                      {showUnavailable ? (
                        <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-[#e8edf3] px-2 text-center text-[10px] text-[#64748b]">
                          <FileText className="h-5 w-5 shrink-0 opacity-60" aria-hidden />
                          <span>Preview unavailable</span>
                        </div>
                      ) : (
                        <video
                          src={videoSrc}
                          className="h-28 w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                          onError={() => markPreviewUnavailable(item.url)}
                        />
                      )}
                      <p className="truncate px-2 py-1 text-[10px] text-[#64748b]" title={mediaName}>
                        {mediaName}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeUploadedVideo(index)}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {mediaImages.map((item, index) => {
                  const imageSrc = getDisplaySrc(item.url);
                  const isLocalPreview = imageSrc !== item.url;
                  const mediaName = getMediaDisplayName(item.url, item.file_name);
                  const showUnavailable = !isLocalPreview && previewUnavailableUrls.has(item.url);
                  return (
                    <div
                      key={`i-${item.url}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]"
                    >
                      <div className="relative h-28 w-full bg-[#eef2f7]">
                        {showUnavailable ? (
                          <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-[#e8edf3] px-2 text-center text-[10px] text-[#64748b]">
                            <FileText className="h-5 w-5 shrink-0 opacity-60" aria-hidden />
                            <span>Preview unavailable</span>
                          </div>
                        ) : isLocalPreview ? (
                          <img
                            src={imageSrc}
                            alt={mediaName}
                            className="h-28 w-full object-cover"
                          />
                        ) : (
                          <AppImage
                            src={item.url}
                            alt={mediaName}
                            fill
                            sizes="(min-width: 768px) 20vw, 50vw"
                            className="object-cover"
                            onError={() => markPreviewUnavailable(item.url)}
                          />
                        )}
                      </div>
                      <p className="truncate px-2 py-1 text-[10px] text-[#64748b]" title={mediaName}>
                        {mediaName}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-size-xl fw-semibold text-[#24415c]">YouTube/ Virtual Tour Link</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <FormField>
              <FieldLabel htmlFor="youtube-url" label="YouTube URL" />
              <div className="flex">
                <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-[#b8c8ea] bg-[#f8fafc] px-4 text-sm text-[#55657a]">
                  https://
                </span>
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(event) => dispatch(setYoutubeUrl(event.target.value))}
                  placeholder="Link goes here"
                  className={`${wizardFieldClassName} rounded-l-none`}
                />
              </div>
            </FormField>

            <FormField>
              <FieldLabel htmlFor="virtual-tour-url" label="Virtual Tour URL" />
              <div className="flex">
                <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-[#b8c8ea] bg-[#f8fafc] px-4 text-sm text-[#55657a]">
                  https://
                </span>
                <Input
                  id="virtual-tour-url"
                  value={virtualTourUrl}
                  onChange={(event) => dispatch(setVirtualTourUrl(event.target.value))}
                  placeholder="Link goes here"
                  className={`${wizardFieldClassName} rounded-l-none`}
                />
              </div>
            </FormField>
          </div>
        </div>

        <div>
          <h3 className="text-size-xl fw-semibold text-[#24415c]">Documents</h3>
          <p className="mt-1 text-size-sm text-[#6b7c93]">
            Upload multiple documents and verification documents (PDF).
          </p>
          <p className="mt-1 text-size-xs text-[#6b7c93]">Max {DOCUMENT_MAX_SIZE_MB}MB per PDF.</p>

          <input
            ref={documentInputRef}
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={(event) => {
              void addDocuments(event.target.files);
              event.target.value = "";
            }}
            disabled={docUploading || !canUpload}
          />

          <div
            className="mt-4 rounded-3xl border-2 border-dashed border-[#cfd8e5] bg-[#eef2f7] p-5"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void addDocuments(event.dataTransfer.files);
            }}
          >
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                disabled={docUploading || !canUpload}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#c8d3e2] bg-white px-4 text-sm fw-medium text-[#2a4a67] hover:bg-[#f7faff] disabled:opacity-50"
              >
                {docUploading ? "Uploading…" : "Upload Document"}
              </button>
            </div>

            {propertyListingDocuments.length === 0 ? (
              <p className="text-size-sm text-[#7a8899] text-center">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {propertyListingDocuments.map((file, index) => (
                  <div key={`${file.url}-${index}`} className="rounded-2xl bg-[#e6ecf4] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#cfd8e5] bg-white text-[#3f5368]">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-size-sm fw-semibold text-[#2f3f52]">{file.file_name}</p>
                          <p className="mt-1 text-size-sm text-[#8a97a8]">Stored on server</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePropertyDocument(index)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#90a0b5] text-[#2f3f52]"
                        aria-label="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[#cdd5e2]">
                      <div className="h-full w-full rounded-full bg-[#2f4e68]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          duration={toast.kind === "error" ? 6000 : 4000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </CardSection>
  );
}
