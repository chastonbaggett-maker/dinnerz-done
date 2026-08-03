import type { OrderWindowBadgeTone } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mutedRed =
  "border border-red-200/70 bg-red-50 text-red-800 [a]:hover:bg-red-100/80 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200";

const mutedBlue =
  "border border-primary/30 bg-primary/10 text-primary [a]:hover:bg-primary/15 dark:border-primary/40 dark:bg-primary/15 dark:text-primary-foreground";

const toneClassName: Record<OrderWindowBadgeTone, string> = {
  active:
    "animate-gentle-pulse-emerald border-transparent bg-emerald-600 text-white [a]:hover:bg-emerald-600/90",
  upcoming: mutedBlue,
  closed: mutedRed,
};

interface OrderWindowBadgeProps {
  label: string;
  tone: OrderWindowBadgeTone;
  className?: string;
}

export function OrderWindowBadge({ label, tone, className }: OrderWindowBadgeProps) {
  return (
    <Badge
      className={cn(
        "h-auto min-h-9 max-w-[9.5rem] shrink-0 px-3 py-2 text-sm leading-snug font-semibold whitespace-normal text-center",
        toneClassName[tone],
        className
      )}
    >
      {label}
    </Badge>
  );
}
