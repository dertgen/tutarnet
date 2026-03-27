import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ReactNode, CSSProperties } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AdminCard({ children, className, style }: AdminCardProps) {
  return (
    <Card
      className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}
      style={style}
    >
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  const trendPositive = trend && trend.value >= 0;
  return (
    <AdminCard className={cn("flex items-center gap-4", className)}>
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", trendPositive ? "text-emerald-600" : "text-red-500")}>
            {trendPositive ? "+" : ""}{trend.value}% {trend.label ?? "bu hafta"}
          </p>
        )}
      </div>
    </AdminCard>
  );
}
