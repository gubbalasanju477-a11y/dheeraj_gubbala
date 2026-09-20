import { PriceBreakdown, PrintOptions, UploadedDocument } from "./print";

export type PaymentMethodType = "upi";

export type PrintJobStatus =
  | "queued"
  | "sending"
  | "printing"
  | "completed"
  | "failed";

export type PaymentStatus = "pending" | "processing" | "paid" | "failed";

export interface Order {
  id: string;
  createdAt: string;
  documents: UploadedDocument[];
  options: PrintOptions;
  price: PriceBreakdown;
  paymentMethod?: PaymentMethodType;
  paymentStatus: PaymentStatus;
  jobStatus: PrintJobStatus;
  printerId?: string;
  pagesPrinted?: number;
  customerName?: string;
}

export interface AdminOrderRow {
  id: string;
  customer: string;
  pages: number;
  copies: number;
  color: "B&W" | "Color";
  paper: "A4" | "A3";
  amount: number;
  payment: "Paid" | "Failed" | "Pending";
  status: "Queued" | "Printing" | "Completed" | "Failed";
  createdAt: string;
  file: string;
}
