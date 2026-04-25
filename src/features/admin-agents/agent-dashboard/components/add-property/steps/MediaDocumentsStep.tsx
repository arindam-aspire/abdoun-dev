"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { uploadFileForSubmission } from "@/features/admin-agents/agent-dashboard/lib/submissionFileUpload";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { CardSection, FieldLabel, FormField, wizardFieldClassName } from "../AddPropertyStepLayout";
import {
  addMediaImage,
  addMediaVideo,
  addPropertyListingDocument,
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

export function MediaDocumentsStep() {
  const dispatch = useAppDispatch();
  const { youtubeUrl, virtualTourUrl, submissionId, mediaImages, mediaVideos, propertyListingDocuments } =
    useAppSelector(selectAddPropertyWizard);
  const [pending, setPending] = useState<PendingPreview[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [pending]);

  const uploadMediaBatch = async (files: File[]) => {
    if (!submissionId) {
      setError("Submission is not ready. Please wait and try again.");
      return;
    }
    const nextPending: PendingPreview[] = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPending((c) => [...c, ...nextPending]);
    setError(null);
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/");
        const context = isVideo ? "property_media_video" : "property_media_image";
        const row: MediaFileRef = await uploadFileForSubmission(submissionId, file, context);
        if (isVideo) {
          dispatch(addMediaVideo(row));
        } else {
          dispatch(addMediaImage(row));
        }
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setPending((current) => {
        nextPending.forEach((p) => {
          const still = current.find((x) => x.id === p.id);
          if (still) URL.revokeObjectURL(still.url);
        });
        return current.filter((c) => !nextPending.some((p) => p.id === c.id));
      });
    }
  };

  const addMediaFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (accepted.length === 0) return;
    void uploadMediaBatch(accepted);
  };

  const removeUploadedImage = (index: number) => {
    dispatch(setMediaImages(mediaImages.filter((_, i) => i !== index)));
  };

  const removeUploadedVideo = (index: number) => {
    dispatch(setMediaVideos(mediaVideos.filter((_, i) => i !== index)));
  };

  const addDocuments = async (files: FileList | null) => {
    if (!files || !submissionId) {
      if (!submissionId) setError("Submission is not ready. Please wait and try again.");
      return;
    }
    const accepted = Array.from(files).filter((file) => {
      const type = file.type.toLowerCase();
      return (
        type.includes("pdf") ||
        type.includes("msword") ||
        type.includes("wordprocessingml") ||
        type.startsWith("image/")
      );
    });
    if (accepted.length === 0) return;
    setDocUploading(true);
    setError(null);
    try {
      for (const file of accepted) {
        const row = await uploadFileForSubmission(submissionId, file, "property_document");
        dispatch(addPropertyListingDocument(row));
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
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
    >
      {error ? (
        <p className="mb-3 text-size-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
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
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            multiple
            className="hidden"
            onChange={(event) => {
              addMediaFiles(event.target.files);
              event.target.value = "";
            }}
            disabled={!submissionId}
          />
          <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e1ee] bg-white text-[#3a5268]">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-[27px] fw-medium text-[#2f3a47]">Choose a file or drag & drop it here</p>
          <p className="mt-2 text-size-sm text-[#8a97a8]">JPEG, PNG, WEBP, GIF, and MP4 formats, up to 50MB</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!submissionId}
            className="mt-5 inline-flex h-11 min-w-44 items-center justify-center rounded-xl border border-[#c8d3e2] bg-white px-6 text-base fw-medium text-[#2a4a67] shadow-sm transition-colors hover:bg-[#f7faff] disabled:opacity-50"
          >
            Browse File
          </button>

          {pending.length > 0 || mediaImages.length > 0 || mediaVideos.length > 0 ? (
            <div>
              <h3 className="mt-7 text-size-xl fw-semibold text-[#24415c]">Media Preview</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                {pending.map((item) => (
                  <div key={item.id} className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]">
                    {item.kind === "video" ? (
                      <video src={item.url} className="h-28 w-full object-cover" controls />
                    ) : (
                      <img src={item.url} alt={item.file.name} className="h-28 w-full object-cover" />
                    )}
                    <p className="truncate px-1 text-[10px] text-[#64748b]">Uploading…</p>
                  </div>
                ))}
                {mediaVideos.map((item, index) => (
                  <div
                    key={`v-${item.url}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]"
                  >
                    <div className="flex h-28 w-full items-center justify-center text-size-xs text-[#64748b]">
                      {item.file_name}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedVideo(index)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {mediaImages.map((item, index) => (
                  <div
                    key={`i-${item.url}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-[#d3dce9] bg-[#eef2f7]"
                  >
                    <p className="line-clamp-2 p-2 text-size-xs text-[#475569]">{item.file_name}</p>
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
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
            Upload multiple documents and verification documents (PDF, DOC, Images).
          </p>

          <input
            ref={documentInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(event) => {
              void addDocuments(event.target.files);
              event.target.value = "";
            }}
            disabled={docUploading || !submissionId}
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
                disabled={docUploading || !submissionId}
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
    </CardSection>
  );
}
