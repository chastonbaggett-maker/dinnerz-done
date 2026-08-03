"use client";

import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatCents, formatShortDate } from "@/lib/dates";
import { formatOrderNumber, formatTimeSlot } from "@/lib/delivery/slots";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = [
  "received",
  "preparing",
  "out_for_delivery",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();

  async function updateStatus(id: string, orderStatus: string) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, orderStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Status updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (orders.length === 0) {
    return <p className="text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                {formatOrderNumber(order.order_number, order.daily_menu?.service_date)}{" "}
                {order.customer_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.phone} · {order.email}
              </p>
              <p className="mt-1 text-sm">
                {order.daily_menu?.service_date
                  ? formatShortDate(order.daily_menu.service_date)
                  : "—"}{" "}
                · {order.fulfillment_type}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCents(order.total_cents)}</p>
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="mt-1">
                {order.payment_status}
              </Badge>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-sm">
            {(order.order_lines ?? []).map((line) => (
              <p key={line.id}>
                {line.quantity}x {line.item_name}
              </p>
            ))}
          </div>

          {order.delivery_address && (
            <p className="mt-2 text-sm text-muted-foreground">{order.delivery_address}</p>
          )}
          {order.delivery_slot && (
            <p className="mt-1 text-sm">
              Window: {formatTimeSlot(order.delivery_slot)}
              {order.is_premium_delivery && " · Premium exact-time"}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Select value={order.order_status} onValueChange={(v) => v && updateStatus(order.id, v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
