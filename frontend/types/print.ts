export type ColorMode = "bw" | "color";
export type PaperSize = "A4" | "A3";
export type Sides = "single" | "double";
export type PageRangeMode = "all" | "custom";

export interface UploadedDocument {
  id: string;
  name: string;
  sizeBytes: number;
  pageCount: number;
  type: "pdf" | "jpg" | "png";
  status: "uploading" | "ready" | "error";
  errorMessage?: string;
}

export interface PrintOptions {
  color: ColorMode;
  paperSize: PaperSize;
  sides: Sides;
  copies: number;
  pageRangeMode: PageRangeMode;
  customRange: string;
}

export interface PriceBreakdown {
  billablePages: number;
  perPageRate: number;
  printingCost: number;
  serviceFee: number;
  /** The configured minimum order amount, for display purposes. */
  minimumOrder: number;
  /** True when the floor (minimumOrder) was higher than printingCost + serviceFee. */
  minimumOrderApplied: boolean;
  total: number;
}
