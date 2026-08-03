import { Home, Package, ShoppingBag, Snowflake, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageIconVariant = "home" | "menu" | "freezey" | "cart" | "track";

const pageIconConfig: Record<
  PageIconVariant,
  { icon: LucideIcon; containerClass: string; iconClass: string }
> = {
  home: {
    icon: Home,
    containerClass: "size-10 bg-primary/10 text-primary",
    iconClass: "size-6",
  },
  menu: {
    icon: UtensilsCrossed,
    containerClass: "size-12 bg-primary/10 text-primary",
    iconClass: "size-6",
  },
  freezey: {
    icon: Snowflake,
    containerClass: "size-12 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-100",
    iconClass: "size-6",
  },
  cart: {
    icon: ShoppingBag,
    containerClass: "size-10 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
    iconClass: "size-6",
  },
  track: {
    icon: Package,
    containerClass: "size-10 bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-100",
    iconClass: "size-6",
  },
};

interface PageIconProps {
  variant: PageIconVariant;
  className?: string;
}

export function PageIcon({ variant, className }: PageIconProps) {
  const { icon: Icon, containerClass, iconClass } = pageIconConfig[variant];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        containerClass,
        className
      )}
    >
      <Icon className={iconClass} strokeWidth={2.25} />
    </div>
  );
}

export function getPageIconVariant(pathname: string): PageIconVariant | null {
  if (pathname === "/cart" || pathname.startsWith("/cart/")) return "cart";
  if (pathname === "/orders" || pathname.startsWith("/order/")) return "track";
  if (pathname.startsWith("/freezey-lunches")) return "freezey";
  if (pathname === "/menu" || pathname.startsWith("/menu/")) return "menu";
  if (pathname === "/") return "home";
  return null;
}

export function getPageIconHref(variant: PageIconVariant): string {
  switch (variant) {
    case "cart":
      return "/cart";
    case "track":
      return "/orders";
    case "freezey":
      return "/freezey-lunches";
    case "menu":
      return "/menu";
    case "home":
      return "/";
  }
}

export function getPageIconLabel(variant: PageIconVariant): string {
  switch (variant) {
    case "cart":
      return "Cart";
    case "track":
      return "Track your order";
    case "freezey":
      return "Freezey Lunches";
    case "menu":
      return "Menu";
    case "home":
      return "Home";
  }
}
