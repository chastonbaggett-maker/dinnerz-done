"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  PageIcon,
  getPageIconHref,
  getPageIconLabel,
  getPageIconVariant,
} from "@/components/layout/PageIcon";
import { unlockMotionEditor } from "@/lib/motion/editor-gesture";

const TAP_GOAL = 10;
const TAP_RESET_MS = 2500;

export function HeaderPageIcon() {
  const pathname = usePathname();
  const variant = getPageIconVariant(pathname);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  if (!variant) return null;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (variant !== "home") return;

    tapCountRef.current += 1;

    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= TAP_GOAL) {
      tapCountRef.current = 0;
      event.preventDefault();
      unlockMotionEditor();
      return;
    }

    tapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
      tapTimerRef.current = null;
    }, TAP_RESET_MS);
  }

  return (
    <Link
      href={getPageIconHref(variant)}
      aria-label={getPageIconLabel(variant)}
      aria-current="page"
      onClick={handleClick}
      className="rounded-xl transition-opacity hover:opacity-90"
    >
      <PageIcon variant={variant} />
    </Link>
  );
}
