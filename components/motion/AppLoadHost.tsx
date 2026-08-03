"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useOptionalMotionEditor } from "@/components/motion/MotionEditorProvider";
import {
  cleanupAppLoadAnimations,
  runAppLoadAnimations,
} from "@/lib/motion/app-load";
import { removeAppLoadPrehideStyles } from "@/lib/motion/app-load-prehide";
import { MOTION_DRAFT_CHANGED_EVENT, readMotionDraft } from "@/lib/motion/draft-storage";
import { normalizeMotionDocument } from "@/lib/motion/document";
import {
  MOTION_PREVIEW_PLAY_EVENT,
  MOTION_PREVIEW_STOP_EVENT,
  type MotionPreviewPlayDetail,
} from "@/lib/motion/preview-playback";
import { DEFAULT_APP_LOAD, type AppLoadSpec } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export function AppLoadHost({
  children,
  initialAppLoad,
}: {
  children: ReactNode;
  initialAppLoad?: AppLoadSpec;
}) {
  const editor = useOptionalMotionEditor();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cleanupsRef = useRef<Array<() => void>>([]);
  const loopIntervalRef = useRef<number | null>(null);
  const playedRef = useRef(false);
  const [spec, setSpec] = useState<AppLoadSpec>(initialAppLoad ?? DEFAULT_APP_LOAD);

  useEffect(() => {
    if (editor?.enabled) {
      setSpec(editor.draft.appLoad);
    }
  }, [editor?.enabled, editor?.draft.appLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublished() {
      try {
        const res = await fetch("/api/motion", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const doc = normalizeMotionDocument(await res.json());
        if (!cancelled && !editor?.enabled) {
          setSpec(doc.appLoad);
        }
      } catch {
        if (!cancelled && !editor?.enabled) {
          setSpec(initialAppLoad ?? DEFAULT_APP_LOAD);
        }
      }
    }

    function syncFromDraft() {
      if (editor?.enabled) return;
      setSpec(readMotionDraft().appLoad);
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
  }, [editor?.enabled, initialAppLoad]);

  useEffect(() => {
    function clearLoop() {
      if (loopIntervalRef.current !== null) {
        window.clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    }

    function play(options?: { loop?: boolean }) {
      cleanupAppLoadAnimations(cleanupsRef.current);
      cleanupsRef.current = [];
      clearLoop();
      removeAppLoadPrehideStyles();

      const result = runAppLoadAnimations(spec, {
        root: wrapperRef.current ?? undefined,
      });

      if (result) {
        cleanupsRef.current = result.cleanups;
      }

      if (options?.loop && result) {
        loopIntervalRef.current = window.setInterval(() => {
          cleanupAppLoadAnimations(cleanupsRef.current);
          cleanupsRef.current = [];
          const loopResult = runAppLoadAnimations(spec, {
            root: wrapperRef.current ?? undefined,
          });
          if (loopResult) {
            cleanupsRef.current = loopResult.cleanups;
          }
        }, result.totalDurationMs + 120);
      }
    }

    function onPreviewPlay(event: Event) {
      const detail = (event as CustomEvent<MotionPreviewPlayDetail>).detail;
      if (detail.mode !== "app-load") return;
      play({ loop: detail.loop });
    }

    function onPreviewStop() {
      clearLoop();
      cleanupAppLoadAnimations(cleanupsRef.current);
      cleanupsRef.current = [];
      removeAppLoadPrehideStyles();
    }

    window.addEventListener(MOTION_PREVIEW_PLAY_EVENT, onPreviewPlay);
    window.addEventListener(MOTION_PREVIEW_STOP_EVENT, onPreviewStop);

    return () => {
      clearLoop();
      window.removeEventListener(MOTION_PREVIEW_PLAY_EVENT, onPreviewPlay);
      window.removeEventListener(MOTION_PREVIEW_STOP_EVENT, onPreviewStop);
      cleanupAppLoadAnimations(cleanupsRef.current);
    };
  }, [spec]);

  useLayoutEffect(() => {
    if (editor?.enabled) {
      removeAppLoadPrehideStyles();
      return;
    }
    if (spec.mode === "none") {
      removeAppLoadPrehideStyles();
      return;
    }
    if (!wrapperRef.current) return;
    if (playedRef.current) return;

    playedRef.current = true;
    removeAppLoadPrehideStyles();

    const result = runAppLoadAnimations(spec, { root: wrapperRef.current });
    if (result) {
      cleanupsRef.current = result.cleanups;
    }
  }, [spec, editor?.enabled]);

  return (
    <div ref={wrapperRef} className={cn("app-load-host flex min-h-full flex-1 flex-col")}>
      {children}
    </div>
  );
}
