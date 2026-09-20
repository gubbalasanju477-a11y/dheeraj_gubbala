export type AdminRole = "customer" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPayment {
  id: string;
  clientId: string;
  client?: AdminUser;
  amount: number;
  currency: string;
  status: string;
  paymentTime: string | null;
  createdAt: string;
}

export interface ShopSettings {
  businessName: string;
  upiId: string | null;
  updatedAt?: string;
}
