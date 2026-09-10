"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getTechKPI, TechKPIResult } from "@/app/actions/kpi-actions";

export function TechKPIDashboard() {
  const [data, setData] = useState<TechKPIResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPI() {
      const res = await getTechKPI();
      setData(res);
      setLoading(false);
    }
    fetchKPI();
  }, []);

  if (loading) return <p className="text-center py-4">Đang tải KPI …</p>;

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-primary">▶</span> KPI KỸ THUẬT VIÊN
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ticketCount" fill="#22c55e" name="Số ticket" />
          <Bar dataKey="avgResolutionHours" fill="#3b82f6" name="Trung bình (h)" />
          <Bar dataKey="overdueRatio" fill="#ef4444" name="% Quá hạn" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
