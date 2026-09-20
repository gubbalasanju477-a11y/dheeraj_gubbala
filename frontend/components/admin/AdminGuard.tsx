"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getToken } from "@/lib/adminAuth";
import { LoadingState } from "@/components/shared/LoadingState";

/**
 * Client-side gate for the entire /admin/* tree (see app/admin/layout.tsx).
 *
 * IMPORTANT: this only controls what renders in the browser. The real
 * security boundary is the backend's `protect` + `adminOnly` middleware —
 * every admin API call is re-checked there regardless of what this
 * component decides to show. Never treat this as sufficient on its own.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token || !user || user.role !== "admin") {
      router.replace("/admin-login");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return <LoadingState label="Checking admin access..." className="min-h-screen" />;
  }

  return <>{children}</>;
}
