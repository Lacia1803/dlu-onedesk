import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
}

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="border rounded-sm bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        [ {title} ]
      </p>
      <div className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground">{value}</div>
      {description && <p className="mt-1 font-mono text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
