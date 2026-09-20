import { ColorMode, PaperSize, PriceBreakdown, PrintOptions, Sides } from "@/types/print";

export interface PricingConfig {
  perPage: Record<PaperSize, Record<ColorMode, number>>;
  sidesMultiplier: Record<Sides, number>;
  serviceFee: number;
  minimumOrder: number;
}

export const DEFAULT_PRICING: PricingConfig = {
  perPage: {
    A4: { bw: 1, color: 5 },
    A3: { bw: 3, color: 10 },
  },
  sidesMultiplier: {
    single: 1,
    double: 0.9,
  },
  serviceFee: 0,
  minimumOrder: 5,
};

/** Parses a page-range string like "1-5, 8, 10-12" into a count of pages. */
export function parsePageRangeCount(range: string, totalPages: number): number {
  if (!range.trim()) return 0;
  const seen = new Set<number>();
  const parts = range.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((v) => v.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          seen.add(i);
        }
      }
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n) && n >= 1 && n <= totalPages) seen.add(n);
    }
  }
  return seen.size;
}

export function calculatePrintPrice(
  totalPagesAcrossDocs: number,
  options: PrintOptions,
  config: PricingConfig = DEFAULT_PRICING
): PriceBreakdown {
  const billablePages =
    options.pageRangeMode === "custom"
      ? Math.max(1, parsePageRangeCount(options.customRange, totalPagesAcrossDocs))
      : totalPagesAcrossDocs;

  const rate = config.perPage[options.paperSize][options.color];
  const sidesFactor = config.sidesMultiplier[options.sides];

  const rawPrintingCost = billablePages * options.copies * rate * sidesFactor;
  const printingCost = Math.round(rawPrintingCost);
  const subtotal = printingCost + config.serviceFee;
  const total = Math.max(subtotal, config.minimumOrder);

  return {
    billablePages,
    perPageRate: rate,
    printingCost,
    serviceFee: config.serviceFee,
    minimumOrder: config.minimumOrder,
    minimumOrderApplied: total > subtotal,
    total,
  };
}
