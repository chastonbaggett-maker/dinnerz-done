import { Check, ChefHat, ClipboardCheck, Home, ShoppingBasket, Truck } from "lucide-react";
import type { FulfillmentType, OrderStatus } from "@/lib/types";
import { DELIVERY_TRACKING_STEPS, getTrackingStepStates } from "@/lib/orders/tracking";
import { cn } from "@/lib/utils";

const STEP_ICONS = [ClipboardCheck, ShoppingBasket, ChefHat, Truck, Home] as const;

interface OrderProgressTrackerProps {
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  serviceDate?: string;
  createdAt?: string;
  timezone?: string;
  className?: string;
  variant?: "timeline" | "compact";
}

export function OrderProgressTracker({
  status,
  fulfillmentType,
  serviceDate,
  createdAt,
  timezone,
  className,
  variant = "timeline",
}: OrderProgressTrackerProps) {
  const stepStates = getTrackingStepStates(status, fulfillmentType, {
    serviceDate,
    createdAt,
    timezone,
  });

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

  const currentIndex = stepStates.findIndex((state) => state === "current");
  const activeIndex = currentIndex >= 0 ? currentIndex : stepStates.length - 1;
  const progressPercent = ((activeIndex + 1) / DELIVERY_TRACKING_STEPS.length) * 100;

  if (variant === "compact") {
    const currentStep = DELIVERY_TRACKING_STEPS[activeIndex];
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-1.5 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950">
          <div
            className="h-full rounded-full bg-violet-700 transition-all duration-500 dark:bg-violet-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm font-medium text-foreground">{currentStep.label}</p>
      </div>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {DELIVERY_TRACKING_STEPS.map((step, index) => {
        const state = stepStates[index];
        const Icon = STEP_ICONS[index];
        const isLast = index === DELIVERY_TRACKING_STEPS.length - 1;

        return (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-5 top-10 -ml-px h-[calc(100%-1.5rem)] w-0.5",
                  state === "completed" ? "bg-violet-600/70 dark:bg-violet-500/50" : "bg-border"
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                state === "completed" && "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500",
                state === "current" &&
                  "border-violet-700 bg-violet-100 text-violet-800 shadow-[0_0_0_4px] shadow-violet-200 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-100 dark:shadow-violet-900/40",
                state === "upcoming" && "border-muted bg-muted/50 text-muted-foreground/40"
              )}
            >
              {state === "completed" ? (
                <Check className="size-5" strokeWidth={2.5} />
              ) : (
                <Icon className="size-4" />
              )}
              {state === "current" && (
                <span className="absolute inset-0 animate-ping rounded-full border border-violet-400/30 dark:border-violet-300/20" />
              )}
            </div>

            <div className={cn("min-w-0 flex-1 pt-1.5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm leading-snug",
                  state === "completed" && "font-semibold text-foreground",
                  state === "current" && "font-semibold text-violet-800 dark:text-violet-200",
                  state === "upcoming" && "font-medium text-muted-foreground/45"
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs leading-relaxed",
                  state === "current" ? "text-muted-foreground" : "text-muted-foreground/60",
                  state === "upcoming" && "opacity-60"
                )}
              >
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
