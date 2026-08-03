"use client";

import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import type { Order } from "@/lib/types";
import { formatCents, formatServiceDate } from "@/lib/dates";
import { PageIcon } from "@/components/layout/PageIcon";
import { OrderProgressTracker } from "@/components/orders/OrderProgressTracker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrackOrdersViewProps {
  orders: Order[];
}

export function TrackOrdersView({ orders }: TrackOrdersViewProps) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-36">
      <div className="mb-6 flex items-center gap-3">
        <PageIcon variant="track" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Track your order</h1>
          <p className="text-sm text-muted-foreground">See status and delivery details</p>
        </div>
      </div>

      <Show when="signed-out">
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Sign in to view your orders and track delivery status.</p>
          <SignInButton mode="modal">
            <button type="button" className={cn(buttonVariants(), "mt-4 h-12")}>
              Sign in
            </button>
          </SignInButton>
        </div>
      </Show>

      <Show when="signed-in">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link href="/menu" className={cn(buttonVariants(), "mt-4 inline-flex h-12")}>
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {order.daily_menu?.service_date
                        ? formatServiceDate(order.daily_menu.service_date)
                        : "Order"}
                    </p>
                    <p className="text-sm capitalize text-muted-foreground">{order.fulfillment_type}</p>
                    <OrderProgressTracker
                      status={order.order_status}
                      fulfillmentType={order.fulfillment_type}
                      serviceDate={order.daily_menu?.service_date}
                      createdAt={order.created_at}
                      variant="compact"
                      className="mt-3"
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold">{formatCents(order.total_cents)}</p>
                    {order.fulfillment_type !== "delivery" && (
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {order.order_status.replaceAll("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Show>
    </div>
  );
}
