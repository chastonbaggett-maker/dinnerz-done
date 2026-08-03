"use client";

import { useState } from "react";
import { Sparkles, MousePointer2, X, Upload, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMotionEditor } from "@/components/motion/MotionEditorProvider";
import {
  MOTION_ANIMATION_OPTIONS,
  MOTION_EASING_OPTIONS,
  MOTION_PROPERTY_OPTIONS,
} from "@/lib/motion/types";

export function MotionEditorPanel() {
  const {
    pickMode,
    setPickMode,
    selectedTargets,
    clearSelection,
    removeTarget,
    effects,
    setEffects,
    draft,
    publish,
    publishing,
  } = useMotionEditor();

  const [expanded, setExpanded] = useState(true);

  return (
    <div
      data-motion-editor-panel
      className="fixed bottom-[6.5rem] left-4 z-[60] w-[min(22rem,calc(100vw-2rem))]"
    >
      <div className="overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            Motion Editor
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="space-y-4 p-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={pickMode ? "default" : "outline"}
                onClick={() => setPickMode(!pickMode)}
              >
                <MousePointer2 className="size-4" />
                {pickMode ? "Picking…" : "Pick elements"}
              </Button>
              {selectedTargets.length > 0 && (
                <Button type="button" size="sm" variant="outline" onClick={clearSelection}>
                  Clear
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Shift+click to select multiple. Edits preview only until you publish.
            </p>

            {selectedTargets.length > 0 ? (
              <ul className="max-h-24 space-y-1 overflow-y-auto rounded-lg border bg-muted/30 p-2 text-xs">
                {selectedTargets.map((target) => (
                  <li key={target.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{target.label}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeTarget(target.id)}
                      aria-label={`Remove ${target.label}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                No elements selected
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="motion-property">Transition property</Label>
                <Select
                  value={effects.transitionProperty}
                  onValueChange={(value) =>
                    setEffects({ ...effects, transitionProperty: value ?? "all" })
                  }
                >
                  <SelectTrigger id="motion-property" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTION_PROPERTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motion-duration">
                  Transition duration: {effects.transitionDurationMs}ms
                </Label>
                <input
                  id="motion-duration"
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={effects.transitionDurationMs}
                  onChange={(event) =>
                    setEffects({
                      ...effects,
                      transitionDurationMs: Number(event.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motion-easing">Transition easing</Label>
                <Select
                  value={effects.transitionTimingFunction}
                  onValueChange={(value) =>
                    setEffects({ ...effects, transitionTimingFunction: value ?? "ease-out" })
                  }
                >
                  <SelectTrigger id="motion-easing" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTION_EASING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motion-animation">Animation</Label>
                <Select
                  value={effects.animationName}
                  onValueChange={(value) =>
                    setEffects({ ...effects, animationName: value ?? "none" })
                  }
                >
                  <SelectTrigger id="motion-animation" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTION_ANIMATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {effects.animationName !== "none" && (
                <div className="space-y-1.5">
                  <Label htmlFor="motion-animation-duration">
                    Animation duration: {effects.animationDurationMs}ms
                  </Label>
                  <input
                    id="motion-animation-duration"
                    type="range"
                    min={200}
                    max={5000}
                    step={50}
                    value={effects.animationDurationMs}
                    onChange={(event) =>
                      setEffects({
                        ...effects,
                        animationDurationMs: Number(event.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Draft rules: {draft.rules.length} · Updated{" "}
              {new Date(draft.updatedAt).toLocaleTimeString()}
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={draft.rules.length === 0 || publishing}
              onClick={() => void publish()}
            >
              <Upload className="size-4" />
              {publishing ? "Publishing…" : "Publish to live site"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
