"use client";

import { useRouter } from "next/navigation";
import type { DriverRouteSummary } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { formatOrderNumber, formatTimeSlot } from "@/lib/delivery/slots";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DriverRouteViewProps {
  summary: DriverRouteSummary;
}

export function DriverRouteView({ summary }: DriverRouteViewProps) {
  const router = useRouter();
  const { route, stops, nextStop, completedCount, totalStops, driverPayCents } = summary;

  async function startRoute() {
    const res = await fetch("/api/driver/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId: route.id }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    toast.success("Route started");
    router.refresh();
  }

  async function completeStop(stopId: string) {
    const res = await fetch("/api/driver/complete-stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stopId }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    toast.success("Stop completed");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Driver route</h1>
        <p className="text-muted-foreground">{route.driver?.name ?? "Your route"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{completedCount}/{totalStops}</p>
          <p className="text-xs text-muted-foreground">Stops done</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{formatCents(driverPayCents)}</p>
          <p className="text-xs text-muted-foreground">Base pay + tips</p>
        </div>
      </div>

      {route.status === "planned" && (
        <Button className="h-14 w-full text-base" onClick={() => startRoute().catch((e) => toast.error(e.message))}>
          Start route
        </Button>
      )}

      {nextStop && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
          <Badge className="mb-2">Next stop #{nextStop.sequence}</Badge>
          <p className="text-3xl font-bold">
            {formatOrderNumber(nextStop.order?.order_number ?? null, route.service_date)}
          </p>
          <p className="mt-2 text-lg font-semibold">{nextStop.order?.customer_name}</p>
          <p className="text-muted-foreground">{nextStop.order?.delivery_address}</p>
          {nextStop.order?.delivery_slot && (
            <p className="mt-2 text-sm">
              Window: {formatTimeSlot(nextStop.order.delivery_slot)}
              {nextStop.order.is_premium_delivery && nextStop.order.requested_delivery_time && (
                <> · Arrive by ~{nextStop.order.requested_delivery_time.slice(11, 16)}</>
              )}
            </p>
          )}
          <Button
            className="mt-4 h-14 w-full text-base"
            onClick={() => completeStop(nextStop.id).catch((e) => toast.error(e.message))}
          >
            Mark delivered
          </Button>
        </div>
      )}

      {!nextStop && totalStops > 0 && (
        <div className="rounded-2xl border p-6 text-center">
          <p className="text-xl font-semibold">Route complete!</p>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold">All stops</h2>
        {stops.map((stop) => (
          <div
            key={stop.id}
            className={`rounded-xl border p-4 ${stop.completed_at ? "opacity-60" : ""}`}
          >
            <div className="flex justify-between">
              <span className="font-medium">
                #{stop.sequence} {formatOrderNumber(stop.order?.order_number ?? null, route.service_date)}
              </span>
              {stop.completed_at && <Badge variant="secondary">Done</Badge>}
            </div>
            <p className="text-sm">{stop.order?.customer_name}</p>
            <p className="text-sm text-muted-foreground">{stop.order?.delivery_address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
