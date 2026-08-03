import type { MotionSpecDocument } from "@/lib/motion/types";
import { emptyMotionDocument } from "@/lib/motion/css";
import { normalizeMotionDocument } from "@/lib/motion/document";

export const MOTION_DRAFT_STORAGE_KEY = "dinnerz-motion-draft";
export const MOTION_DRAFT_CHANGED_EVENT = "dd:motion-draft-changed";

export function readMotionDraft(): MotionSpecDocument {
  if (typeof window === "undefined") return emptyMotionDocument();

  try {
    const raw = window.localStorage.getItem(MOTION_DRAFT_STORAGE_KEY);
    if (!raw) return emptyMotionDocument();
    return normalizeMotionDocument(JSON.parse(raw) as MotionSpecDocument);
  } catch {
    return emptyMotionDocument();
  }
}

export function writeMotionDraft(doc: MotionSpecDocument) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MOTION_DRAFT_STORAGE_KEY, JSON.stringify(doc));
    window.dispatchEvent(new CustomEvent(MOTION_DRAFT_CHANGED_EVENT));
  } catch {
    // ignore quota errors
  }
}

export function clearMotionDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOTION_DRAFT_STORAGE_KEY);
}
