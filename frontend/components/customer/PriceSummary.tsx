"use client";

import { PriceBreakdown, PrintOptions } from "@/types/print";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/shared/LoadingState";

const PAPER_LABEL: Record<PrintOptions["paperSize"], string> = { A4: "A4", A3: "A3" };
const COLOR_LABEL: Record<PrintOptions["color"], string> = { bw: "B&W", color: "Color" };
const SIDES_LABEL: Record<PrintOptions["sides"], string> = {
  single: "Single-sided",
  double: "Double-sided",
};

export function PriceSummary({
  totalPages,
  options,
  price,
  isCalculating,
}: {
  totalPages: number;
  options: PrintOptions;
  price: PriceBreakdown | null;
  isCalculating?: boolean;
}) {
  const rows = [
    { label: "Pages", value: totalPages },
    { label: "Copies", value: options.copies },
    { label: "Printing", value: COLOR_LABEL[options.color] },
    { label: "Paper", value: PAPER_LABEL[options.paperSize] },
    { label: "Sides", value: SIDES_LABEL[options.sides] },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <p className="font-display text-sm font-semibold text-ink">Price summary</p>
      <dl className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="ticket-divider my-4" />

      {isCalculating || !price ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Subtotal</span>
            <span className="font-medium text-ink">{formatCurrency(price.printingCost + price.serviceFee)}</span>
          </div>
          {price.minimumOrderApplied && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-ink-muted">Minimum order adjustment</span>
              <span className="font-medium text-ink">
                +{formatCurrency(price.minimumOrder - (price.printingCost + price.serviceFee))}
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="font-display text-sm font-semibold text-ink">Total</span>
            <span className="font-mono text-xl font-semibold text-accent">
              {formatCurrency(price.total)}
            </span>
          </div>
          {price.minimumOrderApplied && (
            <p className="mt-2 text-xs text-ink-faint">
              A {formatCurrency(price.minimumOrder)} minimum order applies to every print job.
            </p>
          )}
        </>
      )}
    </div>
  );
}
