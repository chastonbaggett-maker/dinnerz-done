import type { MotionEffectSpec } from "@/lib/motion/types";
import { DEFAULT_MOTION_EFFECT } from "@/lib/motion/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isEnterMotionAnimation(name: string) {
  return (
    name === "motion-fade-in" ||
    name === "motion-slide-up-in" ||
    name === "motion-slide-down-in" ||
    name === "motion-slide-left-in" ||
    name === "motion-slide-right-in" ||
    name === "motion-scale-in"
  );
}

export function isSlideMotionAnimation(name: string) {
  return (
    name === "motion-slide-up-in" ||
    name === "motion-slide-down-in" ||
    name === "motion-slide-left-in" ||
    name === "motion-slide-right-in"
  );
}

export function normalizeMotionEffect(
  spec: Partial<MotionEffectSpec> | undefined
): MotionEffectSpec {
  if (!spec) return { ...DEFAULT_MOTION_EFFECT };

  return {
    transitionProperty: spec.transitionProperty ?? DEFAULT_MOTION_EFFECT.transitionProperty,
    transitionDurationMs:
      typeof spec.transitionDurationMs === "number"
        ? spec.transitionDurationMs
        : DEFAULT_MOTION_EFFECT.transitionDurationMs,
    transitionTimingFunction:
      spec.transitionTimingFunction ?? DEFAULT_MOTION_EFFECT.transitionTimingFunction,
    transitionDelayMs:
      typeof spec.transitionDelayMs === "number"
        ? spec.transitionDelayMs
        : DEFAULT_MOTION_EFFECT.transitionDelayMs,
    animationName: spec.animationName ?? DEFAULT_MOTION_EFFECT.animationName,
    animationDurationMs:
      typeof spec.animationDurationMs === "number"
        ? spec.animationDurationMs
        : DEFAULT_MOTION_EFFECT.animationDurationMs,
    animationTimingFunction:
      spec.animationTimingFunction ?? DEFAULT_MOTION_EFFECT.animationTimingFunction,
    animationIterationCount:
      spec.animationIterationCount ?? DEFAULT_MOTION_EFFECT.animationIterationCount,
    animationDelayMs:
      typeof spec.animationDelayMs === "number"
        ? spec.animationDelayMs
        : DEFAULT_MOTION_EFFECT.animationDelayMs,
    opacityFrom:
      typeof spec.opacityFrom === "number"
        ? clamp(spec.opacityFrom, 0, 100)
        : DEFAULT_MOTION_EFFECT.opacityFrom,
    offsetPx:
      typeof spec.offsetPx === "number"
        ? clamp(spec.offsetPx, 0, 120)
        : DEFAULT_MOTION_EFFECT.offsetPx,
    scaleFrom:
      typeof spec.scaleFrom === "number"
        ? clamp(spec.scaleFrom, 50, 100)
        : DEFAULT_MOTION_EFFECT.scaleFrom,
  };
}

export function motionEffectCssVars(effects: MotionEffectSpec): Record<string, string> {
  const vars: Record<string, string> = {
    "--motion-opacity-from": String(effects.opacityFrom / 100),
    "--motion-scale-from": String(effects.scaleFrom / 100),
    "--motion-translate-x": "0px",
    "--motion-translate-y": "0px",
  };

  switch (effects.animationName) {
    case "motion-slide-up-in":
      vars["--motion-translate-y"] = `${effects.offsetPx}px`;
      break;
    case "motion-slide-down-in":
      vars["--motion-translate-y"] = `${-effects.offsetPx}px`;
      break;
    case "motion-slide-left-in":
      vars["--motion-translate-x"] = `${effects.offsetPx}px`;
      break;
    case "motion-slide-right-in":
      vars["--motion-translate-x"] = `${-effects.offsetPx}px`;
      break;
    default:
      break;
  }

  return vars;
}

export function motionEffectForAnimationChange(
  current: MotionEffectSpec,
  animationName: string
): MotionEffectSpec {
  const next = normalizeMotionEffect({ ...current, animationName });

  if (isEnterMotionAnimation(animationName)) {
    next.animationIterationCount = "1";
    if (animationName === "motion-fade-in") {
      next.animationDurationMs = Math.min(next.animationDurationMs, 800);
    } else if (isSlideMotionAnimation(animationName)) {
      next.animationDurationMs = Math.min(Math.max(next.animationDurationMs, 400), 1200);
    }
  } else if (animationName !== "none") {
    next.animationIterationCount = "infinite";
  }

  return next;
}
