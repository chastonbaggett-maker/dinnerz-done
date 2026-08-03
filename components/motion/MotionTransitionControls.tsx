"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MotionTransitionDetailFields } from "@/components/motion/MotionTransitionDetailFields";
import {
  MOTION_EASING_OPTIONS,
  PAGE_TRANSITION_OPTIONS,
  type PageTransitionSpec,
} from "@/lib/motion/types";

export function MotionTransitionControls({
  spec,
  onChange,
  idPrefix,
  selectLayerClass = "z-[70]",
}: {
  spec: PageTransitionSpec;
  onChange: (patch: Partial<PageTransitionSpec>) => void;
  idPrefix: string;
  selectLayerClass?: string;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-type`}>Transition style</Label>
        <Select
          value={spec.type}
          onValueChange={(value) =>
            onChange({ type: (value ?? "fade") as PageTransitionSpec["type"] })
          }
        >
          <SelectTrigger id={`${idPrefix}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent positionerClassName={selectLayerClass}>
            {PAGE_TRANSITION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-duration`}>Duration: {spec.durationMs}ms</Label>
        <input
          id={`${idPrefix}-duration`}
          type="range"
          min={0}
          max={1200}
          step={20}
          value={spec.durationMs}
          onChange={(event) => onChange({ durationMs: Number(event.target.value) })}
          className="w-full accent-primary"
          disabled={spec.type === "none"}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-easing`}>Easing</Label>
        <Select
          value={spec.easing}
          onValueChange={(value) => onChange({ easing: value ?? spec.easing })}
          disabled={spec.type === "none"}
        >
          <SelectTrigger id={`${idPrefix}-easing`} className="w-full">
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

      {spec.type !== "none" ? (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-3">
          <p className="text-xs font-medium text-foreground">Transition details</p>
          <MotionTransitionDetailFields idPrefix={idPrefix} spec={spec} onChange={onChange} />
        </div>
      ) : null}
    </>
  );
}
