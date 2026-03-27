import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AvatarInitialsProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const sizeClasses: Record<number, string> = {
  24: "w-6 h-6 text-[9px]",
  26: "w-[26px] h-[26px] text-[10px]",
  28: "w-7 h-7 text-[10px]",
  32: "w-8 h-8 text-xs",
  36: "w-9 h-9 text-sm",
  40: "w-10 h-10 text-sm",
  48: "w-12 h-12 text-base",
};

export function AvatarInitials({ name, size = 36, color, className }: AvatarInitialsProps) {
  const initials = getInitials(name);
  const sizeClass = sizeClasses[size];

  return (
    <Avatar
      className={cn("flex-shrink-0 select-none", sizeClass ?? "", className)}
      style={!sizeClass ? { width: size, height: size } : undefined}
    >
      <AvatarFallback
        className={cn("text-white font-semibold", !sizeClass && "text-sm")}
        style={{
          fontSize: sizeClass ? undefined : size * 0.38,
          background: color ?? "var(--color-admin-accent)",
        }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

interface IconBtnProps {
  icon: LucideIcon;
  title?: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function IconBtn({ icon: Icon, title, color, onClick, disabled, className }: IconBtnProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-8 h-8 rounded-lg hover:bg-muted/80 transition-colors",
        className,
      )}
    >
      <Icon className="w-4 h-4" style={color ? { color } : undefined} strokeWidth={1.8} />
    </Button>
  );
}
