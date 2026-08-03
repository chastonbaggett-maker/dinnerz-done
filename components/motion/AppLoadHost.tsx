"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { runAppLoadAnimations } from "@/lib/motion/app-load";
import { removeAppLoadPrehideStyles } from "@/lib/motion/app-load-prehide";
import { normalizeMotionDocument } from "@/lib/motion/document";
import { clearEnterAnimationInlineStyles } from "@/lib/motion/enter-animation";
import { DEFAULT_APP_LOAD, type AppLoadSpec } from "@/lib/motion/types";
import { APP_LOAD_COMPLETE_EVENT } from "@/lib/pwa/nav-shelf-discovery";

function finalizeAppLoadRegions(spec: AppLoadSpec) {
  if (spec.mode !== "elements") return;

  for (const region of spec.elements.regions) {
    if (!region.enabled) continue;
    document.querySelectorAll(region.selector).forEach((node) => {
      if (node instanceof HTMLElement) {
        clearEnterAnimationInlineStyles(node);
      }
    });
  }
}

export function AppLoadHost({
  children,
  initialAppLoad,
}: {
  children: ReactNode;
  initialAppLoad?: AppLoadSpec;
}) {
  const playedRef = useRef(false);
  const finalizeTimerRef = useRef<number | null>(null);
  const [spec, setSpec] = useState<AppLoadSpec>(initialAppLoad ?? DEFAULT_APP_LOAD);

  useEffect(() => {
    let cancelled = false;

    async function loadPublished() {
      try {
        const res = await fetch("/api/motion", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const doc = normalizeMotionDocument(await res.json());
        if (!cancelled) {
          setSpec(doc.appLoad);
        }
      } catch {
        if (!cancelled) {
          setSpec(initialAppLoad ?? DEFAULT_APP_LOAD);
        }
      }
    }

    void loadPublished();

    const onPublished = () => void loadPublished();
    window.addEventListener("motion-specs-published", onPublished);

    return () => {
      cancelled = true;
      window.removeEventListener("motion-specs-published", onPublished);
    };
  }, [initialAppLoad]);

  useLayoutEffect(() => {
    removeAppLoadPrehideStyles();

    if (spec.mode === "none" || playedRef.current) {
      return;
    }

    playedRef.current = true;

    const result = runAppLoadAnimations(spec, { root: document.body });
    if (!result) return;

    if (finalizeTimerRef.current !== null) {
      window.clearTimeout(finalizeTimerRef.current);
    }

    finalizeTimerRef.current = window.setTimeout(() => {
      finalizeTimerRef.current = null;
      for (const cleanup of result.cleanups) {
        cleanup();
      }
      finalizeAppLoadRegions(spec);
      window.dispatchEvent(
        new CustomEvent(APP_LOAD_COMPLETE_EVENT, {
          detail: { totalDurationMs: result.totalDurationMs },
        })
      );
    }, result.totalDurationMs + 50);
  }, [spec]);

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current !== null) {
        window.clearTimeout(finalizeTimerRef.current);
        finalizeTimerRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
