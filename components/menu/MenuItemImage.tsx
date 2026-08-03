import Image from "next/image";
import { getMenuItemImageUrl } from "@/lib/menu-images";
import { cn } from "@/lib/utils";

interface MenuItemImageProps {
  itemId: string;
  itemName: string;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function MenuItemImage({
  itemId,
  itemName,
  imageUrl,
  className,
  size = "sm",
}: MenuItemImageProps) {
  const src = getMenuItemImageUrl(itemId, imageUrl, itemName);
  const dimensions = size === "sm" ? "size-20" : "size-14";

  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-muted text-2xl",
          dimensions,
          className
        )}
      >
        🍽️
      </div>
    );
  }

  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-muted", dimensions, className)}>
      <Image
        src={src}
        alt={itemName}
        fill
        className="object-cover"
        sizes={size === "sm" ? "80px" : "56px"}
      />
    </div>
  );
}
