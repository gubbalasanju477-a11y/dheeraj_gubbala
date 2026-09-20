"use client";

/**
 * Lives at /admin-login rather than /admin/login on purpose: everything
 * under /admin/* is wrapped by app/admin/layout.tsx, which redirects to
 * this page whenever the visitor isn't a logged-in admin. If the login
 * page itself lived inside that tree, it would trigger its own redirect
 * and loop forever. Keeping it as a sibling route sidesteps that.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/lib/adminApi";
import { setAuth } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token, user } = await adminLogin(email, password);

      if (user.role !== "admin") {
        setError("This account doesn't have admin access.");
        return;
      }

      setAuth(token, user);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
            <Printer className="h-5 w-5" />
          </span>
          <h1 className="font-display text-lg font-semibold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in with your admin account to continue.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
