import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function AdminCustomersPage() {
  const byCustomer = new Map<string, { orders: number; spend: number; lastFile: string }>();
  for (const row of MOCK_ORDERS) {
    const existing = byCustomer.get(row.customer) ?? { orders: 0, spend: 0, lastFile: row.file };
    byCustomer.set(row.customer, {
      orders: existing.orders + 1,
      spend: existing.spend + row.amount,
      lastFile: existing.lastFile,
    });
  }
  const customers = Array.from(byCustomer.entries());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Customers</h1>
        <p className="text-sm text-ink-muted">Everyone who's printed with you, based on recent orders.</p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0 sm:p-5">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spend</th>
                <th className="px-4 py-3 font-medium">Last document</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(([name, data]) => (
                <tr key={name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5 font-medium text-ink">{name}</td>
                  <td className="px-4 py-3.5 text-ink-muted">{data.orders}</td>
                  <td className="px-4 py-3.5 font-medium text-ink">{formatCurrency(data.spend)}</td>
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-ink-muted">{data.lastFile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
