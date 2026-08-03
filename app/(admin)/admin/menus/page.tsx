import Link from "next/link";
import { getDailyMenus } from "@/lib/db/queries";
import { formatServiceDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateMenuForm } from "@/components/admin/CreateMenuForm";

export default async function AdminMenusPage() {
  const menus = await getDailyMenus();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Daily menus</h1>
        <CreateMenuForm />
      </div>

      <div className="space-y-3">
        {menus.map((menu) => (
          <Link
            key={menu.id}
            href={`/admin/menus/${menu.service_date}`}
            className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{formatServiceDate(menu.service_date)}</p>
              <p className="text-sm text-muted-foreground">{menu.service_date}</p>
            </div>
            <Badge>{menu.status}</Badge>
          </Link>
        ))}
        {menus.length === 0 && (
          <p className="text-muted-foreground">No menus yet. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
