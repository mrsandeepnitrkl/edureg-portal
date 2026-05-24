import type { RegistrationView } from "@/backend";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: RegistrationView[];
}

function groupByDate(
  registrations: RegistrationView[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const reg of registrations) {
    const d = new Date(Number(reg.createdAt / 1_000_000n));
    const label = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  // Sort by date
  const sorted = [...registrations]
    .sort((a, b) => Number(a.createdAt - b.createdAt))
    .reduce((acc, reg) => {
      const d = new Date(Number(reg.createdAt / 1_000_000n));
      const label = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      if (!acc.has(label)) acc.set(label, 0);
      acc.set(label, acc.get(label)! + 1);
      return acc;
    }, new Map<string, number>());
  return Array.from(sorted.entries()).map(([date, count]) => ({ date, count }));
}

export function RegistrationsLineChart({ data }: Props) {
  const chartData = data.length > 0 ? groupByDate(data) : sampleLineData;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 16, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 240)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }}
          tickLine={false}
          axisLine={{ stroke: "oklch(0.88 0.015 240)" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(1.0 0.002 240)",
            border: "1px solid oklch(0.88 0.015 240)",
            borderRadius: "0.375rem",
            fontSize: 12,
          }}
          labelStyle={{ color: "oklch(0.13 0.025 265)", fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Registrations"
          stroke="#1a237e"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#1a237e", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const sampleLineData = [
  { date: "01 Jan", count: 2 },
  { date: "05 Jan", count: 5 },
  { date: "10 Jan", count: 8 },
  { date: "15 Jan", count: 14 },
  { date: "20 Jan", count: 20 },
  { date: "25 Jan", count: 18 },
];
