import Link from "next/link";
import { getMenuItems } from "@/lib/db/queries";
import { formatCents } from "@/lib/dates";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function AdminItemsPage() {
  const items = await getMenuItems(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu library</h1>
        <Link href="/admin/items/new" className={cn(buttonVariants())}>
          Add item
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/items/${item.id}`}
            className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">{formatCents(item.base_price_cents)}</p>
            </div>
            <Badge variant={item.active ? "default" : "secondary"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
