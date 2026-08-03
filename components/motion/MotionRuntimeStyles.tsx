"use client";

import { useEffect, useState } from "react";
import { documentToStylesheet, emptyMotionDocument } from "@/lib/motion/css";
import type { MotionSpecDocument } from "@/lib/motion/types";

const LIVE_STYLE_ID = "motion-live-styles";

export function MotionRuntimeStyles() {
  const [css, setCss] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/motion", { cache: "no-store" });
        if (!res.ok) return;
        const doc = (await res.json()) as MotionSpecDocument;
        if (!cancelled) {
          setCss(documentToStylesheet(doc ?? emptyMotionDocument()));
        }
      } catch {
        if (!cancelled) setCss("");
      }
    }

    void load();

    const onPublished = () => void load();
    window.addEventListener("motion-specs-published", onPublished);
    return () => {
      cancelled = true;
      window.removeEventListener("motion-specs-published", onPublished);
    };
  }, []);

  if (!css) return null;

  return <style id={LIVE_STYLE_ID} dangerouslySetInnerHTML={{ __html: css }} />;
}
