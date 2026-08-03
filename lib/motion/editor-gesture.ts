export const MOTION_EDITOR_UNLOCK_EVENT = "dd:motion-editor-unlock";

export function unlockMotionEditor() {
  window.dispatchEvent(new CustomEvent(MOTION_EDITOR_UNLOCK_EVENT));
  void fetch("/api/motion/editor-unlock", { method: "POST" });
}
