"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle, ExternalLink, FileText, ShieldAlert } from "lucide-react";
import { Header } from "@/components/customer/Header";
import { ProgressSteps } from "@/components/customer/ProgressSteps";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { formatCurrency } from "@/lib/utils";
import { usePrintOrder } from "@/lib/store";
import { fetchPublicSettings } from "@/lib/publicApi";
import { buildUpiPaymentLink } from "@/lib/upi";

export default function PaymentPage() {
  const router = useRouter();
  const { documents, order, price, submitOrder, pay } = usePrintOrder();

  const [upiId, setUpiId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("PrintEase");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const readyDocs = documents.filter((d) => d.status === "ready");

  useEffect(() => {
    if (readyDocs.length === 0) {
      router.replace("/print/upload");
      return;
    }
    if (!order) {
      submitOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real backend call: the shop's UPI ID lives in Supabase, set by the
  // owner from Admin -> Settings. This is the one piece of this page that
  // talks to the live Express API — see lib/publicApi.ts.
  useEffect(() => {
    let cancelled = false;
    setSettingsLoading(true);
    fetchPublicSettings()
      .then((settings) => {
        if (cancelled) return;
        setUpiId(settings.upiId);
        setBusinessName(settings.businessName);
      })
      .catch((err) => {
        if (cancelled) return;
        setSettingsError(err instanceof Error ? err.message : "Could not reach the backend");
      })
      .finally(() => {
        if (!cancelled) setSettingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirmPayment() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const result = await pay("upi");
      if (result.success) {
        router.push("/print/success");
      } else {
        setConfirmError("Something went wrong confirming your payment. Please try again.");
      }
    } finally {
      setConfirming(false);
    }
  }

  if (readyDocs.length === 0 || !price) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <ProgressSteps current={4} />
        <main className="container max-w-2xl py-10">
          <EmptyState icon={FileText} title="No order to pay for yet" description="Start by uploading a document." />
        </main>
      </div>
    );
  }

  const upiLink = upiId
    ? buildUpiPaymentLink({
        upiId,
        payeeName: businessName,
        amount: price.total,
        transactionNote: `PrintEase order`,
      })
    : null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <ProgressSteps current={4} />

      <main className="container max-w-xl bottom-cta-safe pb-28 pt-8 sm:pb-16">
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="text-sm text-ink-muted">Order total</p>
          <p className="font-mono text-4xl font-semibold text-ink">{formatCurrency(price.total)}</p>
        </div>

        {settingsLoading ? (
          <LoadingState label="Loading payment details..." />
        ) : settingsError ? (
          <Notice icon={AlertCircle} tone="danger" title="Couldn't load payment details">
            {settingsError} — make sure the backend is running at the address in your{" "}
            <code className="rounded bg-bg px-1 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code> setting.
          </Notice>
        ) : !upiId ? (
          <Notice icon={ShieldAlert} tone="warning" title="Payments aren't set up yet">
            The shop hasn't added a UPI ID in Admin → Settings. Ask a staff member, or an admin can
            add one now.
          </Notice>
        ) : (
          <>
            <div className="flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center">
              <div className="rounded-xl border border-border p-3">
                <QRCodeSVG value={upiLink!} size={176} />
              </div>
              <p className="mt-4 text-sm font-medium text-ink">Scan with any UPI app</p>
              <p className="text-xs text-ink-muted">{upiId}</p>

              <Button
                size="lg"
                className="mt-5 w-full"
                onClick={() => {
                  window.location.href = upiLink!;
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Open UPI app to pay
              </Button>
              <p className="mt-2 text-xs text-ink-faint">
                On a phone, this opens Google Pay, PhonePe, Paytm or BHIM directly.
              </p>
            </div>

            {confirmError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{confirmError}</span>
              </div>
            )}

            <div className="mt-6 hidden sm:block">
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                loading={confirming}
                onClick={handleConfirmPayment}
              >
                I've completed the payment
              </Button>
              <p className="mt-3 text-center text-xs text-ink-faint">
                We can't verify UPI payments automatically — this confirms you've paid and starts
                your print job. The shop can review payments in their admin dashboard.
              </p>
            </div>
          </>
        )}
      </main>

      {upiId && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-4 backdrop-blur-md sm:hidden">
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            loading={confirming}
            onClick={handleConfirmPayment}
          >
            I've completed the payment
          </Button>
        </div>
      )}
    </div>
  );
}

function Notice({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: typeof AlertCircle;
  tone: "danger" | "warning";
  title: string;
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "danger"
      ? "border-danger/30 bg-danger-soft text-danger"
      : "border-warning/30 bg-warning-soft text-warning";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${toneClasses}`}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs opacity-90">{children}</p>
      </div>
    </div>
  );
}
