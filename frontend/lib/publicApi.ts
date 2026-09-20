"use client";

/**
 * API calls the CUSTOMER side of the site makes to the real Express
 * backend. Unlike lib/adminApi.ts, nothing here sends an Authorization
 * header — customers never log in (see automated-printing-backend's
 * orderRoutes.js / uploadRoutes.js, which are all public routes now).
 *
 * Currently this only covers the payment step (fetching the shop's UPI ID
 * and confirming payment) — upload/order-creation on this frontend still
 * run on the mock flow in lib/api.ts and lib/store.tsx. See the note left
 * in app/print/payment/page.tsx for why that's a deliberate, separate
 * follow-up rather than something silently half-wired here.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiEnvelope {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

async function request<T extends object>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await res.json().catch(() => ({}))) as ApiEnvelope;

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as T;
}

export interface PublicShopSettings {
  businessName: string;
  upiId: string | null;
}

/** GET /api/settings — public, returns just enough to build a UPI payment link. */
export async function fetchPublicSettings() {
  const data = await request<{ success: true; settings: PublicShopSettings }>("/settings");
  return data.settings;
}

/**
 * POST /api/orders/:id/confirm-payment — public.
 * Marks a real backend order as paid after the customer says they've
 * completed the UPI payment. Only meaningful once order-creation is also
 * wired to the real backend (see the note above) — safe to leave unused
 * until then.
 */
export async function confirmBackendOrderPayment(orderId: string) {
  return request<{ success: true; order: unknown }>(`/orders/${orderId}/confirm-payment`, {
    method: "POST",
  });
}
