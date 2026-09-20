"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#2E5CFF", "#B8C8FF"];

export function SimpleBarChart({
  data,
  dataKey,
  labelKey,
  color = "#2E5CFF",
  valuePrefix = "",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  labelKey: string;
  color?: string;
  valuePrefix?: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5E8EC" />
          <XAxis dataKey={labelKey} tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E5E8EC", fontSize: 13 }}
            formatter={(value: number) => [`${valuePrefix}${value}`, ""]}
          />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimplePieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex items-center gap-6">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E8EC", fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2.5">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-ink-muted">{entry.name}</span>
            <span className="font-medium text-ink">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
