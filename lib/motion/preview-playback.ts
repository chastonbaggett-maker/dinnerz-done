import type { MotionEffectSpec, MotionTarget } from "@/lib/motion/types";
import { applyEnterAnimationToElement } from "@/lib/motion/enter-animation";
import { isEnterMotionAnimation, motionEffectCssVars, normalizeMotionEffect } from "@/lib/motion/effects";

export const MOTION_PREVIEW_PLAY_EVENT = "dd:motion-preview-play";
export const MOTION_PREVIEW_STOP_EVENT = "dd:motion-preview-stop";

export type MotionPreviewMode = "elements" | "page-transition" | "menu-transition" | "app-load";

export type MotionPreviewPlayDetail = {
  mode: MotionPreviewMode;
  loop: boolean;
};

export function dispatchMotionPreviewPlay(detail: MotionPreviewPlayDetail) {
  window.dispatchEvent(new CustomEvent(MOTION_PREVIEW_PLAY_EVENT, { detail }));
}

export function dispatchMotionPreviewStop() {
  window.dispatchEvent(new CustomEvent(MOTION_PREVIEW_STOP_EVENT));
}

const activeCleanups = new Map<Element, () => void>();

export function stopElementPreviewPlayback() {
  for (const cleanup of activeCleanups.values()) {
    cleanup();
  }
  activeCleanups.clear();
}

function cleanupElementAnimation(el: HTMLElement) {
  el.style.removeProperty("animation");
  el.style.removeProperty("animation-name");
  el.style.removeProperty("animation-duration");
  el.style.removeProperty("animation-timing-function");
  el.style.removeProperty("animation-iteration-count");
  el.style.removeProperty("animation-delay");
}

function playAnimationOnElement(
  el: HTMLElement,
  effectsInput: MotionEffectSpec,
  loop: boolean
) {
  const effects = normalizeMotionEffect({
    ...effectsInput,
    animationIterationCount: loop ? "infinite" : effectsInput.animationIterationCount,
  });

  const apply = () => {
    el.style.animation = "none";
    void el.offsetHeight;

    if (isEnterMotionAnimation(effects.animationName)) {
      activeCleanups.set(el, applyEnterAnimationToElement(el, effects));
      return;
    }

    for (const [key, value] of Object.entries(motionEffectCssVars(effects))) {
      el.style.setProperty(key, value);
    }

    el.style.animationName = effects.animationName;
    el.style.animationDuration = `${effects.animationDurationMs}ms`;
    el.style.animationTimingFunction = effects.animationTimingFunction;
    el.style.animationIterationCount = effects.animationIterationCount;
    el.style.animationDelay = `${effects.animationDelayMs}ms`;
  };

  apply();

  const cleanup = () => {
    cleanupElementAnimation(el);
    for (const key of Object.keys(motionEffectCssVars(effects))) {
      el.style.removeProperty(key);
    }
    activeCleanups.delete(el);
  };

  if (loop) {
    activeCleanups.set(el, cleanup);
    return;
  }

  const onEnd = (event: AnimationEvent) => {
    if (event.target !== el) return;
    cleanup();
    el.removeEventListener("animationend", onEnd);
  };

  el.addEventListener("animationend", onEnd);
}

export function playElementPreview(
  targets: MotionTarget[],
  effects: MotionEffectSpec,
  loop: boolean
) {
  stopElementPreviewPlayback();

  let played = false;

  for (const target of targets) {
    const el = document.querySelector(target.selector);
    if (!(el instanceof HTMLElement)) continue;

    if (effects.animationName === "none") {
      continue;
    }

    playAnimationOnElement(el, effects, loop);
    played = true;
  }

  return played;
}

export function stopMotionPreviewPlayback() {
  stopElementPreviewPlayback();
  dispatchMotionPreviewStop();
}
