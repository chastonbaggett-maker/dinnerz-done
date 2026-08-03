"use client";

import { useEffect, useState } from "react";
import { MotionEditorProvider } from "@/components/motion/MotionEditorProvider";
import { MotionEditorPanel } from "@/components/motion/MotionEditorPanel";

export function MotionEditorShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

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
  }, []);

  return (
    <MotionEditorProvider enabled={isAdmin}>
      {children}
      {isAdmin && <MotionEditorPanel />}
    </MotionEditorProvider>
  );
}
