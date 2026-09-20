"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PrintOptionCard } from "@/components/customer/PrintOptionCard";
import { Check, AlertCircle, QrCode } from "lucide-react";
import { fetchAdminSettings, updateAdminSettings } from "@/lib/adminApi";

export default function AdminSettingsPage() {
  // --- Live fields — stored in Supabase via shop_settings, used to build
  // the customer payment page's UPI deep link. -----------------------------
  const [businessName, setBusinessName] = useState("PrintEase");
  const [upiId, setUpiId] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // --- Everything below this line is still local-only / not yet wired to
  // the backend (out of scope for the UPI payment change). ------------------
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("Shop 4, Main Market Road, Mangalagiri");
  const [defaultPaper, setDefaultPaper] = useState<"A4" | "A3">("A4");
  const [defaultColor, setDefaultColor] = useState<"bw" | "color">("bw");
  const [maxUploadMb, setMaxUploadMb] = useState(25);
  const [autoDelete, setAutoDelete] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminSettings()
      .then((settings) => {
        setBusinessName(settings.businessName);
        setUpiId(settings.upiId ?? "");
      })
      .catch((err) => {
        setSettingsError(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateAdminSettings({ businessName, upiId: upiId || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">Configure how PrintEase runs for your shop.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-accent" /> Payments
          </CardTitle>
          <CardDescription>
            Customers pay by scanning this UPI ID's QR code on the payment page — there's no
            separate payment gateway.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}
          <Field label="UPI ID">
            <Input
              placeholder="shopname@okhdfcbank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={settingsLoading}
            />
          </Field>
          <p className="text-xs text-ink-faint">
            Format: <code className="rounded bg-bg px-1 py-0.5">yourhandle@bank</code> — the same ID
            you'd share to receive a UPI payment normally.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Business name">
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={settingsLoading}
            />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Address">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Printing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Default paper size</label>
            <div className="flex gap-3">
              <PrintOptionCard label="A4" selected={defaultPaper === "A4"} onClick={() => setDefaultPaper("A4")} />
              <PrintOptionCard label="A3" selected={defaultPaper === "A3"} onClick={() => setDefaultPaper("A3")} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Default color</label>
            <div className="flex gap-3">
              <PrintOptionCard label="Black & White" selected={defaultColor === "bw"} onClick={() => setDefaultColor("bw")} />
              <PrintOptionCard label="Color" selected={defaultColor === "color"} onClick={() => setDefaultColor("color")} />
            </div>
          </div>
          <Field label="Maximum upload size (MB)">
            <Input
              type="number"
              value={maxUploadMb}
              onChange={(e) => setMaxUploadMb(parseInt(e.target.value) || 0)}
              className="max-w-[140px]"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Session and admin access controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Admin session timeout">
            <Input defaultValue="30 minutes" />
          </Field>
          <Field label="Admin password">
            <Input type="password" defaultValue="••••••••••" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox checked={autoDelete} onCheckedChange={setAutoDelete} aria-label="Automatic file deletion" />
            <div>
              <p className="text-sm font-medium text-ink">Automatic file deletion</p>
              <p className="text-xs text-ink-muted">
                Delete uploaded documents 24 hours after a job is completed.
              </p>
            </div>
          </label>
          <Field label="Print-agent endpoint">
            <Input defaultValue="http://192.168.1.42:9100" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {saveError && <span className="text-sm font-medium text-danger">{saveError}</span>}
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
