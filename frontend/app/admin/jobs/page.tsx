"use client";

import { useMemo, useState } from "react";
import { FileSearch, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JobsTable } from "@/components/admin/JobsTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { AdminOrderRow } from "@/types/order";

const FILTERS = ["All", "Queued", "Printing", "Completed", "Failed"] as const;

export default function AdminJobsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter((row) => {
      const matchesFilter = filter === "All" || row.status === filter;
      const matchesQuery =
        query.trim() === "" ||
        row.id.toLowerCase().includes(query.toLowerCase()) ||
        row.customer.toLowerCase().includes(query.toLowerCase()) ||
        row.file.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Print Jobs</h1>
        <p className="text-sm text-ink-muted">Search, filter and manage every print job.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search by order, customer or file"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f ? "bg-accent text-white" : "bg-white text-ink-muted border border-border hover:border-border-strong"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-5">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No print jobs found"
              description="Try a different search term or filter."
              className="border-none"
            />
          ) : (
            <JobsTable rows={filtered} onRowClick={setSelected} />
          )}
        </CardContent>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} />
          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-6 shadow-card animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{selected.id}</h2>
              <button
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-bg"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Customer</p>
                <p className="mt-1 font-medium text-ink">{selected.customer}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">File</p>
                <p className="mt-1 font-medium text-ink">{selected.file}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Pages</p>
                  <p className="mt-1 font-medium text-ink">{selected.pages}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Copies</p>
                  <p className="mt-1 font-medium text-ink">{selected.copies}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Color</p>
                  <p className="mt-1 font-medium text-ink">{selected.color}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Paper</p>
                  <p className="mt-1 font-medium text-ink">{selected.paper}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Amount</p>
                <p className="mt-1 font-mono text-lg font-semibold text-ink">{formatCurrency(selected.amount)}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment</p>
                  <StatusBadge status={selected.payment} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Created</p>
                <p className="mt-1 font-medium text-ink">{formatDateTime(selected.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
