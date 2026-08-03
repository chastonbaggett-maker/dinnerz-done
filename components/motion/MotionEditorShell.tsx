"use client";

import { useEffect, useState } from "react";
import { MotionEditorProvider } from "@/components/motion/MotionEditorProvider";
import { MotionEditorPanel } from "@/components/motion/MotionEditorPanel";
import { MOTION_EDITOR_UNLOCK_EVENT } from "@/lib/motion/editor-gesture";

export function MotionEditorShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [gestureUnlocked, setGestureUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) return;
        const data = (await res.json()) as { admin?: boolean };
        if (!cancelled) setIsAdmin(Boolean(data.admin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }

    void checkAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onUnlock = () => {
      setGestureUnlocked(true);
      void fetch("/api/motion/editor-unlock", { method: "POST" });
    };
    window.addEventListener(MOTION_EDITOR_UNLOCK_EVENT, onUnlock);
    return () => window.removeEventListener(MOTION_EDITOR_UNLOCK_EVENT, onUnlock);
  }, []);

  return (
    <MotionEditorProvider enabled={isAdmin || gestureUnlocked}>
      {children}
      <MotionEditorPanel />
    </MotionEditorProvider>
  );
}
