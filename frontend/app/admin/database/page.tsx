"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Pencil, Plus, RefreshCw, Trash2, X, Users as UsersIcon, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  fetchUsers,
  updateUser,
  deleteUser,
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/lib/adminApi";
import { AdminPayment, AdminUser } from "@/types/admin";

export default function AdminDatabasePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Database — Users & Payments</h1>
        <p className="text-sm text-ink-muted">
          Live data from Supabase, via the Express backend at{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">/api/admin</code>.
        </p>
      </div>

      <UsersSection />
      <PaymentsSection />
    </div>
  );
}

// =============================================================================
// Users
// =============================================================================

function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Everyone with an account.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState label="Loading users..." />
        ) : error ? (
          <ErrorNotice message={error} onRetry={load} />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users yet" />
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5 font-medium text-ink">{user.name}</td>
                    <td className="px-4 py-3.5 text-ink-muted">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
                          (user.role === "admin"
                            ? "bg-success-soft text-success"
                            : "bg-bg text-ink-muted border border-border")
                        }
                      >
                        <span
                          className={"h-1.5 w-1.5 rounded-full " + (user.role === "admin" ? "bg-success" : "bg-ink-faint")}
                        />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-ink-muted">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <IconButton label="Edit user" onClick={() => setEditing(user)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Delete user" onClick={() => handleDelete(user)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {editing && (
        <UserEditDrawer
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}

function UserEditDrawer({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUser(user.id, { name, email, role });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer title="Edit user" onClose={onClose}>
      {error && <ErrorNotice message={error} />}
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Role">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as AdminUser["role"])}
          className="h-11 w-full rounded-xl border border-border-strong bg-white px-3.5 text-sm text-ink"
        >
          <option value="customer">customer</option>
          <option value="admin">admin</option>
        </select>
      </Field>
      <Button size="lg" className="w-full" loading={saving} onClick={handleSave}>
        Save changes
      </Button>
    </Drawer>
  );
}

// =============================================================================
// Payments
// =============================================================================

const PAYMENT_STATUS_FILTERS = ["all", "pending", "completed", "failed", "refunded"];

function PaymentsSection() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminPayment | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      setPayments(await fetchPayments(status === "all" ? undefined : status));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter);
  }, [load, statusFilter]);

  async function handleDelete(payment: AdminPayment) {
    if (!window.confirm(`Delete this payment of ${payment.currency} ${payment.amount}?`)) return;
    try {
      await deletePayment(payment.id);
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete payment");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>From the payments table.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PAYMENT_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                (statusFilter === s
                  ? "bg-accent text-white"
                  : "border border-border bg-white text-ink-muted hover:border-border-strong")
              }
            >
              {s}
            </button>
          ))}
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState label="Loading payments..." />
        ) : error ? (
          <ErrorNotice message={error} onRetry={() => load(statusFilter)} />
        ) : payments.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments found" description="Try a different filter." />
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment time</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink">{payment.client?.name ?? "Unknown"}</p>
                      <p className="text-xs text-ink-muted">{payment.client?.email ?? payment.clientId}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-ink">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-ink-muted">{payment.status}</td>
                    <td className="px-4 py-3.5 text-ink-muted">
                      {payment.paymentTime ? formatDateTime(payment.paymentTime) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-ink-muted">{formatDateTime(payment.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <IconButton label="Edit payment" onClick={() => setEditing(payment)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Delete payment" onClick={() => handleDelete(payment)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {editing && (
        <PaymentEditDrawer
          payment={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
          }}
        />
      )}

      {creating && (
        <PaymentCreateDrawer
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setPayments((prev) => [created, ...prev]);
            setCreating(false);
          }}
        />
      )}
    </Card>
  );
}

function PaymentEditDrawer({
  payment,
  onClose,
  onSaved,
}: {
  payment: AdminPayment;
  onClose: () => void;
  onSaved: (payment: AdminPayment) => void;
}) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [currency, setCurrency] = useState(payment.currency);
  const [status, setStatus] = useState(payment.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Amount must be a non-negative number");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updatePayment(payment.id, { amount: parsedAmount, currency, status });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer title="Edit payment" onClose={onClose}>
      {error && <ErrorNotice message={error} />}
      <Field label="Client">
        <p className="rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink-muted">
          {payment.client?.name ?? payment.clientId} ({payment.client?.email ?? "—"})
        </p>
      </Field>
      <Field label="Amount">
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Currency">
        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
      </Field>
      <Field label="Status">
        <Input value={status} onChange={(e) => setStatus(e.target.value)} />
      </Field>
      <Button size="lg" className="w-full" loading={saving} onClick={handleSave}>
        Save changes
      </Button>
    </Drawer>
  );
}

function PaymentCreateDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (payment: AdminPayment) => void;
}) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const parsedAmount = Number(amount);
    if (!clientId.trim()) {
      setError("clientId is required — the UUID of an existing user");
      return;
    }
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Amount must be a non-negative number");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createPayment({ clientId, amount: parsedAmount, currency, status });
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer title="New payment" onClose={onClose}>
      {error && <ErrorNotice message={error} />}
      <Field label="Client ID (user UUID)">
        <Input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="e.g. 3fa85f64-5717-4562-..."
        />
      </Field>
      <Field label="Amount">
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Currency">
        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
      </Field>
      <Field label="Status">
        <Input value={status} onChange={(e) => setStatus(e.target.value)} />
      </Field>
      <Button size="lg" className="w-full" loading={saving} onClick={handleCreate}>
        Create payment
      </Button>
    </Drawer>
  );
}

// =============================================================================
// Small shared bits local to this page
// =============================================================================

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto bg-surface p-6 shadow-card animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-bg"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors " +
        (danger ? "text-danger hover:bg-danger-soft" : "text-ink-muted hover:bg-bg hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-medium underline">
          Retry
        </button>
      )}
    </div>
  );
}
