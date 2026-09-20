"use client";

import { FileText } from "lucide-react";
import { AdminOrderRow } from "@/types/order";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function PrintJobCard({
  job,
  onClick,
}: {
  job: AdminOrderRow;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-white p-4 text-left shadow-soft transition-colors hover:border-border-strong"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <FileText className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{job.id}</p>
          <span className="font-mono text-sm font-semibold text-ink">{formatCurrency(job.amount)}</span>
        </div>
        <p className="truncate text-xs text-ink-muted">
          {job.customer} · {job.file}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-ink-faint">{formatDateTime(job.createdAt)}</span>
          <StatusBadge status={job.status} />
        </div>
      </div>
    </button>
  );
}
