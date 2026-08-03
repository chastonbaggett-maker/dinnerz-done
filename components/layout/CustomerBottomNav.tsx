"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, UtensilsCrossed, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Dinner", icon: UtensilsCrossed },
  { href: "/freezey-lunches", label: "Freezey", icon: Snowflake },
  {
    href: "/orders",
    label: "Track",
    icon: Package,
    activeClassName:
      "font-medium text-violet-800 dark:text-violet-200 bg-violet-100/80 dark:bg-violet-950/60",
  },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-lg items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, label, icon: Icon, ...link }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/orders"
                ? pathname === "/orders" || pathname.startsWith("/order/")
                : pathname.startsWith(href);
          const activeClassName = "activeClassName" in link ? link.activeClassName : undefined;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mx-0.5 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors",
                active
                  ? (activeClassName ?? "font-medium text-primary")
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
