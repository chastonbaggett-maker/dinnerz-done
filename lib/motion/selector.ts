const MOTION_TARGET_ATTR = "data-motion-target";

export function ensureMotionTargetId(element: Element) {
  const existing = element.getAttribute(MOTION_TARGET_ATTR);
  if (existing) return existing;

  const id = `mt-${Math.random().toString(36).slice(2, 10)}`;
  element.setAttribute(MOTION_TARGET_ATTR, id);
  return id;
}

export function selectorForTargetId(id: string) {
  return `[${MOTION_TARGET_ATTR}="${id}"]`;
}

export function labelForElement(element: Element) {
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 42);
  const tag = element.tagName.toLowerCase();
  const className = element.className?.toString().split(" ").filter(Boolean)[0];
  return className ? `${tag}.${className}` : tag;
}
