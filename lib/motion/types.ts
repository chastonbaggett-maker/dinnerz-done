export interface MotionEffectSpec {
  transitionProperty: string;
  transitionDurationMs: number;
  transitionTimingFunction: string;
  transitionDelayMs: number;
  animationName: string;
  animationDurationMs: number;
  animationTimingFunction: string;
  animationIterationCount: string;
  animationDelayMs: number;
  /** Starting opacity for enter animations (0–100). */
  opacityFrom: number;
  /** Slide distance in px for slide enter animations. */
  offsetPx: number;
  /** Starting scale for scale enter animations (50–100). */
  scaleFrom: number;
}

export interface MotionTarget {
  id: string;
  selector: string;
  label: string;
}

export interface MotionRule {
  targetIds: string[];
  selector: string;
  label: string;
  effects: MotionEffectSpec;
}

export interface MotionSpecDocument {
  version: 1;
  rules: MotionRule[];
  pageTransition: PageTransitionSpec;
  menuTransition: SiteMenuTransitionSpec;
  appLoad: AppLoadSpec;
  updatedAt: string;
}

export type AppLoadMode = "none" | "simple" | "elements";

export type AppLoadRegionId = "header" | "main" | "bottom-nav";

export interface AppLoadRegionSpec {
  id: AppLoadRegionId;
  enabled: boolean;
  selector: string;
  animationName: string;
  durationMs: number;
  easing: string;
  opacityFrom: number;
  offsetPx: number;
  scaleFrom: number;
  staggerMs: number;
  baseDelayMs: number;
  maxElements: number;
}

export interface AppLoadElementsConfig {
  regions: AppLoadRegionSpec[];
}

/** @deprecated Legacy single-selector config; migrated to regions on load. */
export interface AppLoadElementsSpec {
  selector: string;
  animationName: string;
  durationMs: number;
  easing: string;
  opacityFrom: number;
  offsetPx: number;
  scaleFrom: number;
  staggerMs: number;
  baseDelayMs: number;
  maxElements: number;
}

export interface AppLoadSpec {
  mode: AppLoadMode;
  /** Whole-page animation when mode is "simple". */
  simple: PageTransitionSpec;
  /** Per-region animations when mode is "elements". */
  elements: AppLoadElementsConfig;
}

export const APP_LOAD_REGION_LABELS: Record<AppLoadRegionId, string> = {
  header: "Header",
  main: "Main content",
  "bottom-nav": "Bottom nav",
};

export const DEFAULT_APP_LOAD_REGIONS: AppLoadRegionSpec[] = [
  {
    id: "header",
    enabled: true,
    selector: '[data-app-load-region="header"]',
    animationName: "motion-slide-down-in",
    durationMs: 450,
    easing: "ease-out",
    opacityFrom: 0,
    offsetPx: 16,
    scaleFrom: 97,
    staggerMs: 0,
    baseDelayMs: 0,
    maxElements: 1,
  },
  {
    id: "main",
    enabled: true,
    selector: "main > *",
    animationName: "motion-fade-in",
    durationMs: 500,
    easing: "ease-out",
    opacityFrom: 0,
    offsetPx: 16,
    scaleFrom: 97,
    staggerMs: 60,
    baseDelayMs: 120,
    maxElements: 32,
  },
  {
    id: "bottom-nav",
    enabled: true,
    selector: '[data-app-load-region="bottom-nav"]',
    animationName: "motion-slide-up-in",
    durationMs: 450,
    easing: "ease-out",
    opacityFrom: 0,
    offsetPx: 20,
    scaleFrom: 97,
    staggerMs: 0,
    baseDelayMs: 200,
    maxElements: 1,
  },
];

export const DEFAULT_APP_LOAD: AppLoadSpec = {
  mode: "none",
  simple: {
    type: "fade",
    durationMs: 400,
    easing: "ease-out",
    opacityFrom: 0,
    offsetPx: 14,
    scaleFrom: 97,
  },
  elements: {
    regions: DEFAULT_APP_LOAD_REGIONS.map((region) => ({ ...region })),
  },
};

export const APP_LOAD_SELECTOR_PRESETS = [
  { value: "main > *", label: "Main sections only" },
  { value: "main *", label: "All main content" },
] as const;

export const APP_LOAD_ANIMATION_OPTIONS = [
  { value: "motion-fade-in", label: "Fade in" },
  { value: "motion-slide-up-in", label: "Slide up in" },
  { value: "motion-slide-down-in", label: "Slide down in" },
  { value: "motion-slide-left-in", label: "Slide left in" },
  { value: "motion-slide-right-in", label: "Slide right in" },
  { value: "motion-scale-in", label: "Scale in" },
] as const;

export type PageTransitionType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale";

export interface PageTransitionSpec {
  type: PageTransitionType;
  durationMs: number;
  easing: string;
  /** Starting opacity as 0–100 (percent). */
  opacityFrom: number;
  /** Slide distance in px (slide transitions). */
  offsetPx: number;
  /** Starting scale as 50–100 (percent, e.g. 97 = scale(0.97)). */
  scaleFrom: number;
}

export const DEFAULT_PAGE_TRANSITION: PageTransitionSpec = {
  type: "fade",
  durationMs: 280,
  easing: "cubic-bezier(0.33, 1, 0.68, 1)",
  opacityFrom: 0,
  offsetPx: 14,
  scaleFrom: 97,
};

export const DEFAULT_MENU_TRANSITION: PageTransitionSpec = {
  type: "slide-up",
  durationMs: 320,
  easing: "ease-out",
  opacityFrom: 0,
  offsetPx: 20,
  scaleFrom: 97,
};

export const DEFAULT_MENU_EXIT_TRANSITION: PageTransitionSpec = {
  type: "slide-down",
  durationMs: 280,
  easing: "ease-in",
  opacityFrom: 0,
  offsetPx: 20,
  scaleFrom: 97,
};

export interface SiteMenuTransitionSpec {
  enter: PageTransitionSpec;
  exit: PageTransitionSpec;
}

export const DEFAULT_SITE_MENU_TRANSITION: SiteMenuTransitionSpec = {
  enter: { ...DEFAULT_MENU_TRANSITION },
  exit: { ...DEFAULT_MENU_EXIT_TRANSITION },
};

export function isSlidePageTransition(type: PageTransitionType) {
  return (
    type === "slide-up" ||
    type === "slide-down" ||
    type === "slide-left" ||
    type === "slide-right"
  );
}

export const PAGE_TRANSITION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-down", label: "Slide down" },
  { value: "slide-left", label: "Slide left" },
  { value: "slide-right", label: "Slide right" },
  { value: "scale", label: "Scale in" },
] as const;

export const DEFAULT_MOTION_EFFECT: MotionEffectSpec = {
  transitionProperty: "all",
  transitionDurationMs: 300,
  transitionTimingFunction: "ease-out",
  transitionDelayMs: 0,
  animationName: "none",
  animationDurationMs: 1750,
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  animationDelayMs: 0,
  opacityFrom: 0,
  offsetPx: 14,
  scaleFrom: 97,
};

export const MOTION_ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "motion-fade-in", label: "Fade in" },
  { value: "motion-slide-up-in", label: "Slide up in" },
  { value: "motion-slide-down-in", label: "Slide down in" },
  { value: "motion-slide-left-in", label: "Slide left in" },
  { value: "motion-slide-right-in", label: "Slide right in" },
  { value: "motion-scale-in", label: "Scale in" },
  { value: "gentle-pulse", label: "Gentle pulse (violet)" },
  { value: "gentle-pulse-emerald", label: "Gentle pulse (emerald)" },
  { value: "gentle-pulse-sky", label: "Gentle pulse (sky)" },
  { value: "pulse", label: "Pulse" },
  { value: "ping", label: "Ping" },
  { value: "spin", label: "Spin" },
] as const;

export const MOTION_EASING_OPTIONS = [
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in-out", label: "Ease in-out" },
  { value: "linear", label: "Linear" },
  { value: "cubic-bezier(0.33, 1, 0.68, 1)", label: "Smooth snap" },
] as const;

export const MOTION_PROPERTY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "opacity", label: "Opacity" },
  { value: "transform", label: "Transform" },
  { value: "colors", label: "Colors" },
  { value: "box-shadow", label: "Box shadow" },
] as const;
