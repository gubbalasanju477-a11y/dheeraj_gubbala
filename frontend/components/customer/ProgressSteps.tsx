"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Customize", "Review", "Pay", "Print"] as const;

export function ProgressSteps({ current }: { current: number }) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="container py-4">
        <ol className="flex items-center">
          {STEPS.map((step, i) => {
            const index = i + 1;
            const isDone = index < current;
            const isActive = index === current;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isDone && "bg-accent text-white",
                      isActive && "bg-accent-soft text-accent ring-2 ring-accent",
                      !isDone && !isActive && "bg-bg text-ink-faint"
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : index}
                  </span>
                  <span
                    className={cn(
                      "hidden text-sm font-medium sm:inline",
                      (isDone || isActive) ? "text-ink" : "text-ink-faint"
                    )}
                  >
                    {step}
                  </span>
                </div>
                {index !== STEPS.length && (
                  <span
                    className={cn(
                      "mx-2 h-px flex-1 sm:mx-3",
                      isDone ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
