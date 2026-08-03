"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DEFAULT_MOTION_EFFECT,
  type MotionEffectSpec,
  type MotionSpecDocument,
  type MotionTarget,
} from "@/lib/motion/types";
import {
  documentToStylesheet,
  emptyMotionDocument,
  mergeRulesForTargets,
} from "@/lib/motion/css";
import {
  clearMotionDraft,
  readMotionDraft,
  writeMotionDraft,
} from "@/lib/motion/draft-storage";
import {
  ensureMotionTargetId,
  labelForElement,
  selectorForTargetId,
} from "@/lib/motion/selector";

interface MotionEditorContextValue {
  enabled: boolean;
  pickMode: boolean;
  setPickMode: (value: boolean) => void;
  selectedTargets: MotionTarget[];
  clearSelection: () => void;
  removeTarget: (id: string) => void;
  effects: MotionEffectSpec;
  setEffects: (value: MotionEffectSpec) => void;
  draft: MotionSpecDocument;
  publish: () => Promise<void>;
  publishing: boolean;
}

const MotionEditorContext = createContext<MotionEditorContextValue | null>(null);

const PREVIEW_STYLE_ID = "motion-editor-preview-styles";
const HIGHLIGHT_CLASS = "motion-editor-highlight";
const SELECTED_CLASS = "motion-editor-selected";

function buildSelectorForTargets(targets: MotionTarget[]) {
  if (targets.length === 0) return "";
  return targets.map((target) => target.selector).join(", ");
}

export function MotionEditorProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [pickMode, setPickMode] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<MotionTarget[]>([]);
  const [effects, setEffects] = useState<MotionEffectSpec>(DEFAULT_MOTION_EFFECT);
  const [draft, setDraft] = useState<MotionSpecDocument>(emptyMotionDocument());
  const [publishing, setPublishing] = useState(false);
  const hoveredRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setDraft(readMotionDraft());
  }, [enabled]);

  const applyPreviewStyles = useCallback(
    (doc: MotionSpecDocument) => {
      const css = documentToStylesheet(doc);
      let node = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
      if (!node) {
        node = document.createElement("style");
        node.id = PREVIEW_STYLE_ID;
        document.head.appendChild(node);
      }
      node.textContent = css;
    },
    []
  );

  const updateDraftFromSelection = useCallback(
    (targets: MotionTarget[], nextEffects: MotionEffectSpec) => {
      setDraft((current) => {
        const targetIds = targets.map((target) => target.id);
        const selector = buildSelectorForTargets(targets);
        const label =
          targets.length === 1
            ? targets[0].label
            : `${targets.length} elements (${targets[0]?.label ?? "selection"})`;

        const rules = mergeRulesForTargets(
          current.rules,
          targetIds,
          selector,
          label,
          nextEffects
        );

        const nextDoc: MotionSpecDocument = {
          version: 1,
          rules,
          updatedAt: new Date().toISOString(),
        };

        writeMotionDraft(nextDoc);
        applyPreviewStyles(nextDoc);
        return nextDoc;
      });
    },
    [applyPreviewStyles]
  );

  useEffect(() => {
    if (!enabled) return;
    applyPreviewStyles(draft);
  }, [enabled, draft, applyPreviewStyles]);

  useEffect(() => {
    if (!enabled || !pickMode) return;

    const onMouseMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || target.closest("[data-motion-editor-panel]")) return;

      if (hoveredRef.current && hoveredRef.current !== target) {
        hoveredRef.current.classList.remove(HIGHLIGHT_CLASS);
      }

      hoveredRef.current = target;
      target.classList.add(HIGHLIGHT_CLASS);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || target.closest("[data-motion-editor-panel]")) return;

      event.preventDefault();
      event.stopPropagation();

      const id = ensureMotionTargetId(target);
      const entry: MotionTarget = {
        id,
        selector: selectorForTargetId(id),
        label: labelForElement(target),
      };

      setSelectedTargets((current) => {
        const exists = current.some((item) => item.id === id);
        let next: MotionTarget[];

        if (event.shiftKey) {
          next = exists ? current.filter((item) => item.id !== id) : [...current, entry];
        } else {
          next = exists && current.length === 1 ? [] : [entry];
        }

        next.forEach((item) => {
          const el = document.querySelector(item.selector);
          el?.classList.toggle(SELECTED_CLASS, true);
        });

        document.querySelectorAll(`.${SELECTED_CLASS}`).forEach((el) => {
          const elId = el.getAttribute("data-motion-target");
          if (!next.some((item) => item.id === elId)) {
            el.classList.remove(SELECTED_CLASS);
          }
        });

        updateDraftFromSelection(next, effects);
        return next;
      });
    };

    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.body.style.cursor = "crosshair";

    return () => {
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("click", onClick, true);
      document.body.style.cursor = "";
      hoveredRef.current?.classList.remove(HIGHLIGHT_CLASS);
      hoveredRef.current = null;
    };
  }, [enabled, pickMode, effects, updateDraftFromSelection]);

  const setEffectsAndPreview = useCallback(
    (next: MotionEffectSpec) => {
      setEffects(next);
      if (selectedTargets.length > 0) {
        updateDraftFromSelection(selectedTargets, next);
      }
    },
    [selectedTargets, updateDraftFromSelection]
  );

  const clearSelection = useCallback(() => {
    document.querySelectorAll(`.${SELECTED_CLASS}`).forEach((el) => {
      el.classList.remove(SELECTED_CLASS);
    });
    setSelectedTargets([]);
  }, []);

  const removeTarget = useCallback(
    (id: string) => {
      setSelectedTargets((current) => {
        const next = current.filter((target) => target.id !== id);
        document.querySelector(`[data-motion-target="${id}"]`)?.classList.remove(SELECTED_CLASS);
        updateDraftFromSelection(next, effects);
        return next;
      });
    },
    [effects, updateDraftFromSelection]
  );

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/motion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Publish failed");
      }

      clearMotionDraft();
      toast.success("Motion specs published to live site");
      window.dispatchEvent(new CustomEvent("motion-specs-published"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      enabled,
      pickMode,
      setPickMode,
      selectedTargets,
      clearSelection,
      removeTarget,
      effects,
      setEffects: setEffectsAndPreview,
      draft,
      publish,
      publishing,
    }),
    [
      enabled,
      pickMode,
      selectedTargets,
      clearSelection,
      removeTarget,
      effects,
      setEffectsAndPreview,
      draft,
      publish,
      publishing,
    ]
  );

  if (!enabled) return <>{children}</>;

  return <MotionEditorContext.Provider value={value}>{children}</MotionEditorContext.Provider>;
}

export function useMotionEditor() {
  const ctx = useContext(MotionEditorContext);
  if (!ctx) {
    throw new Error("useMotionEditor must be used within MotionEditorProvider");
  }
  return ctx;
}

export function useOptionalMotionEditor() {
  return useContext(MotionEditorContext);
}
