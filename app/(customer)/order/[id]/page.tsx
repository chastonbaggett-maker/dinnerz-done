import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db/queries";
import { formatCents, formatServiceDate, formatShortDate } from "@/lib/dates";
import { formatOrderNumber } from "@/lib/delivery/slots";
import { OrderProgressTracker } from "@/components/orders/OrderProgressTracker";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { demo } = await searchParams;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-36">
      <div className="rounded-2xl border bg-card p-6 text-center">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">Order confirmed</h1>
        <p className="mt-1 text-lg font-medium text-primary">
          {formatOrderNumber(order.order_number, order.daily_menu?.service_date)}
        </p>
        <p className="mt-2 text-muted-foreground">
          {demo ? "Demo mode — payment skipped." : "Thank you! We received your payment."}
        </p>
        <div className="mt-5 rounded-xl border bg-muted/20 p-4 text-left">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Order progress</p>
          <OrderProgressTracker status={order.order_status} fulfillmentType={order.fulfillment_type} />
          {order.fulfillment_type !== "delivery" && (
            <Badge className="mt-3 capitalize">{order.order_status.replaceAll("_", " ")}</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border p-6">
        <div>
          <p className="text-sm text-muted-foreground">Service date</p>
          <p className="font-medium">
            {order.daily_menu?.service_date
              ? formatServiceDate(order.daily_menu.service_date)
              : formatShortDate(order.created_at)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fulfillment</p>
          <p className="font-medium capitalize">{order.fulfillment_type}</p>
          {order.delivery_address && <p className="text-sm">{order.delivery_address}</p>}
        </div>
        <div className="space-y-2">
          {(order.order_lines ?? []).map((line) => (
            <div key={line.id} className="flex justify-between text-sm">
              <span>
                {line.quantity}x {line.item_name}
              </span>
              <span>{formatCents(line.line_total_cents)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatCents(order.total_cents)}</span>
        </div>
      </div>

      <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex h-12 w-full items-center justify-center")}>
        Order again
      </Link>
    </div>
  );
}
