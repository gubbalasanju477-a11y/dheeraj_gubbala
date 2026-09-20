"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Layers, Palette, RectangleHorizontal, RectangleVertical } from "lucide-react";
import { Header } from "@/components/customer/Header";
import { ProgressSteps } from "@/components/customer/ProgressSteps";
import { PrintOptionCard } from "@/components/customer/PrintOptionCard";
import { QuantitySelector } from "@/components/customer/QuantitySelector";
import { PriceSummary } from "@/components/customer/PriceSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePrintOrder } from "@/lib/store";

export default function OptionsPage() {
  const router = useRouter();
  const { documents, options, setOptions, totalPages, price, isCalculating, recalculate } =
    usePrintOrder();

  const readyDocs = documents.filter((d) => d.status === "ready");

  useEffect(() => {
    if (readyDocs.length > 0) recalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, totalPages]);

  useEffect(() => {
    if (readyDocs.length === 0) router.replace("/print/upload");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (readyDocs.length === 0) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <ProgressSteps current={2} />
        <main className="container max-w-2xl py-10">
          <EmptyState
            icon={FileText}
            title="No documents uploaded yet"
            description="Go back and upload a document to configure print settings."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <ProgressSteps current={2} />

      <main className="container bottom-cta-safe grid grid-cols-1 gap-8 pb-28 pt-8 sm:pb-16 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6 space-y-2.5">
            {readyDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <FileText className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{doc.name}</p>
                  <p className="text-xs text-ink-muted">{doc.pageCount} pages</p>
                </div>
              </div>
            ))}
          </div>

          <section className="mb-7">
            <h2 className="mb-3 text-sm font-semibold text-ink">Color</h2>
            <div className="flex gap-3">
              <PrintOptionCard
                icon={Palette}
                label="Black & White"
                sublabel="₹1 / page"
                selected={options.color === "bw"}
                onClick={() => setOptions({ color: "bw" })}
              />
              <PrintOptionCard
                icon={Palette}
                label="Color"
                sublabel="₹5 / page"
                selected={options.color === "color"}
                onClick={() => setOptions({ color: "color" })}
              />
            </div>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-sm font-semibold text-ink">Paper size</h2>
            <div className="flex gap-3">
              <PrintOptionCard
                icon={RectangleVertical}
                label="A4"
                sublabel="210 × 297 mm"
                selected={options.paperSize === "A4"}
                onClick={() => setOptions({ paperSize: "A4" })}
              />
              <PrintOptionCard
                icon={RectangleHorizontal}
                label="A3"
                sublabel="297 × 420 mm"
                selected={options.paperSize === "A3"}
                onClick={() => setOptions({ paperSize: "A3" })}
              />
            </div>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-sm font-semibold text-ink">Printing sides</h2>
            <div className="flex gap-3">
              <PrintOptionCard
                icon={Layers}
                label="Single-sided"
                selected={options.sides === "single"}
                onClick={() => setOptions({ sides: "single" })}
              />
              <PrintOptionCard
                icon={Layers}
                label="Double-sided"
                sublabel="10% off per page"
                selected={options.sides === "double"}
                onClick={() => setOptions({ sides: "double" })}
              />
            </div>
          </section>

          <section className="mb-7 flex items-center justify-between rounded-2xl border border-border bg-white p-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Copies</h2>
              <p className="text-xs text-ink-muted">Number of sets to print</p>
            </div>
            <QuantitySelector value={options.copies} onChange={(v) => setOptions({ copies: v })} />
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-sm font-semibold text-ink">Page range</h2>
            <div className="flex gap-3">
              <PrintOptionCard
                label="All pages"
                sublabel={`${totalPages} pages`}
                selected={options.pageRangeMode === "all"}
                onClick={() => setOptions({ pageRangeMode: "all" })}
              />
              <PrintOptionCard
                label="Custom range"
                sublabel="Choose specific pages"
                selected={options.pageRangeMode === "custom"}
                onClick={() => setOptions({ pageRangeMode: "custom" })}
              />
            </div>
            {options.pageRangeMode === "custom" && (
              <div className="mt-3">
                <Input
                  placeholder="e.g. 1-5, 8, 10-12"
                  value={options.customRange}
                  onChange={(e) => setOptions({ customRange: e.target.value })}
                  aria-label="Custom page range"
                />
                <p className="mt-1.5 text-xs text-ink-faint">Example: 1-5, 8, 10-12</p>
              </div>
            )}
          </section>

          <div className="hidden sm:block lg:hidden">
            <PriceSummary totalPages={totalPages} options={options} price={price} isCalculating={isCalculating} />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <PriceSummary totalPages={totalPages} options={options} price={price} isCalculating={isCalculating} />
            <Button size="lg" className="w-full" onClick={() => router.push("/print/review")}>
              Continue to Review
            </Button>
          </div>
        </aside>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-4 backdrop-blur-md lg:hidden">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-ink-muted">Total</span>
          <span className="font-mono text-lg font-semibold text-accent">
            {price ? `₹${price.total}` : "—"}
          </span>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/print/review")}>
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
