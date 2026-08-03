import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getOrder, getBusinessSettings } from "@/lib/db/queries";
import { isOrderNextInRoute } from "@/lib/db/routes";
import { formatCents, formatServiceDate, formatShortDate, isServiceDay } from "@/lib/dates";
import { formatOrderNumber } from "@/lib/delivery/slots";
import { OrderProgressTracker } from "@/components/orders/OrderProgressTracker";
import { isPreparingStepActive, isTrackingComplete } from "@/lib/orders/tracking";
import { DinnerzDoneOverlay } from "@/components/orders/DinnerzDoneOverlay";
import { PageIcon } from "@/components/layout/PageIcon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { demo } = await searchParams;
  const [order, settings] = await Promise.all([getOrder(id), getBusinessSettings()]);

  if (!order) notFound();

  const isNextInRoute = await isOrderNextInRoute(order.id, order.route_id);

  const trackingContext = {
    serviceDate: order.daily_menu?.service_date,
    createdAt: order.created_at,
    timezone: settings.timezone,
    isNextInRoute,
  };
  const preparingActive = isPreparingStepActive(
    order.order_status,
    order.fulfillment_type,
    trackingContext
  );
  const trackingComplete = isTrackingComplete(
    order.order_status,
    order.fulfillment_type,
    trackingContext
  );
  const serviceDate = order.daily_menu?.service_date;
  const showOrderForTomorrow = serviceDate
    ? isServiceDay(serviceDate, settings.timezone)
    : false;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-36">
      <div className="mb-6 flex items-center gap-3">
        <PageIcon variant="track" />
        <div className="text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-violet-950 dark:text-violet-50">
            Order confirmed
          </h1>
          <p className="text-sm text-violet-700/80 dark:text-violet-300/80">
            {demo ? "Demo mode — payment skipped." : "Thank you! We received your payment."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/80 to-card p-6 text-center dark:border-violet-900/50 dark:from-violet-950/30">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-100">
          <Check className="size-8" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-3xl font-bold tabular-nums text-violet-800 dark:text-violet-200">
          {formatOrderNumber(order.order_number, order.daily_menu?.service_date)}
        </p>
        <p className="mt-1 text-sm font-medium text-violet-600/90 dark:text-violet-300/90">Your order number</p>
        <div className="relative mt-5 rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-background to-violet-100/40 p-4 text-left dark:border-violet-900/60 dark:from-violet-950/40 dark:to-violet-950/20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-800 dark:text-violet-200">
            Order progress
          </p>
          <OrderProgressTracker
            status={order.order_status}
            fulfillmentType={order.fulfillment_type}
            serviceDate={order.daily_menu?.service_date}
            createdAt={order.created_at}
            timezone={settings.timezone}
          />
          {trackingComplete && <DinnerzDoneOverlay />}
          {order.fulfillment_type !== "delivery" && (
            <Badge className="mt-3 capitalize">{order.order_status.replaceAll("_", " ")}</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-violet-200/60 bg-card p-6 dark:border-violet-900/40">
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

      {showOrderForTomorrow && (
        <Link
          href="/menu"
          className={cn(
            "mt-6 inline-flex h-16 w-full items-center justify-center rounded-2xl text-base font-semibold transition-colors active:scale-[0.99]",
            preparingActive
              ? "animate-gentle-pulse bg-violet-700 text-white shadow-md shadow-violet-200/60 hover:bg-violet-800 hover:animate-none dark:bg-violet-600 dark:shadow-violet-950/40 dark:hover:bg-violet-500"
              : "border border-violet-200 bg-white text-violet-800 shadow-sm hover:bg-violet-50 dark:border-violet-800 dark:bg-card dark:text-violet-100 dark:hover:bg-violet-950/40"
          )}
        >
          Order for tomorrow
        </Link>
      )}
    </div>
  );
}
