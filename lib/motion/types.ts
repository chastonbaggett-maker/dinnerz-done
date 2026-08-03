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
  updatedAt: string;
}

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
};

export const MOTION_ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
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
