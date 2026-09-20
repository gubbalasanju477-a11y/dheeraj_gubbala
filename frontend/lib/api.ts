/**
 * Mock service layer.
 *
 * Every function here simulates a real network call: it awaits a short
 * delay and returns data shaped the way a real API response would be.
 * When a backend exists, swap the internals of these functions for
 * real `fetch` calls — the call sites elsewhere in the app never need
 * to change.
 */
import { PrintJobStatus, PaymentStatus, Order, PaymentMethodType } from "@/types/order";
import { PriceBreakdown, PrintOptions, UploadedDocument } from "@/types/print";
import { calculatePrintPrice, DEFAULT_PRICING } from "./pricing";
import { generateOrderId, sleep } from "./utils";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `doc_${Date.now()}_${idCounter}`;
}

/** Simulates uploading a file and returns a document record with a mock page count. */
export async function uploadDocument(file: File): Promise<UploadedDocument> {
  await sleep(900 + Math.random() * 600);

  const ext = file.name.split(".").pop()?.toLowerCase();
  const type: UploadedDocument["type"] =
    ext === "jpg" || ext === "jpeg" ? "jpg" : ext === "png" ? "png" : "pdf";

  if (file.size > 25 * 1024 * 1024) {
    return {
      id: nextId(),
      name: file.name,
      sizeBytes: file.size,
      pageCount: 0,
      type,
      status: "error",
      errorMessage: "File exceeds the 25 MB limit.",
    };
  }

  const pageCount = await getDocumentPageCount(file);

  return {
    id: nextId(),
    name: file.name,
    sizeBytes: file.size,
    pageCount,
    type,
    status: "ready",
  };
}

/** Simulates page-count detection. Images are always 1 page; PDFs get a plausible mock count. */
export async function getDocumentPageCount(file: File): Promise<number> {
  await sleep(200);
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "png") return 1;

  // Deterministic-ish mock based on file size so re-renders stay stable.
  const base = Math.max(1, Math.round(file.size / 45000));
  return Math.min(base, 80);
}

export async function calculatePrice(
  totalPages: number,
  options: PrintOptions
): Promise<PriceBreakdown> {
  await sleep(150);
  return calculatePrintPrice(totalPages, options, DEFAULT_PRICING);
}

export async function createPrintJob(params: {
  documents: UploadedDocument[];
  options: PrintOptions;
  price: PriceBreakdown;
}): Promise<Order> {
  await sleep(500);
  return {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    documents: params.documents,
    options: params.options,
    price: params.price,
    paymentStatus: "pending",
    jobStatus: "queued",
  };
}

export async function processPayment(
  order: Order,
  method: PaymentMethodType
): Promise<{ success: boolean; paymentStatus: PaymentStatus }> {
  // There is no gateway call to make anymore — UPI deep links have no
  // callback telling us whether the customer actually paid. This function
  // now only runs when the customer taps "I've completed the payment"
  // after being sent to their UPI app, so it always records "paid". Real
  // verification is a manual admin step (see the Payments admin page).
  await sleep(400);
  return { success: true, paymentStatus: "paid" };
}

export async function getPrintJobStatus(orderId: string): Promise<{
  status: PrintJobStatus;
  pagesPrinted: number;
  totalPages: number;
  printerId: string;
}> {
  await sleep(300);
  return {
    status: "printing",
    pagesPrinted: 8,
    totalPages: 12,
    printerId: "Printer #01",
  };
}
