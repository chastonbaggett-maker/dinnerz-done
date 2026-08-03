"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, CalendarDays, Settings, UtensilsCrossed, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/menus", label: "Menus", icon: CalendarDays },
  { href: "/admin/items", label: "Items", icon: UtensilsCrossed },
  { href: "/admin/routes", label: "Routes", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3">
        <Link href="/" className="mr-4 shrink-0 font-semibold">
          Dinnerz Done
        </Link>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
