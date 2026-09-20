"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrintOptionCard({
  icon: Icon,
  label,
  sublabel,
  selected,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start gap-2 rounded-2xl border-2 bg-white p-4 text-left transition-all",
        selected
          ? "border-accent bg-accent-softer shadow-soft"
          : "border-border hover:border-border-strong"
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            selected ? "bg-accent text-white" : "bg-bg text-ink-muted"
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <div>
        <p className={cn("text-sm font-semibold", selected ? "text-accent" : "text-ink")}>
          {label}
        </p>
        {sublabel && <p className="text-xs text-ink-muted">{sublabel}</p>}
      </div>
    </button>
  );
}
