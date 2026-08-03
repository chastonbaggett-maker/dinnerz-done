"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useOptionalMotionEditor } from "@/components/motion/MotionEditorProvider";
import { MOTION_DRAFT_CHANGED_EVENT, readMotionDraft } from "@/lib/motion/draft-storage";
import { normalizeMotionDocument } from "@/lib/motion/document";
import {
  pageTransitionClassName,
  pageTransitionStyle,
} from "@/lib/motion/page-transition";
import {
  MOTION_PREVIEW_PLAY_EVENT,
  MOTION_PREVIEW_STOP_EVENT,
  type MotionPreviewPlayDetail,
} from "@/lib/motion/preview-playback";
import { DEFAULT_PAGE_TRANSITION, type PageTransitionSpec } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

function PageTransitionFrame({
  spec,
  frameKey,
  children,
}: {
  spec: PageTransitionSpec;
  frameKey: string;
  children: ReactNode;
}) {
  const transitionClass = pageTransitionClassName(spec.type);

  if (!transitionClass) {
    return <div key={frameKey}>{children}</div>;
  }

  return (
    <div key={frameKey} className={cn(transitionClass)} style={pageTransitionStyle(spec)}>
      {children}
    </div>
  );
}

export function PageTransitionHost({
  children,
  initialPageTransition,
}: {
  children: ReactNode;
  initialPageTransition?: PageTransitionSpec;
}) {
  const pathname = usePathname();
  const editor = useOptionalMotionEditor();
  const isFirstMount = useRef(true);
  const [spec, setSpec] = useState<PageTransitionSpec>(
    initialPageTransition ?? DEFAULT_PAGE_TRANSITION
  );
  const [previewToken, setPreviewToken] = useState(0);
  const loopIntervalRef = useRef<number | null>(null);

  const skipTransition = isFirstMount.current && previewToken === 0;

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  useEffect(() => {
    if (editor?.enabled) {
      setSpec(editor.draft.pageTransition);
    }
  }, [editor?.enabled, editor?.draft.pageTransition]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublished() {
      try {
        const res = await fetch("/api/motion", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const doc = normalizeMotionDocument(await res.json());
        if (!cancelled && !editor?.enabled) {
          setSpec(doc.pageTransition);
        }
      } catch {
        if (!cancelled && !editor?.enabled) {
          setSpec(initialPageTransition ?? DEFAULT_PAGE_TRANSITION);
        }
      }
    }

    function syncFromDraft() {
      if (editor?.enabled) return;
      setSpec(readMotionDraft().pageTransition);
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
  }, [editor?.enabled, initialPageTransition]);

  useEffect(() => {
    function clearLoop() {
      if (loopIntervalRef.current !== null) {
        window.clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    }

    function onPlay(event: Event) {
      const detail = (event as CustomEvent<MotionPreviewPlayDetail>).detail;
      if (detail.mode !== "page-transition") return;

      clearLoop();
      setPreviewToken((token) => token + 1);

      if (detail.loop) {
        loopIntervalRef.current = window.setInterval(() => {
          setPreviewToken((token) => token + 1);
        }, spec.durationMs + 80);
      }
    }

    function onStop() {
      clearLoop();
    }

    window.addEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
    window.addEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);

    return () => {
      clearLoop();
      window.removeEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
      window.removeEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);
    };
  }, [spec.durationMs]);

  if (skipTransition) {
    return <>{children}</>;
  }

  const frameKey = `${pathname}-${previewToken}`;

  return (
    <PageTransitionFrame spec={spec} frameKey={frameKey}>
      {children}
    </PageTransitionFrame>
  );
}
