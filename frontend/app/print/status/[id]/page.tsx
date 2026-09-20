"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Loader2, PackageCheck, Printer as PrinterIcon } from "lucide-react";
import { Header } from "@/components/customer/Header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SuccessState } from "@/components/shared/SuccessState";
import { usePrintOrder } from "@/lib/store";

type LiveStatus = "queued" | "printing" | "completed" | "failed";

export default function PrintStatusPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { order } = usePrintOrder();

  const totalPages = useMemo(() => {
    if (order) return order.price.billablePages * order.options.copies;
    return 12;
  }, [order]);

  const [status, setStatus] = useState<LiveStatus>("queued");
  const [printed, setPrinted] = useState(0);

  useEffect(() => {
    const toQueuedTimer = setTimeout(() => setStatus("printing"), 1500);
    return () => clearTimeout(toQueuedTimer);
  }, []);

  useEffect(() => {
    if (status !== "printing") return;
    if (printed >= totalPages) {
      setStatus("completed");
      return;
    }
    const timer = setTimeout(() => setPrinted((p) => Math.min(totalPages, p + 1)), 550);
    return () => clearTimeout(timer);
  }, [status, printed, totalPages]);

  const orderNumber = order?.id.split("-").pop() ?? params.id.split("-").pop() ?? params.id;

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="container flex max-w-lg flex-col items-center py-12 text-center sm:py-16">
        {status === "queued" && (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Your print job is queued
            </h1>
            <p className="mt-2 text-sm text-ink-muted">Waiting for the printer to pick it up.</p>
          </>
        )}

        {status === "printing" && (
          <div className="w-full">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft mx-auto">
              <PrinterIcon className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Your documents are printing...
            </h1>
            <p className="mt-2 text-sm text-ink-muted">Please stay nearby — this won't take long.</p>

            <div className="mt-8 rounded-2xl border border-border bg-white p-5 text-left shadow-soft">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-ink-muted">Progress</span>
                <span className="font-mono font-semibold text-ink">
                  {printed} / {totalPages} pages
                </span>
              </div>
              <Progress value={(printed / totalPages) * 100} />

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-ink-muted">Printer</span>
                <span className="font-medium text-ink">Printer #01</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-muted">Status</span>
                <span className="font-medium text-accent">Printing</span>
              </div>
            </div>
          </div>
        )}

        {status === "completed" && (
          <>
            <SuccessState size="lg" title="Your prints are ready!" subtitle="Please collect your documents from the counter." />
            <div className="mt-8 rounded-2xl border border-border bg-white px-8 py-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Order number</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-ink">{orderNumber}</p>
            </div>
            <Button className="mt-8" size="lg" onClick={() => router.push("/")}>
              Start a New Print
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger-soft">
              <AlertCircle className="h-8 w-8 text-danger" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">Print failed</h1>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              Your payment was successful, but something went wrong while printing. Please contact
              the counter — no need to pay again.
            </p>
            <Button className="mt-8" size="lg" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
