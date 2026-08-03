"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PageIcon,
  getPageIconHref,
  getPageIconLabel,
  getPageIconVariant,
} from "@/components/layout/PageIcon";

export function HeaderPageIcon() {
  const pathname = usePathname();
  const variant = getPageIconVariant(pathname);

  if (!variant) return null;

  return (
    <Link
      href={getPageIconHref(variant)}
      aria-label={getPageIconLabel(variant)}
      aria-current="page"
      className="rounded-xl transition-opacity hover:opacity-90"
    >
      <PageIcon variant={variant} />
    </Link>
  );
}
