import type { StudentView } from "@/backend";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: StudentView[];
}

const PIE_COLORS = [
  "#1a237e",
  "#3949ab",
  "#5c6bc0",
  "#7986cb",
  "#9fa8da",
  "#c5cae9",
];

function groupByDept(
  students: StudentView[],
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const s of students) {
    const dept = s.department || "Unknown";
    map.set(dept, (map.get(dept) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DepartmentPieChart({ data }: Props) {
  const chartData = data.length > 0 ? groupByDept(data) : samplePieData;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={80}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {chartData.map((_, i) => (
            <Cell
              key={chartData[i]?.name ?? `cell-${i}`}
              fill={PIE_COLORS[i % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "oklch(1.0 0.002 240)",
            border: "1px solid oklch(0.88 0.015 240)",
            borderRadius: "0.375rem",
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

const samplePieData = [
  { name: "Computer Science", value: 38 },
  { name: "Physics", value: 22 },
  { name: "Mathematics", value: 18 },
  { name: "Electronics", value: 14 },
  { name: "Others", value: 8 },
];
