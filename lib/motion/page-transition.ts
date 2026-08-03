import type { CSSProperties } from "react";
import {
  DEFAULT_PAGE_TRANSITION,
  isSlidePageTransition,
  type PageTransitionSpec,
  type PageTransitionType,
} from "@/lib/motion/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function slideTranslateVars(
  type: PageTransitionType,
  offsetPx: number
): Record<string, string> {
  switch (type) {
    case "slide-up":
      return { "--page-transition-translate-y": `${offsetPx}px` };
    case "slide-down":
      return { "--page-transition-translate-y": `${-offsetPx}px` };
    case "slide-left":
      return { "--page-transition-translate-x": `${offsetPx}px` };
    case "slide-right":
      return { "--page-transition-translate-x": `${-offsetPx}px` };
    default:
      return {};
  }
}

export function normalizePageTransition(
  spec: Partial<PageTransitionSpec> | undefined
): PageTransitionSpec {
  if (!spec) return DEFAULT_PAGE_TRANSITION;

  return {
    type: spec.type ?? DEFAULT_PAGE_TRANSITION.type,
    durationMs:
      typeof spec.durationMs === "number" ? spec.durationMs : DEFAULT_PAGE_TRANSITION.durationMs,
    easing: spec.easing ?? DEFAULT_PAGE_TRANSITION.easing,
    opacityFrom:
      typeof spec.opacityFrom === "number"
        ? clamp(spec.opacityFrom, 0, 100)
        : DEFAULT_PAGE_TRANSITION.opacityFrom,
    offsetPx:
      typeof spec.offsetPx === "number"
        ? clamp(spec.offsetPx, 0, 120)
        : DEFAULT_PAGE_TRANSITION.offsetPx,
    scaleFrom:
      typeof spec.scaleFrom === "number"
        ? clamp(spec.scaleFrom, 50, 100)
        : DEFAULT_PAGE_TRANSITION.scaleFrom,
  };
}

export function pageTransitionClassName(type: PageTransitionSpec["type"]) {
  if (type === "none") return "";
  return `page-transition-enter page-transition-enter--${type}`;
}

export function pageTransitionStyle(spec: PageTransitionSpec): CSSProperties {
  const style: Record<string, string> = {
    "--page-transition-duration": `${spec.durationMs}ms`,
    "--page-transition-easing": spec.easing,
    "--page-transition-opacity-from": String(spec.opacityFrom / 100),
    "--page-transition-scale-from": String(spec.scaleFrom / 100),
    "--page-transition-translate-x": "0px",
    "--page-transition-translate-y": "0px",
  };

  if (isSlidePageTransition(spec.type)) {
    Object.assign(style, slideTranslateVars(spec.type, spec.offsetPx));
  }

  return style as CSSProperties;
}

function slideExitTranslateVars(
  type: PageTransitionType,
  offsetPx: number
): Record<string, string> {
  switch (type) {
    case "slide-up":
      return { "--page-transition-translate-y": `${-offsetPx}px` };
    case "slide-down":
      return { "--page-transition-translate-y": `${offsetPx}px` };
    case "slide-left":
      return { "--page-transition-translate-x": `${-offsetPx}px` };
    case "slide-right":
      return { "--page-transition-translate-x": `${offsetPx}px` };
    default:
      return {};
  }
}

export function pageTransitionExitClassName(type: PageTransitionSpec["type"]) {
  if (type === "none") return "";
  return `page-transition-exit page-transition-exit--${type}`;
}

export function pageTransitionExitStyle(spec: PageTransitionSpec): CSSProperties {
  const style: Record<string, string> = {
    "--page-transition-duration": `${spec.durationMs}ms`,
    "--page-transition-easing": spec.easing,
    "--page-transition-opacity-from": String(spec.opacityFrom / 100),
    "--page-transition-scale-from": String(spec.scaleFrom / 100),
    "--page-transition-translate-x": "0px",
    "--page-transition-translate-y": "0px",
    "--page-transition-scale-to": String(spec.scaleFrom / 100),
  };

  if (isSlidePageTransition(spec.type)) {
    Object.assign(style, slideExitTranslateVars(spec.type, spec.offsetPx));
  }

  return style as CSSProperties;
}
