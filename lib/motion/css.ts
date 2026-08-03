import type { MotionEffectSpec, MotionRule, MotionSpecDocument } from "@/lib/motion/types";

export function effectToCssBlock(selector: string, effects: MotionEffectSpec) {
  const lines = [
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
  return { version: 1, rules: [], updatedAt: new Date().toISOString() };
}
