"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Header } from "@/components/customer/Header";
import { ProgressSteps } from "@/components/customer/ProgressSteps";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { usePrintOrder } from "@/lib/store";

const COLOR_LABEL = { bw: "B&W", color: "Color" } as const;
const SIDES_LABEL = { single: "Single-sided", double: "Double-sided" } as const;

export default function ReviewPage() {
  const router = useRouter();
  const { documents, options, price, totalPages } = usePrintOrder();
  const [confirmed, setConfirmed] = useState(false);

  const readyDocs = documents.filter((d) => d.status === "ready");

  useEffect(() => {
    if (readyDocs.length === 0) router.replace("/print/upload");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (readyDocs.length === 0 || !price) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <ProgressSteps current={3} />
        <main className="container max-w-2xl py-10">
          <EmptyState
            icon={FileText}
            title="Nothing to review yet"
            description="Upload a document and choose your print settings first."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <ProgressSteps current={3} />

      <main className="container max-w-2xl bottom-cta-safe pb-28 pt-8 sm:pb-16">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Review your order</h1>
        <p className="mb-6 text-sm text-ink-muted">
          Double-check your documents and print settings before paying.
        </p>

        <div className="ticket overflow-hidden border border-border shadow-soft">
          <div className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Documents
            </p>
            <div className="space-y-3">
              {readyDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <FileText className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{doc.name}</p>
                    <p className="text-xs text-ink-muted">
                      {doc.pageCount} pages × {options.copies} cop{options.copies > 1 ? "ies" : "y"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ticket-divider mx-5" />

          <div className="p-5 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Print settings
            </p>
            <div className="flex flex-wrap gap-2">
              {[COLOR_LABEL[options.color], options.paperSize, SIDES_LABEL[options.sides]].map(
                (tag) => (
                  <span key={tag} className="rounded-lg bg-bg px-2.5 py-1 text-xs font-medium text-ink-muted">
                    {tag}
                  </span>
                )
              )}
              {options.pageRangeMode === "custom" && (
                <span className="rounded-lg bg-bg px-2.5 py-1 text-xs font-medium text-ink-muted">
                  Pages: {options.customRange || "—"}
                </span>
              )}
            </div>
          </div>

          <div className="ticket-divider mx-5" />

          <div className="space-y-2 p-5 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Printing ({price.billablePages} pages)</span>
              <span className="font-medium text-ink">{formatCurrency(price.printingCost)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Service fee</span>
              <span className="font-medium text-ink">{formatCurrency(price.serviceFee)}</span>
            </div>
            {price.minimumOrderApplied && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Minimum order adjustment</span>
                <span className="font-medium text-ink">
                  +{formatCurrency(price.minimumOrder - (price.printingCost + price.serviceFee))}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="font-display text-sm font-semibold text-ink">Total</span>
              <span className="font-mono text-xl font-semibold text-accent">
                {formatCurrency(price.total)}
              </span>
            </div>
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-white p-4">
          <Checkbox checked={confirmed} onCheckedChange={setConfirmed} aria-label="Confirm print settings" />
          <span className="text-sm text-ink">
            I confirm that my print settings are correct.
          </span>
        </label>

        <div className="mt-6 hidden items-center justify-between sm:flex">
          <Button variant="ghost" onClick={() => router.push("/print/options")}>
            Edit Print Settings
          </Button>
          <Button size="lg" disabled={!confirmed} onClick={() => router.push("/print/payment")}>
            Proceed to Payment
          </Button>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 space-y-2 border-t border-border bg-surface/95 p-4 backdrop-blur-md sm:hidden">
        <Button size="lg" className="w-full" disabled={!confirmed} onClick={() => router.push("/print/payment")}>
          Proceed to Payment
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/print/options")}>
          Edit Print Settings
        </Button>
      </div>
    </div>
  );
}
