"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatCents } from "@/lib/dates";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartBar() {
  const { itemCount, subtotalCents } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Link
        href="/cart"
        className={cn(
          buttonVariants({ size: "lg", variant: "default" }),
          "h-14 w-full border-transparent bg-emerald-600 text-base font-semibold text-white shadow-[0_0_16px_rgba(5,150,105,0.35)] hover:bg-emerald-600/90"
        )}
      >
        <ShoppingBag className="mr-2 size-5" />
        View cart · {itemCount} {itemCount === 1 ? "item" : "items"} · {formatCents(subtotalCents)}
      </Link>
    </div>
  );
}
