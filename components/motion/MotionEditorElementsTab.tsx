"use client";

import { X, MousePointer2 } from "lucide-react";
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
  isEnterMotionAnimation,
  isSlideMotionAnimation,
  motionEffectForAnimationChange,
} from "@/lib/motion/effects";
import {
  MOTION_ANIMATION_OPTIONS,
  MOTION_EASING_OPTIONS,
  MOTION_PROPERTY_OPTIONS,
  type MotionEffectSpec,
} from "@/lib/motion/types";

const TRANSITION_PROPERTY_HINTS: Record<string, string> = {
  all: "Animates every property that changes (color, size, opacity, transform, etc.).",
  opacity: "Animates opacity changes — useful for fades on hover, open/close, or toggles.",
  transform: "Animates movement, scale, and rotation when transform changes.",
  colors: "Animates color and background-color changes.",
  "box-shadow": "Animates shadow changes — good for lift or glow on hover.",
};

export function MotionEditorElementsTab({
  pickMode,
  setPickMode,
  selectLayerClass = "z-[70]",
}: {
  pickMode: boolean;
  setPickMode: (value: boolean) => void;
  selectLayerClass?: string;
}) {
  const {
    selectedTargets,
    clearSelection,
    removeTarget,
    effects,
    setEffects,
  } = useMotionEditor();

  function update(patch: Partial<MotionEffectSpec>) {
    setEffects({ ...effects, ...patch });
  }

  return (
    <div className="space-y-4">
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

      <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
        <p className="text-xs font-medium text-foreground">CSS transition</p>

        <div className="space-y-1.5">
          <Label htmlFor="motion-property">Transition property</Label>
          <Select
            value={effects.transitionProperty}
            onValueChange={(value) =>
              update({ transitionProperty: value ?? "all" })
            }
          >
            <SelectTrigger id="motion-property" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent positionerClassName={selectLayerClass}>
              {MOTION_PROPERTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TRANSITION_PROPERTY_HINTS[effects.transitionProperty] ??
              "Animates when this property changes between states."}
          </p>
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
              update({ transitionDurationMs: Number(event.target.value) })
            }
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motion-transition-delay">
            Transition delay: {effects.transitionDelayMs}ms
          </Label>
          <input
            id="motion-transition-delay"
            type="range"
            min={0}
            max={2000}
            step={50}
            value={effects.transitionDelayMs}
            onChange={(event) =>
              update({ transitionDelayMs: Number(event.target.value) })
            }
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motion-easing">Transition easing</Label>
          <Select
            value={effects.transitionTimingFunction}
            onValueChange={(value) =>
              update({ transitionTimingFunction: value ?? "ease-out" })
            }
          >
            <SelectTrigger id="motion-easing" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent positionerClassName={selectLayerClass}>
              {MOTION_EASING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
        <p className="text-xs font-medium text-foreground">Animation</p>

        <div className="space-y-1.5">
          <Label htmlFor="motion-animation">Animation style</Label>
          <Select
            value={effects.animationName}
            onValueChange={(value) =>
              setEffects(motionEffectForAnimationChange(effects, value ?? "none"))
            }
          >
            <SelectTrigger id="motion-animation" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent positionerClassName={selectLayerClass}>
              {MOTION_ANIMATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {effects.animationName !== "none" ? (
          <>
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
                  update({ animationDurationMs: Number(event.target.value) })
                }
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motion-animation-easing">Animation easing</Label>
              <Select
                value={effects.animationTimingFunction}
                onValueChange={(value) =>
                  update({ animationTimingFunction: value ?? "ease-in-out" })
                }
              >
                <SelectTrigger id="motion-animation-easing" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent positionerClassName={selectLayerClass}>
                  {MOTION_EASING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motion-animation-delay">
                Animation delay: {effects.animationDelayMs}ms
              </Label>
              <input
                id="motion-animation-delay"
                type="range"
                min={0}
                max={2000}
                step={50}
                value={effects.animationDelayMs}
                onChange={(event) =>
                  update({ animationDelayMs: Number(event.target.value) })
                }
                className="w-full accent-primary"
              />
            </div>

            {!isEnterMotionAnimation(effects.animationName) ? (
              <div className="space-y-1.5">
                <Label htmlFor="motion-animation-iteration">Loop</Label>
                <Select
                  value={effects.animationIterationCount}
                  onValueChange={(value) =>
                    update({ animationIterationCount: value ?? "infinite" })
                  }
                >
                  <SelectTrigger id="motion-animation-iteration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent positionerClassName={selectLayerClass}>
                    <SelectItem value="1">Once</SelectItem>
                    <SelectItem value="infinite">Infinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-4 border-t pt-3">
              <p className="text-xs font-medium text-foreground">Animation details</p>

              {effects.animationName === "motion-fade-in" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="motion-opacity-from">
                    Opacity start: {effects.opacityFrom}%
                  </Label>
                  <input
                    id="motion-opacity-from"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={effects.opacityFrom}
                    onChange={(event) =>
                      update({ opacityFrom: Number(event.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              ) : null}

              {isSlideMotionAnimation(effects.animationName) ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="motion-offset">
                      Slide offset: {effects.offsetPx}px
                    </Label>
                    <input
                      id="motion-offset"
                      type="range"
                      min={0}
                      max={120}
                      step={2}
                      value={effects.offsetPx}
                      onChange={(event) =>
                        update({ offsetPx: Number(event.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="motion-slide-opacity-from">
                      Opacity start: {effects.opacityFrom}%
                    </Label>
                    <input
                      id="motion-slide-opacity-from"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={effects.opacityFrom}
                      onChange={(event) =>
                        update({ opacityFrom: Number(event.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                </>
              ) : null}

              {effects.animationName === "motion-scale-in" ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="motion-scale-from">
                      Scale start: {effects.scaleFrom}%
                    </Label>
                    <input
                      id="motion-scale-from"
                      type="range"
                      min={50}
                      max={100}
                      step={1}
                      value={effects.scaleFrom}
                      onChange={(event) =>
                        update({ scaleFrom: Number(event.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="motion-scale-opacity-from">
                      Opacity start: {effects.opacityFrom}%
                    </Label>
                    <input
                      id="motion-scale-opacity-from"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={effects.opacityFrom}
                      onChange={(event) =>
                        update({ opacityFrom: Number(event.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
