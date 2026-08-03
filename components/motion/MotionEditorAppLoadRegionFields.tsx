"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countAppLoadTargets } from "@/lib/motion/app-load";
import { isSlideMotionAnimation } from "@/lib/motion/effects";
import {
  APP_LOAD_ANIMATION_OPTIONS,
  APP_LOAD_REGION_LABELS,
  APP_LOAD_SELECTOR_PRESETS,
  type AppLoadRegionId,
  type AppLoadRegionSpec,
} from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export function MotionEditorAppLoadRegionFields({
  region,
  onChange,
  selectLayerClass = "z-[70]",
  showSelector = false,
}: {
  region: AppLoadRegionSpec;
  onChange: (patch: Partial<AppLoadRegionSpec>) => void;
  selectLayerClass?: string;
  showSelector?: boolean;
}) {
  const [matchCount, setMatchCount] = useState(0);
  const idPrefix = `app-load-${region.id}`;

  useEffect(() => {
    setMatchCount(countAppLoadTargets(region));
  }, [region]);

  return (
    <div className={cn("space-y-3", !region.enabled && "opacity-60")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">{APP_LOAD_REGION_LABELS[region.id]}</p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={region.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
            className="accent-primary"
          />
          Enabled
        </label>
      </div>

      {showSelector ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-selector-preset`}>Element scope</Label>
            <Select
              value={
                APP_LOAD_SELECTOR_PRESETS.some((preset) => preset.value === region.selector)
                  ? region.selector
                  : "custom"
              }
              onValueChange={(value) => {
                if (value && value !== "custom") {
                  onChange({ selector: value });
                }
              }}
              disabled={!region.enabled}
            >
              <SelectTrigger id={`${idPrefix}-selector-preset`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent positionerClassName={selectLayerClass}>
                {APP_LOAD_SELECTOR_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom selector</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-selector`}>CSS selector</Label>
            <input
              id={`${idPrefix}-selector`}
              type="text"
              value={region.selector}
              onChange={(event) => onChange({ selector: event.target.value })}
              disabled={!region.enabled}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
            />
          </div>
        </>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Matches {matchCount} element{matchCount === 1 ? "" : "s"} on this page.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-animation`}>Animation style</Label>
        <Select
          value={region.animationName}
          onValueChange={(value) => onChange({ animationName: value ?? region.animationName })}
          disabled={!region.enabled}
        >
          <SelectTrigger id={`${idPrefix}-animation`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent positionerClassName={selectLayerClass}>
            {APP_LOAD_ANIMATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-duration`}>Duration: {region.durationMs}ms</Label>
        <input
          id={`${idPrefix}-duration`}
          type="range"
          min={100}
          max={2000}
          step={20}
          value={region.durationMs}
          onChange={(event) => onChange({ durationMs: Number(event.target.value) })}
          disabled={!region.enabled}
          className="w-full accent-primary"
        />
      </div>

      {region.id === "main" ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-stagger`}>Stagger: {region.staggerMs}ms</Label>
          <input
            id={`${idPrefix}-stagger`}
            type="range"
            min={0}
            max={300}
            step={10}
            value={region.staggerMs}
            onChange={(event) => onChange({ staggerMs: Number(event.target.value) })}
            disabled={!region.enabled}
            className="w-full accent-primary"
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-delay`}>Start delay: {region.baseDelayMs}ms</Label>
        <input
          id={`${idPrefix}-delay`}
          type="range"
          min={0}
          max={1500}
          step={20}
          value={region.baseDelayMs}
          onChange={(event) => onChange({ baseDelayMs: Number(event.target.value) })}
          disabled={!region.enabled}
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-easing`}>Easing</Label>
        <Select
          value={region.easing}
          onValueChange={(value) => onChange({ easing: value ?? region.easing })}
          disabled={!region.enabled}
        >
          <SelectTrigger id={`${idPrefix}-easing`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent positionerClassName={selectLayerClass}>
            <SelectItem value="ease">Ease</SelectItem>
            <SelectItem value="ease-in">Ease in</SelectItem>
            <SelectItem value="ease-out">Ease out</SelectItem>
            <SelectItem value="ease-in-out">Ease in-out</SelectItem>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="cubic-bezier(0.33, 1, 0.68, 1)">Smooth snap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {region.animationName === "motion-fade-in" ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-opacity-from`}>Opacity start: {region.opacityFrom}%</Label>
          <input
            id={`${idPrefix}-opacity-from`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={region.opacityFrom}
            onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
            disabled={!region.enabled}
            className="w-full accent-primary"
          />
        </div>
      ) : null}

      {isSlideMotionAnimation(region.animationName) ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-offset`}>Slide offset: {region.offsetPx}px</Label>
            <input
              id={`${idPrefix}-offset`}
              type="range"
              min={0}
              max={120}
              step={2}
              value={region.offsetPx}
              onChange={(event) => onChange({ offsetPx: Number(event.target.value) })}
              disabled={!region.enabled}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-slide-opacity-from`}>
              Opacity start: {region.opacityFrom}%
            </Label>
            <input
              id={`${idPrefix}-slide-opacity-from`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={region.opacityFrom}
              onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
              disabled={!region.enabled}
              className="w-full accent-primary"
            />
          </div>
        </>
      ) : null}

      {region.animationName === "motion-scale-in" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-scale-from`}>Scale start: {region.scaleFrom}%</Label>
            <input
              id={`${idPrefix}-scale-from`}
              type="range"
              min={50}
              max={100}
              step={1}
              value={region.scaleFrom}
              onChange={(event) => onChange({ scaleFrom: Number(event.target.value) })}
              disabled={!region.enabled}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-scale-opacity-from`}>
              Opacity start: {region.opacityFrom}%
            </Label>
            <input
              id={`${idPrefix}-scale-opacity-from`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={region.opacityFrom}
              onChange={(event) => onChange({ opacityFrom: Number(event.target.value) })}
              disabled={!region.enabled}
              className="w-full accent-primary"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function getAppLoadRegion(
  regions: AppLoadRegionSpec[],
  id: AppLoadRegionId
): AppLoadRegionSpec | undefined {
  return regions.find((region) => region.id === id);
}

export function updateAppLoadRegion(
  regions: AppLoadRegionSpec[],
  id: AppLoadRegionId,
  patch: Partial<AppLoadRegionSpec>
) {
  return regions.map((region) => (region.id === id ? { ...region, ...patch } : region));
}
