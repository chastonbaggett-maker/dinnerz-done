"use client";

import { Label } from "@/components/ui/label";
import { isSlidePageTransition, type PageTransitionSpec } from "@/lib/motion/types";

export function MotionTransitionDetailFields({
  spec,
  onChange,
  idPrefix,
}: {
  spec: PageTransitionSpec;
  onChange: (patch: Partial<PageTransitionSpec>) => void;
  idPrefix: string;
}) {
  if (spec.type === "none") return null;

  return (
    <div className="space-y-4">
      {spec.type === "fade" ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-opacity-from`}>
            Opacity start: {spec.opacityFrom}%
          </Label>
          <input
            id={`${idPrefix}-opacity-from`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={spec.opacityFrom}
            onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      ) : null}

      {isSlidePageTransition(spec.type) ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-offset`}>Slide offset: {spec.offsetPx}px</Label>
            <input
              id={`${idPrefix}-offset`}
              type="range"
              min={0}
              max={120}
              step={2}
              value={spec.offsetPx}
              onChange={(event) => onChange({ offsetPx: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-slide-opacity-from`}>
              Opacity start: {spec.opacityFrom}%
            </Label>
            <input
              id={`${idPrefix}-slide-opacity-from`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={spec.opacityFrom}
              onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </>
      ) : null}

      {spec.type === "scale" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-scale-from`}>Scale start: {spec.scaleFrom}%</Label>
            <input
              id={`${idPrefix}-scale-from`}
              type="range"
              min={50}
              max={100}
              step={1}
              value={spec.scaleFrom}
              onChange={(event) => onChange({ scaleFrom: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-scale-opacity-from`}>
              Opacity start: {spec.opacityFrom}%
            </Label>
            <input
              id={`${idPrefix}-scale-opacity-from`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={spec.opacityFrom}
              onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
