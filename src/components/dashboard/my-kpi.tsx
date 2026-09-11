"use client";

import { useEffect, useState } from "react";
import { getTechKPI, TechKPIResult } from "@/app/actions/kpi-actions";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function MyKPIDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<TechKPIResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPI() {
      if (!session?.user?.id) return;
      const res = await getTechKPI(session.user.id);
      setData(res);
      setLoading(false);
    }
    fetchKPI();
  }, [session?.user?.id]);

  if (loading)
    return (
      <p className="text-center py-4 font-mono text-xs text-muted-foreground">
        Đang tải KPI cá nhân...
      </p>
    );
  if (data.length === 0) return null;

  const myStat = data[0];

  return (
    <div className="space-y-4 border rounded-sm bg-card p-5">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-primary">▶</span> HIỆU SUẤT CÁ NHÂN (MY.KPI)
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-sm border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              TỔNG TICKET
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold font-mono">{myStat.ticketCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              XỬ LÝ TRUNG BÌNH
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold font-mono">
              {myStat.avgResolutionHours !== null ? `${myStat.avgResolutionHours}h` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              TỶ LỆ QUÁ HẠN
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold font-mono text-red-500">{myStat.overdueRatio}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
