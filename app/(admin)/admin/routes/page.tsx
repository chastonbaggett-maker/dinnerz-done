import { getBusinessSettings } from "@/lib/db/queries";
import { getRoutesForDate, ensureDeliverySlots } from "@/lib/db/routes";
import { getTomorrowDateString } from "@/lib/dates";
import { RouteGenerator } from "@/components/admin/RouteGenerator";
import { RouteDatePicker } from "@/components/admin/RouteDatePicker";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminRoutesPage({ searchParams }: PageProps) {
  const settings = await getBusinessSettings();
  const { date } = await searchParams;
  const serviceDate = date ?? getTomorrowDateString(settings.timezone);

  await ensureDeliverySlots(serviceDate);
  const routes = await getRoutesForDate(serviceDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Delivery routes</h1>
          <p className="text-muted-foreground">Assign orders to drivers by time slot and address cluster</p>
        </div>
        <RouteDatePicker defaultDate={serviceDate} />
      </div>

      <p className="text-sm">
        Service date: <strong>{serviceDate}</strong>
      </p>

      <RouteGenerator
        serviceDate={serviceDate}
        routes={routes}
        driverDeliveryFeeCents={settings.driver_delivery_fee_cents}
      />
    </div>
  );
}
