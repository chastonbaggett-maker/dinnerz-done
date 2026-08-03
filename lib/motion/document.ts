import { emptyMotionDocument } from "@/lib/motion/css";
import { normalizeAppLoad } from "@/lib/motion/app-load";
import { normalizeMotionEffect } from "@/lib/motion/effects";
import { normalizePageTransition } from "@/lib/motion/page-transition";
import { normalizeSiteMenuTransition } from "@/lib/motion/site-menu-transition";
import type { MotionSpecDocument } from "@/lib/motion/types";

export function normalizeMotionDocument(
  doc: Partial<MotionSpecDocument> | null | undefined
): MotionSpecDocument {
  const base = emptyMotionDocument();
  if (!doc) return base;

  return {
    version: 1,
    rules: Array.isArray(doc.rules)
      ? doc.rules.map((rule) => ({
          ...rule,
          effects: normalizeMotionEffect(rule.effects),
        }))
      : [],
    pageTransition: normalizePageTransition(doc.pageTransition),
    menuTransition: normalizeSiteMenuTransition(doc.menuTransition),
    appLoad: normalizeAppLoad(doc.appLoad),
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : base.updatedAt,
  };
}
