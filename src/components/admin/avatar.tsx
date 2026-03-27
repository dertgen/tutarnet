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

export function AvatarInitials({ name, size = 36, color, className }: AvatarInitialsProps) {
  const initials = getInitials(name);
  return (
    <Avatar
      className={cn("flex-shrink-0 select-none", className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <AvatarFallback
        className="text-white font-semibold"
        style={{
          fontSize: size * 0.38,
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
      className={cn("w-8 h-8 rounded-lg", className)}
    >
      <Icon className="w-4 h-4" style={{ color: color }} strokeWidth={1.8} />
    </Button>
  );
}
