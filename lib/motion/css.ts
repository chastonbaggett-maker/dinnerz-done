import type { MotionEffectSpec, MotionRule, MotionSpecDocument } from "@/lib/motion/types";
import { DEFAULT_PAGE_TRANSITION, DEFAULT_APP_LOAD, DEFAULT_SITE_MENU_TRANSITION } from "@/lib/motion/types";
import {
  isEnterMotionAnimation,
  motionEffectCssVars,
  normalizeMotionEffect,
} from "@/lib/motion/effects";

export function effectToCssBlock(selector: string, effectsInput: MotionEffectSpec) {
  const effects = normalizeMotionEffect(effectsInput);
  const varLines = Object.entries(motionEffectCssVars(effects)).map(
    ([key, value]) => `${key}: ${value};`
  );

  const lines = [
    ...varLines,
    `transition-property: ${effects.transitionProperty};`,
    `transition-duration: ${effects.transitionDurationMs}ms;`,
    `transition-timing-function: ${effects.transitionTimingFunction};`,
    `transition-delay: ${effects.transitionDelayMs}ms;`,
  ];

  if (effects.animationName && effects.animationName !== "none") {
    lines.push(
      `animation-name: ${effects.animationName};`,
      `animation-duration: ${effects.animationDurationMs}ms;`,
      `animation-timing-function: ${effects.animationTimingFunction};`,
      `animation-iteration-count: ${effects.animationIterationCount};`,
      `animation-delay: ${effects.animationDelayMs}ms;`
    );
    if (isEnterMotionAnimation(effects.animationName)) {
      lines.push("animation-fill-mode: both;");
    }
  } else {
    lines.push("animation: none;");
  }

  return `${selector} {\n  ${lines.join("\n  ")}\n}`;
}

export function documentToStylesheet(doc: MotionSpecDocument) {
  if (doc.rules.length === 0) return "";

  const blocks = doc.rules.map((rule) => effectToCssBlock(rule.selector, rule.effects));
  return `@media (prefers-reduced-motion: no-preference) {\n${blocks.join("\n\n")}\n}`;
}

export function mergeRulesForTargets(
  rules: MotionRule[],
  targetIds: string[],
  selector: string,
  label: string,
  effects: MotionEffectSpec
) {
  const next = rules.filter((rule) => !rule.targetIds.some((id) => targetIds.includes(id)));
  if (targetIds.length === 0) return next;

  next.push({
    targetIds,
    selector,
    label,
    effects,
  });

  return next;
}

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
