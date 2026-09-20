"use client";

import { AdminPayment, AdminUser, ShopSettings } from "@/types/admin";
import { getToken } from "./adminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiEnvelope {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

async function request<T extends object>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = (await res.json().catch(() => ({}))) as ApiEnvelope;

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as T;
}

// --- Auth --------------------------------------------------------------------

export async function adminLogin(email: string, password: string) {
  return request<{ success: true; token: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// --- Users ---------------------------------------------------------------------

export async function fetchUsers() {
  const data = await request<{ success: true; users: AdminUser[] }>("/admin/users");
  return data.users;
}

export async function updateUser(id: string, patch: Partial<Pick<AdminUser, "name" | "email" | "role">>) {
  const data = await request<{ success: true; user: AdminUser }>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return data.user;
}

export async function deleteUser(id: string) {
  await request<{ success: true }>(`/admin/users/${id}`, { method: "DELETE" });
}

// --- Payments --------------------------------------------------------------------

export async function fetchPayments(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await request<{ success: true; payments: AdminPayment[] }>(`/admin/payments${query}`);
  return data.payments;
}

export async function createPayment(payload: {
  clientId: string;
  amount: number;
  currency: string;
  status: string;
}) {
  const data = await request<{ success: true; payment: AdminPayment }>("/admin/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.payment;
}

export async function updatePayment(
  id: string,
  patch: Partial<{ clientId: string; amount: number; currency: string; status: string }>
) {
  const data = await request<{ success: true; payment: AdminPayment }>(`/admin/payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return data.payment;
}

export async function deletePayment(id: string) {
  await request<{ success: true }>(`/admin/payments/${id}`, { method: "DELETE" });
}

// --- Settings (shop UPI ID / business name) --------------------------------------

export async function fetchAdminSettings() {
  const data = await request<{ success: true; settings: ShopSettings }>("/admin/settings");
  return data.settings;
}

export async function updateAdminSettings(patch: Partial<Pick<ShopSettings, "businessName" | "upiId">>) {
  const data = await request<{ success: true; settings: ShopSettings }>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return data.settings;
}
