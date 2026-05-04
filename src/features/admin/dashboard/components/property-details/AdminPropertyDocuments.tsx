"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, ShieldCheck, Upload, X, File } from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

interface DocumentUploadSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  files: UploadedFile[];
  onFilesAdd: (files: FileList) => void;
  onFileRemove: (id: string) => void;
}

function DocumentUploadSection({
  title,
  description,
  icon,
  accentColor,
  files,
  onFilesAdd,
  onFileRemove,
}: DocumentUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesAdd(e.dataTransfer.files);
      }
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
      if (e.target.files && e.target.files.length > 0) {
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

      <div className="p-5">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-zinc-300 bg-zinc-50/50 hover:border-primary/50 hover:bg-primary/[0.02]"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
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
            <p className="mt-1 text-size-xs text-zinc-500">PDF, DOC, DOCX, JPG, PNG, WEBP</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-subtle bg-zinc-50/80 px-4 py-3 transition-colors hover:bg-zinc-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <File className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-size-sm fw-medium text-charcoal">{f.name}</p>
                  <p className="text-size-xs text-zinc-500">{f.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(f.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPropertyDocuments() {
  const [propertyDocs, setPropertyDocs] = useState<UploadedFile[]>([]);
  const [socialSecurityDocs, setSocialSecurityDocs] = useState<UploadedFile[]>([]);

  const addFiles = useCallback(
    (setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) =>
      (fileList: FileList) => {
        const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
        }));
        setter((prev) => [...prev, ...newFiles]);
      },
    [],
  );

  const removeFile = useCallback(
    (setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) =>
      (id: string) => {
        setter((prev) => prev.filter((f) => f.id !== id));
      },
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentUploadSection
          title="Property documents"
          description="Upload deeds, floor plans, and supporting property documents."
          icon={<FileText className="h-5 w-5 text-white" />}
          accentColor="bg-gradient-to-r from-[#1a3b5c] to-[#2a5580]"
          files={propertyDocs}
          onFilesAdd={addFiles(setPropertyDocs)}
          onFileRemove={removeFile(setPropertyDocs)}
        />
        <DocumentUploadSection
          title="Owner identity documents"
          description="Upload social security and identity documents for verification."
          icon={<ShieldCheck className="h-5 w-5 text-white" />}
          accentColor="bg-gradient-to-r from-[#1a3b5c] to-[#2a5580]"
          files={socialSecurityDocs}
          onFilesAdd={addFiles(setSocialSecurityDocs)}
          onFileRemove={removeFile(setSocialSecurityDocs)}
        />
      </div>
    </div>
  );
}

