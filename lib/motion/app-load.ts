import {
  pageTransitionClassName,
  pageTransitionStyle,
  normalizePageTransition,
} from "@/lib/motion/page-transition";
import { applyEnterAnimationToElement, buildEnterEffectSpec } from "@/lib/motion/enter-animation";
import {
  DEFAULT_APP_LOAD,
  DEFAULT_APP_LOAD_REGIONS,
  type AppLoadElementsConfig,
  type AppLoadElementsSpec,
  type AppLoadRegionId,
  type AppLoadRegionSpec,
  type AppLoadSpec,
} from "@/lib/motion/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isLegacyElementsConfig(
  value: Partial<AppLoadElementsConfig> | Partial<AppLoadElementsSpec> | undefined
): value is Partial<AppLoadElementsSpec> {
  return Boolean(value && "selector" in value && !("regions" in value));
}

export function normalizeAppLoadRegion(
  spec: Partial<AppLoadRegionSpec> | undefined,
  fallbackId: AppLoadRegionId
): AppLoadRegionSpec {
  const base =
    DEFAULT_APP_LOAD_REGIONS.find((region) => region.id === fallbackId) ??
    DEFAULT_APP_LOAD_REGIONS[0];

  if (!spec) return { ...base };

  return {
    id: spec.id === "header" || spec.id === "main" || spec.id === "bottom-nav" ? spec.id : base.id,
    enabled: typeof spec.enabled === "boolean" ? spec.enabled : base.enabled,
    selector: spec.selector?.trim() || base.selector,
    animationName: spec.animationName ?? base.animationName,
    durationMs:
      typeof spec.durationMs === "number" ? clamp(spec.durationMs, 100, 3000) : base.durationMs,
    easing: spec.easing ?? base.easing,
    opacityFrom:
      typeof spec.opacityFrom === "number" ? clamp(spec.opacityFrom, 0, 100) : base.opacityFrom,
    offsetPx:
      typeof spec.offsetPx === "number" ? clamp(spec.offsetPx, 0, 120) : base.offsetPx,
    scaleFrom:
      typeof spec.scaleFrom === "number" ? clamp(spec.scaleFrom, 50, 100) : base.scaleFrom,
    staggerMs:
      typeof spec.staggerMs === "number" ? clamp(spec.staggerMs, 0, 500) : base.staggerMs,
    baseDelayMs:
      typeof spec.baseDelayMs === "number" ? clamp(spec.baseDelayMs, 0, 2000) : base.baseDelayMs,
    maxElements:
      typeof spec.maxElements === "number" ? clamp(spec.maxElements, 1, 80) : base.maxElements,
  };
}

function migrateLegacyElementsConfig(
  legacy: Partial<AppLoadElementsSpec>
): AppLoadElementsConfig {
  return {
    regions: DEFAULT_APP_LOAD_REGIONS.map((region) => {
      if (region.id !== "main") {
        return { ...region };
      }

      return normalizeAppLoadRegion(
        {
          ...region,
          selector: legacy.selector ?? region.selector,
          animationName: legacy.animationName,
          durationMs: legacy.durationMs,
          easing: legacy.easing,
          opacityFrom: legacy.opacityFrom,
          offsetPx: legacy.offsetPx,
          scaleFrom: legacy.scaleFrom,
          staggerMs: legacy.staggerMs,
          baseDelayMs: legacy.baseDelayMs,
          maxElements: legacy.maxElements,
        },
        "main"
      );
    }),
  };
}

export function normalizeAppLoadElements(
  spec: Partial<AppLoadElementsConfig> | Partial<AppLoadElementsSpec> | undefined
): AppLoadElementsConfig {
  if (!spec) {
    return {
      regions: DEFAULT_APP_LOAD_REGIONS.map((region) => ({ ...region })),
    };
  }

  if (isLegacyElementsConfig(spec)) {
    return migrateLegacyElementsConfig(spec);
  }

  const incoming = Array.isArray(spec.regions) ? spec.regions : [];
  const regions = DEFAULT_APP_LOAD_REGIONS.map((defaultRegion) => {
    const match = incoming.find((region) => region.id === defaultRegion.id);
    return normalizeAppLoadRegion(match, defaultRegion.id);
  });

  return { regions };
}

export function normalizeAppLoad(spec: Partial<AppLoadSpec> | undefined): AppLoadSpec {
  if (!spec) return DEFAULT_APP_LOAD;

  const mode =
    spec.mode === "simple" || spec.mode === "elements" || spec.mode === "none"
      ? spec.mode
      : DEFAULT_APP_LOAD.mode;

  return {
    mode,
    simple: normalizePageTransition(spec.simple ?? DEFAULT_APP_LOAD.simple),
    elements: normalizeAppLoadElements(spec.elements),
  };
}

type AppLoadRunResult = {
  cleanups: Array<() => void>;
  totalDurationMs: number;
};

function getRegionTargets(region: AppLoadRegionSpec) {
  return Array.from(document.querySelectorAll(region.selector))
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .slice(0, region.maxElements);
}

function applyRegionAnimations(region: AppLoadRegionSpec) {
  const cleanups: Array<() => void> = [];
  const targets = getRegionTargets(region);
  if (targets.length === 0) {
    return { cleanups, totalDurationMs: 0 };
  }

  const baseEffect = buildEnterEffectSpec({
    animationName: region.animationName,
    durationMs: region.durationMs,
    easing: region.easing,
    opacityFrom: region.opacityFrom,
    offsetPx: region.offsetPx,
    scaleFrom: region.scaleFrom,
  });

  targets.forEach((el, index) => {
    const effect = {
      ...baseEffect,
      animationDelayMs: region.baseDelayMs + index * region.staggerMs,
    };
    cleanups.push(applyEnterAnimationToElement(el, effect));
  });

  const lastDelay = region.baseDelayMs + Math.max(0, targets.length - 1) * region.staggerMs;

  return {
    cleanups,
    totalDurationMs: lastDelay + region.durationMs,
  };
}

export function runAppLoadAnimations(
  spec: AppLoadSpec,
  options?: { root?: HTMLElement }
): AppLoadRunResult | null {
  if (spec.mode === "none") return null;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const cleanups: Array<() => void> = [];

  if (spec.mode === "simple") {
    if (spec.simple.type === "none") return null;

    const root = options?.root ?? document.body;
    const transitionClass = pageTransitionClassName(spec.simple.type);
    if (!transitionClass) return null;

    root.classList.add(...transitionClass.split(" "));
    const style = pageTransitionStyle(spec.simple);
    for (const [key, value] of Object.entries(style)) {
      if (typeof value === "string" || typeof value === "number") {
        root.style.setProperty(key, String(value));
      }
    }

    cleanups.push(() => {
      root.classList.remove(...transitionClass.split(" "));
      for (const key of Object.keys(style)) {
        root.style.removeProperty(key);
      }
    });

    return {
      cleanups,
      totalDurationMs: spec.simple.durationMs,
    };
  }

  let totalDurationMs = 0;
  let played = false;

  for (const region of spec.elements.regions) {
    if (!region.enabled) continue;

    const result = applyRegionAnimations(region);
    if (result.cleanups.length === 0) continue;

    played = true;
    cleanups.push(...result.cleanups);
    totalDurationMs = Math.max(totalDurationMs, result.totalDurationMs);
  }

  if (!played) return null;

  return {
    cleanups,
    totalDurationMs,
  };
}

export function cleanupAppLoadAnimations(cleanups: Array<() => void>) {
  for (const cleanup of cleanups) {
    cleanup();
  }
}

export function countAppLoadTargets(region: AppLoadRegionSpec) {
  if (typeof document === "undefined") return 0;
  return getRegionTargets(region).length;
}
