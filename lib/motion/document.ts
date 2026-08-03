import { normalizeAppLoad } from "@/lib/motion/app-load";
import { normalizeMotionEffect } from "@/lib/motion/effects";
import { normalizePageTransition } from "@/lib/motion/page-transition";
import { normalizeSiteMenuTransition } from "@/lib/motion/site-menu-transition";
import {
  DEFAULT_APP_LOAD,
  DEFAULT_PAGE_TRANSITION,
  DEFAULT_SITE_MENU_TRANSITION,
  type MotionSpecDocument,
} from "@/lib/motion/types";

export function emptyMotionDocument(): MotionSpecDocument {
  return {
    version: 1,
    rules: [],
    pageTransition: { ...DEFAULT_PAGE_TRANSITION },
    menuTransition: {
      enter: { ...DEFAULT_SITE_MENU_TRANSITION.enter },
      exit: { ...DEFAULT_SITE_MENU_TRANSITION.exit },
    },
    appLoad: {
      mode: DEFAULT_APP_LOAD.mode,
      simple: { ...DEFAULT_APP_LOAD.simple },
      elements: {
        regions: DEFAULT_APP_LOAD.elements.regions.map((region) => ({ ...region })),
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

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
