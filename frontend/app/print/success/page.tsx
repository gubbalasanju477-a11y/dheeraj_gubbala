"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/customer/Header";
import { SuccessState } from "@/components/shared/SuccessState";
import { StatusTimeline } from "@/components/customer/StatusTimeline";
import { OrderSummary } from "@/components/customer/OrderSummary";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";
import { usePrintOrder } from "@/lib/store";

export default function SuccessPage() {
  const router = useRouter();
  const { order } = usePrintOrder();

  useEffect(() => {
    if (!order || order.paymentStatus !== "paid") {
      router.replace("/print/upload");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order || order.paymentStatus !== "paid") {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="container max-w-2xl py-10">
          <EmptyState icon={FileText} title="No completed order found" description="Start a new print job." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="container max-w-lg py-10 sm:py-14">
        <SuccessState
          size="lg"
          title="Payment successful"
          subtitle="Your print job has been sent to the printer."
        />

        <div className="mt-8 rounded-2xl border border-border bg-white p-5 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Order ID</p>
          <p className="mt-1 font-mono text-lg font-semibold text-ink">{order.id}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
          <StatusTimeline
            steps={[
              { label: "Payment received", state: "done" },
              { label: "Print job created", state: "done" },
              { label: "Sending to printer", state: "active" },
              { label: "Printing", state: "pending" },
              { label: "Ready for collection", state: "pending" },
            ]}
          />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-accent-soft p-4 text-sm">
          <span className="font-medium text-accent">Estimated printing time</span>
          <span className="font-mono font-semibold text-accent">2–3 minutes</span>
        </div>

        <p className="mt-4 text-center text-sm text-ink-muted">
          Please wait while your documents are being printed.
        </p>

        <div className="mt-8">
          <OrderSummary order={order} />
        </div>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={() => router.push(`/print/status/${order.id}`)}>
            Track Print Status
          </Button>
        </div>
      </main>
    </div>
  );
}
