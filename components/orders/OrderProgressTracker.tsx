import type { FulfillmentType, OrderStatus } from "@/lib/types";
import { DELIVERY_TRACKING_STEPS, getTrackingStepStates } from "@/lib/orders/tracking";
import { cn } from "@/lib/utils";

interface OrderProgressTrackerProps {
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  className?: string;
}

export function OrderProgressTracker({ status, fulfillmentType, className }: OrderProgressTrackerProps) {
  const stepStates = getTrackingStepStates(status, fulfillmentType);

  if (stepStates.length === 0) {
    return (
      <p className={cn("text-sm capitalize text-muted-foreground", className)}>
        {status.replaceAll("_", " ")}
      </p>
    );
  }

  if (status === "cancelled") {
    return <p className={cn("text-sm text-muted-foreground", className)}>Order cancelled</p>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {DELIVERY_TRACKING_STEPS.map((label, index) => {
        const state = stepStates[index];

        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2.5 text-sm leading-snug",
              state === "completed" && "font-semibold text-foreground",
              state === "current" && "font-medium text-primary",
              state === "upcoming" && "text-muted-foreground/50"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                state === "completed" && "bg-foreground",
                state === "current" && "bg-primary shadow-[0_0_0_3px] shadow-primary/25",
                state === "upcoming" && "bg-muted-foreground/30"
              )}
            />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
