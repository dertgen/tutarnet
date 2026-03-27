"use client";

import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, SearchX } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <Loader2 className="w-7 h-7 animate-spin text-admin-accent" />
    </div>
  );
}

export function LoadingSkeleton({ className, rows = 3 }: { className?: string, rows?: number }) {
  return (
    <div className={cn("space-y-4 py-8", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-admin" />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Bir hata oluştu", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  label?: string;
  icon?: ReactNode;
}

export function EmptyState({ label = "Kayıt bulunamadı", icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-muted-foreground">{icon ?? <SearchX className="w-8 h-8" />}</span>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

interface ToastProps {
  ok: boolean;
  text: string;
}

// Deprecated component that now just wraps Sonner for backward compatibility
export function Toast({ ok, text }: ToastProps) {
  useEffect(() => {
    if (ok) {
      toast.success(text);
    } else {
      toast.error(text);
    }
  }, [ok, text]);

  return null;
}
