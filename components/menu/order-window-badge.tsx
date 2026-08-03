import type { OrderWindowBadgeTone } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mutedRed =
  "border border-red-200/70 bg-red-50 text-red-800 [a]:hover:bg-red-100/80 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200";

const toneClassName: Record<OrderWindowBadgeTone, string> = {
  active:
    "animate-gentle-pulse-emerald border-transparent bg-emerald-600 text-white [a]:hover:bg-emerald-600/90",
  upcoming: mutedRed,
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
