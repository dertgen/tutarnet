import { cn } from "@/lib/utils";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export type BadgeVariant =
  | "green" | "yellow" | "red" | "gray" | "blue" | "purple"
  | "orange" | "teal" | "indigo" | "default" | "secondary" | "destructive" | "outline";

/* bundui-inspired badge color map with semantic dot indicator support */
const variantClasses: Partial<Record<BadgeVariant, string>> = {
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80",
  yellow: "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/80",
  red:    "bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100/80",
  gray:   "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  blue:   "bg-blue-50 text-blue-700 border-blue-200/60 hover:bg-blue-100/80",
  purple: "bg-violet-50 text-violet-700 border-violet-200/60 hover:bg-violet-100/80",
  orange: "bg-orange-50 text-orange-700 border-orange-200/60 hover:bg-orange-100/80",
  teal:   "bg-teal-50 text-teal-700 border-teal-200/60 hover:bg-teal-100/80",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/80",
};

const dotColors: Partial<Record<BadgeVariant, string>> = {
  green:  "bg-emerald-500",
  yellow: "bg-amber-500",
  red:    "bg-red-500",
  gray:   "bg-muted-foreground",
  blue:   "bg-blue-500",
  purple: "bg-violet-500",
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
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant] || "bg-current")} />}
      {children}
    </ShadcnBadge>
  );
}
