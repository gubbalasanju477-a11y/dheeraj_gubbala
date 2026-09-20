import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { SimpleBarChart, SimplePieChart } from "@/components/admin/Charts";
import {
  COLOR_SPLIT,
  DAILY_ORDERS,
  MONTHLY_REVENUE,
  PAPER_SPLIT,
  REVENUE_TREND,
  WEEKLY_REVENUE,
} from "@/lib/mock-data";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <p className="text-sm text-ink-muted">Revenue and print-volume trends across the shop.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily revenue (this week)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={REVENUE_TREND} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={WEEKLY_REVENUE} dataKey="value" labelKey="label" valuePrefix="₹" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={MONTHLY_REVENUE} dataKey="value" labelKey="label" color="#12B76A" valuePrefix="₹" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily orders</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={DAILY_ORDERS} dataKey="orders" labelKey="day" color="#F79009" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Print volume split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                B&W vs Color
              </p>
              <SimplePieChart data={COLOR_SPLIT} />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                A4 vs A3
              </p>
              <SimplePieChart data={PAPER_SPLIT} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
