"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Order, PaymentMethodType } from "@/types/order";
import { PriceBreakdown, PrintOptions, UploadedDocument } from "@/types/print";
import { calculatePrice, createPrintJob, processPayment } from "./api";

const DEFAULT_OPTIONS: PrintOptions = {
  color: "bw",
  paperSize: "A4",
  sides: "single",
  copies: 1,
  pageRangeMode: "all",
  customRange: "",
};

interface PrintOrderState {
  documents: UploadedDocument[];
  options: PrintOptions;
  price: PriceBreakdown | null;
  order: Order | null;
  isCalculating: boolean;
  setDocuments: (docs: UploadedDocument[]) => void;
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  setOptions: (options: Partial<PrintOptions>) => void;
  recalculate: () => Promise<void>;
  submitOrder: () => Promise<Order>;
  pay: (method: PaymentMethodType) => Promise<{ success: boolean }>;
  totalPages: number;
  reset: () => void;
}

const PrintOrderContext = createContext<PrintOrderState | null>(null);

export function PrintOrderProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocumentsState] = useState<UploadedDocument[]>([]);
  const [options, setOptionsState] = useState<PrintOptions>(DEFAULT_OPTIONS);
  const [price, setPrice] = useState<PriceBreakdown | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const totalPages = useMemo(
    () => documents.reduce((sum, d) => sum + (d.status === "ready" ? d.pageCount : 0), 0),
    [documents]
  );

  const setDocuments = useCallback((docs: UploadedDocument[]) => {
    setDocumentsState(docs);
  }, []);

  const addDocument = useCallback((doc: UploadedDocument) => {
    setDocumentsState((prev) => [...prev, doc]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocumentsState((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const setOptions = useCallback((partial: Partial<PrintOptions>) => {
    setOptionsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const recalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      const result = await calculatePrice(totalPages, options);
      setPrice(result);
    } finally {
      setIsCalculating(false);
    }
  }, [totalPages, options]);

  const submitOrder = useCallback(async () => {
    const finalPrice = price ?? (await calculatePrice(totalPages, options));
    const newOrder = await createPrintJob({ documents, options, price: finalPrice });
    setOrder(newOrder);
    return newOrder;
  }, [documents, options, price, totalPages]);

  const pay = useCallback(
    async (method: PaymentMethodType) => {
      if (!order) return { success: false };
      const result = await processPayment(order, method);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentMethod: method,
              paymentStatus: result.paymentStatus,
              jobStatus: result.success ? "sending" : prev.jobStatus,
            }
          : prev
      );
      return { success: result.success };
    },
    [order]
  );

  const reset = useCallback(() => {
    setDocumentsState([]);
    setOptionsState(DEFAULT_OPTIONS);
    setPrice(null);
    setOrder(null);
  }, []);

  const value: PrintOrderState = {
    documents,
    options,
    price,
    order,
    isCalculating,
    setDocuments,
    addDocument,
    removeDocument,
    setOptions,
    recalculate,
    submitOrder,
    pay,
    totalPages,
    reset,
  };

  return <PrintOrderContext.Provider value={value}>{children}</PrintOrderContext.Provider>;
}

export function usePrintOrder() {
  const ctx = useContext(PrintOrderContext);
  if (!ctx) throw new Error("usePrintOrder must be used within PrintOrderProvider");
  return ctx;
}
