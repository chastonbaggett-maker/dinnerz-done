"use client";

import { useEffect, useState } from "react";
import { useOptionalMotionEditor } from "@/components/motion/MotionEditorProvider";
import { MOTION_DRAFT_CHANGED_EVENT, readMotionDraft } from "@/lib/motion/draft-storage";
import { normalizeMotionDocument } from "@/lib/motion/document";
import {
  siteMenuPhaseClassName,
  siteMenuPhaseSpec,
  siteMenuPhaseStyle,
  type SiteMenuTransitionPhase,
} from "@/lib/motion/site-menu-transition";
import { DEFAULT_SITE_MENU_TRANSITION, type SiteMenuTransitionSpec } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export function useSiteMenuTransitionSpec() {
  const editor = useOptionalMotionEditor();
  const [spec, setSpec] = useState<SiteMenuTransitionSpec>(DEFAULT_SITE_MENU_TRANSITION);

  useEffect(() => {
    if (editor?.enabled) {
      setSpec(editor.draft.menuTransition);
    }
  }, [editor?.enabled, editor?.draft.menuTransition]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublished() {
      try {
        const res = await fetch("/api/motion", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const doc = normalizeMotionDocument(await res.json());
        if (!cancelled && !editor?.enabled) {
          setSpec(doc.menuTransition);
        }
      } catch {
        if (!cancelled && !editor?.enabled) {
          setSpec(DEFAULT_SITE_MENU_TRANSITION);
        }
      }
    }

    function syncFromDraft() {
      if (editor?.enabled) return;
      setSpec(readMotionDraft().menuTransition);
    }

    void loadPublished();
    syncFromDraft();

    const onPublished = () => void loadPublished();
    const onDraftChanged = () => syncFromDraft();

    window.addEventListener("motion-specs-published", onPublished);
    window.addEventListener(MOTION_DRAFT_CHANGED_EVENT, onDraftChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("motion-specs-published", onPublished);
      window.removeEventListener(MOTION_DRAFT_CHANGED_EVENT, onDraftChanged);
    };
  }, [editor?.enabled]);

  return spec;
}

export function SiteMenuTransitionFrame({
  frameKey,
  menuTransition,
  phase,
  children,
  className,
}: {
  frameKey: string;
  menuTransition: SiteMenuTransitionSpec;
  phase: SiteMenuTransitionPhase;
  children: React.ReactNode;
  className?: string;
}) {
  const spec = siteMenuPhaseSpec(menuTransition, phase);
  const transitionClass = siteMenuPhaseClassName(menuTransition, phase);

  if (!transitionClass || spec.type === "none") {
    return (
      <div key={frameKey} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      key={frameKey}
      className={cn(transitionClass, className)}
      style={siteMenuPhaseStyle(menuTransition, phase)}
    >
      {children}
    </div>
  );
}
