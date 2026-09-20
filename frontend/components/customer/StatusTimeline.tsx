"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  state: "done" | "active" | "pending";
}

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-3.5 pb-6 last:pb-0">
          {i !== steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-full w-px",
                step.state === "done" ? "bg-accent" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              step.state === "done" && "bg-accent text-white",
              step.state === "active" && "bg-accent-soft ring-2 ring-accent",
              step.state === "pending" && "bg-bg border border-border-strong"
            )}
          >
            {step.state === "done" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            {step.state === "active" && <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
          </span>
          <span
            className={cn(
              "pt-0.5 text-sm font-medium",
              step.state === "pending" ? "text-ink-faint" : "text-ink"
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
