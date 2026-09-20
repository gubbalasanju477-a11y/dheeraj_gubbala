"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/customer/Header";
import { ProgressSteps } from "@/components/customer/ProgressSteps";
import { FileUploader } from "@/components/customer/FileUploader";
import { UploadedFileCard } from "@/components/customer/UploadedFileCard";
import { Button } from "@/components/ui/button";
import { usePrintOrder } from "@/lib/store";
import { uploadDocument } from "@/lib/api";
import { UploadedDocument } from "@/types/print";

export default function UploadPage() {
  const router = useRouter();
  const { documents, addDocument, removeDocument } = usePrintOrder();

  const hasReadyFile = documents.some((d) => d.status === "ready");

  async function handleFilesSelected(files: File[]) {
    for (const file of files) {
      const tempId = `pending_${Date.now()}_${Math.random()}`;
      const placeholder: UploadedDocument = {
        id: tempId,
        name: file.name,
        sizeBytes: file.size,
        pageCount: 0,
        type: file.name.toLowerCase().endsWith(".png")
          ? "png"
          : /\.(jpg|jpeg)$/i.test(file.name)
          ? "jpg"
          : "pdf",
        status: "uploading",
      };
      addDocument(placeholder);
      const result = await uploadDocument(file);
      removeDocument(tempId);
      addDocument(result);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <ProgressSteps current={1} />

      <main className="container max-w-2xl bottom-cta-safe pb-28 pt-8 sm:pb-16">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="font-display text-2xl font-semibold text-ink">Upload your document</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Add one or more files — we'll detect the page count automatically.
          </p>
        </div>

        <FileUploader onFilesSelected={handleFilesSelected} />

        {documents.length > 0 && (
          <div className="mt-6 space-y-3">
            {documents.map((doc) => (
              <UploadedFileCard key={doc.id} document={doc} onRemove={removeDocument} />
            ))}
          </div>
        )}

        <div className="mt-8 hidden justify-end sm:flex">
          <Button size="lg" disabled={!hasReadyFile} onClick={() => router.push("/print/options")}>
            Continue
          </Button>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-4 backdrop-blur-md sm:hidden">
        <Button
          size="lg"
          className="w-full"
          disabled={!hasReadyFile}
          onClick={() => router.push("/print/options")}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
