import type { CourseView } from "@/backend";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: CourseView[];
}

const BAR_COLORS = ["#1a237e", "#3949ab", "#5c6bc0", "#7986cb", "#9fa8da"];

export function CourseSeatsBarChart({ data }: Props) {
  const chartData =
    data.length > 0
      ? data.map((c) => ({
          code: c.courseCode,
          available: Math.max(0, Number(c.maxSeats) - Number(c.enrolledCount)),
          enrolled: Number(c.enrolledCount),
        }))
      : sampleBarData;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 16, left: -10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.88 0.015 240)"
          vertical={false}
        />
        <XAxis
          dataKey="code"
          tick={{ fontSize: 10, fill: "oklch(0.45 0.02 260)" }}
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
          formatter={(value: number, name: string) => [
            value,
            name === "available" ? "Available Seats" : "Enrolled",
          ]}
        />
        <Bar dataKey="available" name="available" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell
              key={chartData[i]?.code ?? `cell-${i}`}
              fill={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const sampleBarData = [
  { code: "CSE101", available: 28, enrolled: 12 },
  { code: "PHY202", available: 20, enrolled: 10 },
  { code: "MATHA11", available: 35, enrolled: 5 },
  { code: "ENG301", available: 15, enrolled: 25 },
];
