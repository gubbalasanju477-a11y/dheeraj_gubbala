import Link from "next/link";
import { ArrowRight, CreditCard, PackageCheck, ShieldCheck, SlidersHorizontal, UploadCloud, Zap } from "lucide-react";
import { Header } from "@/components/customer/Header";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload document",
    description: "Scan the QR code at the counter and upload your PDF, JPG or PNG straight from your phone.",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose print settings",
    description: "Pick color, paper size, sides and copies. The price updates instantly as you choose.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    description: "Pay by UPI, card or net banking — no cash, no queue, no waiting at the counter.",
  },
  {
    icon: PackageCheck,
    title: "Collect your prints",
    description: "Your file goes straight to the printer. Walk up to the counter and collect when ready.",
  },
];

const TRUST = [
  { icon: Zap, label: "Fast" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: PackageCheck, label: "Self-Service" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
        <div className="container relative flex flex-col items-center py-16 text-center sm:py-24">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-ink-muted shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Scan the QR code at the counter to begin
          </span>

          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Print your documents yourself.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted sm:text-lg">
            Upload. Pay. Print. No waiting.
          </p>

          <Link href="/print/upload" className="mt-8">
            <Button size="lg" className="px-8">
              Start Printing
              <ArrowRight className="h-[18px] w-[18px]" />
            </Button>
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-ink-muted">
                <item.icon className="h-4 w-4 text-accent" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container py-16 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Four steps from phone to printout
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mb-1 text-xs font-semibold text-ink-faint">Step {i + 1}</p>
              <p className="font-display text-base font-semibold text-ink">{step.title}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="help" className="border-t border-border bg-surface">
        <div className="container flex flex-col items-center gap-4 py-14 text-center">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Need a hand?
          </h2>
          <p className="max-w-sm text-sm text-ink-muted">
            Staff at the counter can help you upload, choose settings, or troubleshoot payment — just ask.
          </p>
          <Link href="/print/upload">
            <Button variant="secondary">Start Printing</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-ink-faint sm:flex-row">
          <span>© {new Date().getFullYear()} PrintEase. All rights reserved.</span>
          <Link href="/admin" className="hover:text-ink-muted">
            Business owner login
          </Link>
        </div>
      </footer>
    </div>
  );
}
