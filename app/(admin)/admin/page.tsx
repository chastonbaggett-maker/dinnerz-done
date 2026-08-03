import { getBusinessSettings, getDashboardStats, getNextAvailableMenu } from "@/lib/db/queries";
import { formatCents, formatCutoffCountdown, formatServiceDate } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [settings, stats, menuData] = await Promise.all([
    getBusinessSettings(),
    getDashboardStats(),
    getNextAvailableMenu(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">{settings.business_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.todayOrderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCents(stats.todayRevenueCents)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending prep</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
      </div>

      {menuData && (
        <Card>
          <CardHeader>
            <CardTitle>Next menu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatServiceDate(menuData.menu.service_date)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCutoffCountdown(menuData.menu.order_cutoff_at, settings.timezone)}
            </p>
            <p className="mt-2 text-sm">{menuData.items.length} items · {menuData.menu.status}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
