import {
  normalizePageTransition,
  pageTransitionClassName,
  pageTransitionExitClassName,
  pageTransitionExitStyle,
  pageTransitionStyle,
} from "@/lib/motion/page-transition";
import {
  DEFAULT_SITE_MENU_TRANSITION,
  type PageTransitionSpec,
  type SiteMenuTransitionSpec,
} from "@/lib/motion/types";

function isLegacyMenuTransition(
  value: Partial<SiteMenuTransitionSpec> | Partial<PageTransitionSpec> | undefined
): value is Partial<PageTransitionSpec> {
  return Boolean(value && "type" in value && !("enter" in value));
}

export function normalizeSiteMenuTransition(
  spec: Partial<SiteMenuTransitionSpec> | Partial<PageTransitionSpec> | undefined
): SiteMenuTransitionSpec {
  if (!spec) return DEFAULT_SITE_MENU_TRANSITION;

  if (isLegacyMenuTransition(spec)) {
    return {
      enter: normalizePageTransition(spec),
      exit: { ...DEFAULT_SITE_MENU_TRANSITION.exit },
    };
  }

  return {
    enter: normalizePageTransition(spec.enter ?? DEFAULT_SITE_MENU_TRANSITION.enter),
    exit: normalizePageTransition(spec.exit ?? DEFAULT_SITE_MENU_TRANSITION.exit),
  };
}

export type SiteMenuTransitionPhase = "enter" | "exit";

export function siteMenuPhaseSpec(
  menuTransition: SiteMenuTransitionSpec,
  phase: SiteMenuTransitionPhase
): PageTransitionSpec {
  return phase === "exit" ? menuTransition.exit : menuTransition.enter;
}

export function siteMenuPhaseClassName(
  menuTransition: SiteMenuTransitionSpec,
  phase: SiteMenuTransitionPhase
) {
  const spec = siteMenuPhaseSpec(menuTransition, phase);
  return phase === "exit"
    ? pageTransitionExitClassName(spec.type)
    : pageTransitionClassName(spec.type);
}

export function siteMenuPhaseStyle(
  menuTransition: SiteMenuTransitionSpec,
  phase: SiteMenuTransitionPhase
) {
  const spec = siteMenuPhaseSpec(menuTransition, phase);
  return phase === "exit" ? pageTransitionExitStyle(spec) : pageTransitionStyle(spec);
}

export function siteMenuTransitionDurationMs(
  menuTransition: SiteMenuTransitionSpec,
  phase: SiteMenuTransitionPhase
) {
  return siteMenuPhaseSpec(menuTransition, phase).durationMs;
}
