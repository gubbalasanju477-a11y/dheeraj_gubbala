import Link from "next/link";
import { ArrowRight, FileStack, IndianRupee, Layers, Receipt } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { JobsTable } from "@/components/admin/JobsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_ORDERS, REVENUE_TREND } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted">Here's how PrintEase is doing today.</p>
        </div>
        <Link href="/admin/database">
          <Button variant="primary">
            <IndianRupee className="h-4 w-4" />
            View Payment Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value="₹3,240" icon={IndianRupee} trend={{ value: "+12% vs yesterday", direction: "up" }} />
        <StatCard label="Print Jobs" value="127" icon={Receipt} trend={{ value: "+8% vs yesterday", direction: "up" }} />
        <StatCard label="Pages Printed" value="2,430" icon={FileStack} trend={{ value: "+5% vs yesterday", direction: "up" }} />
        <StatCard label="Average Order" value="₹25.50" icon={Layers} trend={{ value: "-2% vs yesterday", direction: "down" }} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue this week</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={REVENUE_TREND} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent print jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-5 sm:pt-0">
          <JobsTable rows={MOCK_ORDERS.slice(0, 6)} compact />
        </CardContent>
      </Card>
    </div>
  );
}
