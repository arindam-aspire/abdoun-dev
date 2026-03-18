"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, Play, FileVideo } from "lucide-react";
import type { ReactNode } from "react";
import type { UploadedFile } from "./DocumentUploadField";

const IMAGE_TYPES = /^image\//;
const VIDEO_TYPES = /^video\//;

export interface MediaUploadFieldProps {
  title: string;
  description: string;
  icon: ReactNode;
  accentColor?: string;
  files: UploadedFile[];
  onFilesAdd: (files: FileList) => void;
  onFileRemove: (id: string) => void;
  accept: string;
  acceptHint?: string;
}

export function MediaUploadField({
  title,
  description,
  icon,
  accentColor = "bg-gradient-to-r from-primary to-primary/80",
  files,
  onFilesAdd,
  onFileRemove,
  accept,
  acceptHint = "JPG, PNG, WEBP, GIF",
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const fileIds = new Set(files.map((f) => f.id));
    const current = previewUrlsRef.current;

    Object.keys(current).forEach((id) => {
      if (!fileIds.has(id)) {
        URL.revokeObjectURL(current[id]);
        delete current[id];
      }
    });

    files.forEach((f) => {
      if (!current[f.id] && (IMAGE_TYPES.test(f.file.type) || VIDEO_TYPES.test(f.file.type))) {
        current[f.id] = URL.createObjectURL(f.file);
      }
    });

    setPreviewUrls({ ...current });
  }, [files]);

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach(URL.revokeObjectURL);
      previewUrlsRef.current = {};
    };
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) onFilesAdd(e.dataTransfer.files);
    },
    [onFilesAdd],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        onFilesAdd(e.target.files);
        e.target.value = "";
      }
    },
    [onFilesAdd],
  );

  return (
    <div className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-subtle ${accentColor}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        <div>
          <h3 className="text-size-sm fw-semibold text-white">{title}</h3>
          <p className="text-size-xs text-white/80">{description}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-zinc-300 bg-zinc-50/50 hover:border-primary/50 hover:bg-primary/[0.02]"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isDragOver
                ? "bg-primary/15 text-primary"
                : "bg-zinc-100 text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary"
            }`}
          >
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-size-sm fw-medium text-charcoal">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-size-xs text-zinc-500">{acceptHint}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div>
            <p className="text-size-xs fw-medium text-charcoal/70 mb-3">Uploaded ({files.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((f) => {
                const url = previewUrls[f.id];
                const isImage = IMAGE_TYPES.test(f.file.type);
                const isVideo = VIDEO_TYPES.test(f.file.type);
                return (
                  <div
                    key={f.id}
                    className="group relative rounded-xl border border-subtle bg-zinc-50/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-zinc-100 relative">
                      {isImage && url ? (
                        <img src={url} alt={f.name} className="w-full h-full object-cover" />
                      ) : isVideo && url ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-zinc-200">
                          <video
                            src={url}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary">
                              <Play className="h-5 w-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <FileVideo className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="px-2.5 py-2 border-t border-subtle">
                      <p className="truncate text-size-xs fw-medium text-charcoal" title={f.name}>
                        {f.name}
                      </p>
                      <p className="text-size-xs text-zinc-500">{f.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileRemove(f.id);
                      }}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

