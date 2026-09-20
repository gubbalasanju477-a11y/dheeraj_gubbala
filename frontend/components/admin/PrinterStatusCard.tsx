"use client";

import { Printer as PrinterIcon } from "lucide-react";
import { Printer } from "@/types/printer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const STATUS_LABEL = { online: "Online", offline: "Offline", paused: "Paused" } as const;

export function PrinterStatusCard({ printer }: { printer: Printer }) {
  const isOnline = printer.status === "online";
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              isOnline ? "bg-accent-soft text-accent" : "bg-bg text-ink-faint"
            )}
          >
            <PrinterIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-ink">{printer.name}</p>
            <p className="text-xs text-ink-muted">{printer.model}</p>
          </div>
        </div>
        <StatusBadge status={STATUS_LABEL[printer.status]} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-bg p-3 text-center">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{printer.jobsToday}</p>
          <p className="text-xs text-ink-muted">Jobs today</p>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-ink">{printer.pagesToday.toLocaleString()}</p>
          <p className="text-xs text-ink-muted">Pages today</p>
        </div>
      </div>

      {printer.status === "offline" && (
        <p className="mt-3 text-xs text-danger">Last seen {printer.lastSeen}</p>
      )}

      {printer.currentJobFile && printer.currentJobProgress && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="truncate text-ink-muted">{printer.currentJobFile}</span>
            <span className="font-medium text-ink">
              {printer.currentJobProgress.done} / {printer.currentJobProgress.total}
            </span>
          </div>
          <Progress value={(printer.currentJobProgress.done / printer.currentJobProgress.total) * 100} />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1">
          View Details
        </Button>
        {isOnline && (
          <Button variant="ghost" size="sm" className="flex-1">
            Pause Printer
          </Button>
        )}
      </div>
    </div>
  );
}
