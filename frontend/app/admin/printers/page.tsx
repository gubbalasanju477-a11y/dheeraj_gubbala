import { PrinterStatusCard } from "@/components/admin/PrinterStatusCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrinterIcon } from "lucide-react";
import { MOCK_PRINTERS } from "@/lib/mock-data";

export default function AdminPrintersPage() {
  const hasPrinters = MOCK_PRINTERS.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Printers</h1>
        <p className="text-sm text-ink-muted">Monitor connected printers and their live jobs.</p>
      </div>

      {hasPrinters ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_PRINTERS.map((printer) => (
            <PrinterStatusCard key={printer.id} printer={printer} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PrinterIcon}
          title="No printers available"
          description="Connect a printer through the print-agent service to start accepting jobs."
        />
      )}
    </div>
  );
}
