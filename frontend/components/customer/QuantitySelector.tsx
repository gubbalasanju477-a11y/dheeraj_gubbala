"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-4 rounded-xl border border-border-strong bg-white p-1.5">
      <button
        type="button"
        aria-label="Decrease copies"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-bg disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center font-display text-base font-semibold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase copies"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-bg disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
