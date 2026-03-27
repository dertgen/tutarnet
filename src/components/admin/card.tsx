import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminCard({ children, className }: AdminCardProps) {
  return (
    <Card
      className={cn("bg-card border border-border shadow-sm rounded-xl p-5", className)}
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
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground leading-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", trendPositive ? "text-emerald-600" : "text-red-500")}>
            {trendPositive ? "+" : ""}{trend.value}% {trend.label ?? "bu hafta"}
          </p>
        )}
      </div>
    </AdminCard>
  );
}

/* bundui-inspired KPI card with icon, value, label */

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  colorClass?: string;
  className?: string;
}

export function KpiCard({ label, value, icon, colorClass, className }: KpiCardProps) {
  const parts = (colorClass ?? "text-admin-accent bg-admin-accent/10").split(" ");
  const textColor = parts[0];
  const bgColor = parts[1] ?? "";
  return (
    <Card className={cn("p-5 flex items-center gap-4 border-border shadow-sm", className)}>
      {icon && (
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bgColor, textColor)}>
          {icon}
        </div>
      )}
      <div>
        <div className={cn("text-2xl font-extrabold tracking-tight mb-0.5", textColor)}>
          {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}

/* bundui-inspired metric card (value + label, no icon) */

interface MetricCardProps {
  label: string;
  value: string | number;
  colorClass?: string;
  className?: string;
}

export function MetricCard({ label, value, colorClass = "text-admin-accent", className }: MetricCardProps) {
  return (
    <AdminCard className={cn("px-5 py-4", className)}>
      <div className={cn("text-2xl font-extrabold tracking-tight", colorClass)}>
        {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </AdminCard>
  );
}
