"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DevicePieChartProps {
  data: { name: string; value: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  BROKEN: "#ef4444",
  MAINTENANCE: "#eab308",
  RETIRED: "#64748b",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Hoạt động",
  BROKEN: "Hỏng",
  MAINTENANCE: "Bảo trì",
  RETIRED: "Thanh lý",
};

export function DevicePieChart({ data }: DevicePieChartProps) {
  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">Chưa có dữ liệu thiết bị</div>;
  }

  const formattedData = data.map(d => ({
    name: STATUS_LABELS[d.name] || d.name,
    value: d.value,
    color: STATUS_COLORS[d.name] || "#ccc"
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} thiết bị`, "Số lượng"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
