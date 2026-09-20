"use client";

import { AdminOrderRow } from "@/types/order";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

export function JobsTable({
  rows,
  compact = false,
  onRowClick,
}: {
  rows: AdminOrderRow[];
  compact?: boolean;
  onRowClick?: (row: AdminOrderRow) => void;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            {!compact && <th className="px-4 py-3 font-medium">File</th>}
            <th className="px-4 py-3 font-medium">Pages</th>
            {!compact && <th className="px-4 py-3 font-medium">Copies</th>}
            {!compact && <th className="px-4 py-3 font-medium">Color</th>}
            {!compact && <th className="px-4 py-3 font-medium">Paper</th>}
            <th className="px-4 py-3 font-medium">Amount</th>
            {!compact && <th className="px-4 py-3 font-medium">Payment</th>}
            <th className="px-4 py-3 font-medium">Status</th>
            {!compact && <th className="px-4 py-3 font-medium">Created</th>}
            {onRowClick && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border last:border-0 ${onRowClick ? "cursor-pointer hover:bg-bg" : ""}`}
            >
              <td className="px-4 py-3.5 font-medium text-ink">{row.id}</td>
              <td className="px-4 py-3.5 text-ink-muted">{row.customer}</td>
              {!compact && <td className="max-w-[160px] truncate px-4 py-3.5 text-ink-muted">{row.file}</td>}
              <td className="px-4 py-3.5 text-ink-muted">{row.pages}</td>
              {!compact && <td className="px-4 py-3.5 text-ink-muted">{row.copies}</td>}
              {!compact && <td className="px-4 py-3.5 text-ink-muted">{row.color}</td>}
              {!compact && <td className="px-4 py-3.5 text-ink-muted">{row.paper}</td>}
              <td className="px-4 py-3.5 font-medium text-ink">{formatCurrency(row.amount)}</td>
              {!compact && (
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.payment} />
                </td>
              )}
              <td className="px-4 py-3.5">
                <StatusBadge status={row.status} />
              </td>
              {!compact && (
                <td className="px-4 py-3.5 text-ink-muted">{formatDateTime(row.createdAt)}</td>
              )}
              {onRowClick && (
                <td className="px-4 py-3.5 text-ink-faint">
                  <MoreHorizontal className="h-4 w-4" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
