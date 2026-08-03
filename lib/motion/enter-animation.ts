import type { MotionEffectSpec } from "@/lib/motion/types";
import {
  isEnterMotionAnimation,
  motionEffectCssVars,
  normalizeMotionEffect,
} from "@/lib/motion/effects";

export function buildEnterEffectSpec(input: {
  animationName: string;
  durationMs: number;
  easing: string;
  opacityFrom: number;
  offsetPx: number;
  scaleFrom: number;
  delayMs?: number;
}): MotionEffectSpec {
  return normalizeMotionEffect({
    animationName: input.animationName,
    animationDurationMs: input.durationMs,
    animationTimingFunction: input.easing,
    animationIterationCount: "1",
    animationDelayMs: input.delayMs ?? 0,
    opacityFrom: input.opacityFrom,
    offsetPx: input.offsetPx,
    scaleFrom: input.scaleFrom,
  });
}

export function applyEnterAnimationToElement(
  el: HTMLElement,
  effectsInput: MotionEffectSpec
): () => void {
  const effects = normalizeMotionEffect(effectsInput);

  for (const [key, value] of Object.entries(motionEffectCssVars(effects))) {
    el.style.setProperty(key, value);
  }

  el.style.animation = "none";
  void el.offsetHeight;
  el.style.animationName = effects.animationName;
  el.style.animationDuration = `${effects.animationDurationMs}ms`;
  el.style.animationTimingFunction = effects.animationTimingFunction;
  el.style.animationIterationCount = effects.animationIterationCount;
  el.style.animationDelay = `${effects.animationDelayMs}ms`;
  if (isEnterMotionAnimation(effects.animationName)) {
    el.style.animationFillMode = "both";
  }

  return () => {
    el.style.removeProperty("animation");
    el.style.removeProperty("animation-name");
    el.style.removeProperty("animation-duration");
    el.style.removeProperty("animation-timing-function");
    el.style.removeProperty("animation-iteration-count");
    el.style.removeProperty("animation-delay");
    el.style.removeProperty("animation-fill-mode");
    for (const key of Object.keys(motionEffectCssVars(effects))) {
      el.style.removeProperty(key);
    }
  };
}
