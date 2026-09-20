"use client";

import { FileText } from "lucide-react";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";

const COLOR_LABEL = { bw: "B&W", color: "Color" } as const;
const SIDES_LABEL = { single: "Single-sided", double: "Double-sided" } as const;

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="ticket overflow-hidden border border-border shadow-soft">
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Documents
          </p>
          <div className="space-y-2">
            {order.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                  <p className="text-xs text-ink-muted">
                    {doc.pageCount} pages × {order.options.copies} cop{order.options.copies > 1 ? "ies" : "y"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Print settings
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              COLOR_LABEL[order.options.color],
              order.options.paperSize,
              SIDES_LABEL[order.options.sides],
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-bg px-2.5 py-1 text-xs font-medium text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ticket-divider mx-5" />

      <div className="space-y-2 p-5 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Printing</span>
          <span className="font-medium text-ink">{formatCurrency(order.price.printingCost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Service fee</span>
          <span className="font-medium text-ink">{formatCurrency(order.price.serviceFee)}</span>
        </div>
        {order.price.minimumOrderApplied && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Minimum order adjustment</span>
            <span className="font-medium text-ink">
              +{formatCurrency(order.price.minimumOrder - (order.price.printingCost + order.price.serviceFee))}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <span className="font-display text-sm font-semibold text-ink">Total</span>
          <span className="font-mono text-xl font-semibold text-accent">
            {formatCurrency(order.price.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
