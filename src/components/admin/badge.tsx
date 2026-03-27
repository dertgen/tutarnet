import { cn } from "@/lib/utils";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export type BadgeVariant =
  | "green" | "yellow" | "red" | "gray" | "blue" | "purple"
  | "orange" | "teal" | "indigo" | "default" | "secondary" | "destructive" | "outline";

const variantClasses: Partial<Record<BadgeVariant, string>> = {
  green:  "bg-admin-success-dim text-admin-success border-emerald-200 hover:bg-admin-success-dim",
  yellow: "bg-admin-warning-dim text-admin-warning border-amber-200 hover:bg-admin-warning-dim",
  red:    "bg-admin-danger-dim text-admin-danger border-red-200 hover:bg-admin-danger-dim",
  gray:   "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  blue:   "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  purple: "bg-admin-purple-dim text-admin-purple border-violet-200 hover:bg-admin-purple-dim",
  orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  teal:   "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
};

const dotClasses: Partial<Record<BadgeVariant, string>> = {
  green:  "bg-admin-success",
  yellow: "bg-admin-warning",
  red:    "bg-admin-danger",
  gray:   "bg-slate-400",
  blue:   "bg-blue-500",
  purple: "bg-admin-purple",
  orange: "bg-orange-500",
  teal:   "bg-teal-500",
  indigo: "bg-indigo-500",
};

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "gray", dot = false, children, className }: BadgeProps) {
  const customClass = variantClasses[variant];

  // If it's a standard shadcn variant, use it directly
  const shadcnVariant = ["default", "secondary", "destructive", "outline"].includes(variant)
    ? (variant as "default" | "secondary" | "destructive" | "outline")
    : "outline"; // fallback to outline for custom ones because we inject colors via className

  return (
    <ShadcnBadge
      variant={customClass ? "outline" : shadcnVariant}
      className={cn(
        customClass,
        "inline-flex items-center gap-1.5 px-2.5 rounded-full select-none font-medium",
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClasses[variant] || "bg-current")} />}
      {children}
    </ShadcnBadge>
  );
}
