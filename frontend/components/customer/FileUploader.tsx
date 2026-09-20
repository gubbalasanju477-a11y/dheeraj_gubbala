"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, FolderOpen, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";

export function FileUploader({ onFilesSelected, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFilesSelected(Array.from(fileList));
    },
    [onFilesSelected]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload your document. PDF, JPG or PNG, maximum 25 megabytes."
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition-colors sm:py-16",
        isDragging ? "border-accent bg-accent-softer" : "border-border-strong hover:border-accent/50",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft">
        <UploadCloud className="h-7 w-7 text-accent" />
      </div>
      <p className="font-display text-lg font-semibold text-ink">Upload your document</p>
      <p className="mt-1 text-sm text-ink-muted">PDF, JPG or PNG</p>
      <p className="text-sm text-ink-faint">Maximum file size: 25 MB</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row" onClick={(e) => e.stopPropagation()}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <FolderOpen className="h-[18px] w-[18px]" />
          Choose File
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
        >
          <Camera className="h-[18px] w-[18px]" />
          Take Photo
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
