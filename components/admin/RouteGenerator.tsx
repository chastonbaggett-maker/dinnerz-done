"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DeliveryRoute } from "@/lib/types";
import { formatCents } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RouteGeneratorProps {
  serviceDate: string;
  routes: DeliveryRoute[];
  driverDeliveryFeeCents: number;
}

export function RouteGenerator({ serviceDate, routes, driverDeliveryFeeCents }: RouteGeneratorProps) {
  const router = useRouter();
  const [driverCount, setDriverCount] = useState(2);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceDate, driverCount }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Routes generated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
        <div className="space-y-2">
          <Label>Available drivers</Label>
          <Input
            type="number"
            min={1}
            max={10}
            className="w-24"
            value={driverCount}
            onChange={(e) => setDriverCount(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <Button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate routes"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Driver pay: {formatCents(driverDeliveryFeeCents)} per stop (100% to driver fund)
        </p>
      </div>

      {routes.length === 0 ? (
        <p className="text-muted-foreground">No routes yet. Generate after orders are placed.</p>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => {
            const stopCount = route.stops?.length ?? 0;
            const pay = stopCount * driverDeliveryFeeCents;
            return (
              <div key={route.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{route.driver?.name ?? "Unassigned driver"}</p>
                    <p className="text-sm text-muted-foreground">
                      {stopCount} stops · Est. pay {formatCents(pay)} + tips
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{route.status.replaceAll("_", " ")}</Badge>
                    <Link
                      href={`/driver/${route.id}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Driver view →
                    </Link>
                  </div>
                </div>
                <ol className="mt-3 space-y-1 text-sm">
                  {(route.stops ?? [])
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((stop) => (
                      <li key={stop.id}>
                        #{stop.sequence}{" "}
                        {stop.order?.order_number
                          ? `Order ${stop.order.order_number}`
                          : ""}{" "}
                        — {stop.order?.customer_name} · {stop.order?.delivery_address}
                      </li>
                    ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
