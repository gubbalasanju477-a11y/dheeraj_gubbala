"use client";

import { AlertCircle, FileText, Image as ImageIcon, Loader2, X } from "lucide-react";
import { UploadedDocument } from "@/types/print";
import { formatBytes, cn } from "@/lib/utils";

export function UploadedFileCard({
  document,
  onRemove,
}: {
  document: UploadedDocument;
  onRemove: (id: string) => void;
}) {
  const isImage = document.type === "jpg" || document.type === "png";
  const isError = document.status === "error";
  const isUploading = document.status === "uploading";

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-soft animate-fade-up",
        isError ? "border-danger/40 bg-danger-soft/40" : "border-border"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          isError ? "bg-danger-soft" : "bg-accent-soft"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        ) : isError ? (
          <AlertCircle className="h-5 w-5 text-danger" />
        ) : isImage ? (
          <ImageIcon className="h-5 w-5 text-accent" />
        ) : (
          <FileText className="h-5 w-5 text-accent" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{document.name}</p>
        {isError ? (
          <p className="text-xs text-danger">{document.errorMessage}</p>
        ) : isUploading ? (
          <p className="text-xs text-ink-muted">Uploading…</p>
        ) : (
          <p className="text-xs text-ink-muted">
            {formatBytes(document.sizeBytes)} · {document.pageCount} page
            {document.pageCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`Remove ${document.name}`}
        onClick={() => onRemove(document.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-bg hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
