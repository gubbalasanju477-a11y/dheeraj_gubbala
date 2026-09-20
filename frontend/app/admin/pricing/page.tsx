"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { DEFAULT_PRICING } from "@/lib/pricing";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [serviceFee, setServiceFee] = useState(DEFAULT_PRICING.serviceFee);
  const [minimumOrder, setMinimumOrder] = useState(DEFAULT_PRICING.minimumOrder);
  const [saved, setSaved] = useState(false);

  function updateRate(paper: "A4" | "A3", color: "bw" | "color", value: number) {
    setPricing((prev) => ({
      ...prev,
      perPage: {
        ...prev.perPage,
        [paper]: { ...prev.perPage[paper], [color]: value },
      },
    }));
    setSaved(false);
  }

  function updateSides(sides: "single" | "double", value: number) {
    setPricing((prev) => ({
      ...prev,
      sidesMultiplier: { ...prev.sidesMultiplier, [sides]: value },
    }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Pricing</h1>
        <p className="text-sm text-ink-muted">Set the rates customers see when they configure a print job.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>A4</CardTitle>
            <CardDescription>210 × 297 mm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PriceField
              label="Black & White"
              suffix="/ page"
              value={pricing.perPage.A4.bw}
              onChange={(v) => updateRate("A4", "bw", v)}
            />
            <PriceField
              label="Color"
              suffix="/ page"
              value={pricing.perPage.A4.color}
              onChange={(v) => updateRate("A4", "color", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>A3</CardTitle>
            <CardDescription>297 × 420 mm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PriceField
              label="Black & White"
              suffix="/ page"
              value={pricing.perPage.A3.bw}
              onChange={(v) => updateRate("A3", "bw", v)}
            />
            <PriceField
              label="Color"
              suffix="/ page"
              value={pricing.perPage.A3.color}
              onChange={(v) => updateRate("A3", "color", v)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sides & fees</CardTitle>
          <CardDescription>Multipliers and flat fees applied to every order.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PriceField
            label="Single-sided multiplier"
            suffix="×"
            step={0.05}
            value={pricing.sidesMultiplier.single}
            onChange={(v) => updateSides("single", v)}
          />
          <PriceField
            label="Double-sided multiplier"
            suffix="×"
            step={0.05}
            value={pricing.sidesMultiplier.double}
            onChange={(v) => updateSides("double", v)}
          />
          <PriceField label="Service fee" prefix="₹" value={serviceFee} onChange={setServiceFee} />
          <PriceField label="Minimum order" prefix="₹" value={minimumOrder} onChange={setMinimumOrder} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={handleSave}>
          Save Changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm font-medium text-ink-muted">{prefix}</span>}
        <Input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="max-w-[120px]"
        />
        {suffix && <span className="text-sm text-ink-muted">{suffix}</span>}
      </div>
    </div>
  );
}
