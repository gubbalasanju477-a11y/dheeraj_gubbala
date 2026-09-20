"use client";

import { AdminUser } from "@/types/admin";

const TOKEN_KEY = "printease_admin_token";
const USER_KEY = "printease_admin_user";

/**
 * Thin wrapper around localStorage for the admin JWT + cached user object.
 *
 * This is a CLIENT-SIDE convenience only — the real authorization check
 * happens on the backend (protect + adminOnly middleware) on every
 * request. Anything read from here should be treated as "what to show
 * in the UI / when to redirect", never as a security boundary by itself.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AdminUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isStoredUserAdmin(): boolean {
  return getStoredUser()?.role === "admin";
}
