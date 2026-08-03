"use client";

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
  getAppLoadRegion,
  MotionEditorAppLoadRegionFields,
  updateAppLoadRegion,
} from "@/components/motion/MotionEditorAppLoadRegionFields";
import { MotionTransitionDetailFields } from "@/components/motion/MotionTransitionDetailFields";
import {
  MOTION_EASING_OPTIONS,
  PAGE_TRANSITION_OPTIONS,
  type AppLoadMode,
  type AppLoadRegionId,
  type AppLoadSpec,
} from "@/lib/motion/types";

const REGION_ORDER: AppLoadRegionId[] = ["header", "main", "bottom-nav"];

export function MotionEditorAppLoadTab({
  selectLayerClass = "z-[70]",
}: {
  selectLayerClass?: string;
}) {
  const { appLoad, setAppLoad } = useMotionEditor();

  function update(patch: Partial<AppLoadSpec>) {
    setAppLoad({ ...appLoad, ...patch });
  }

  function updateSimple(patch: Partial<AppLoadSpec["simple"]>) {
    setAppLoad({
      ...appLoad,
      simple: { ...appLoad.simple, ...patch },
    });
  }

  function updateRegion(id: AppLoadRegionId, patch: Partial<AppLoadSpec["elements"]["regions"][number]>) {
    setAppLoad({
      ...appLoad,
      elements: {
        regions: updateAppLoadRegion(appLoad.elements.regions, id, patch),
      },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Animate the app on first load. Use simple for one overall effect, or configure header, main
        content, and bottom nav independently.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="app-load-mode">Load animation mode</Label>
        <Select
          value={appLoad.mode}
          onValueChange={(value) => update({ mode: (value ?? "none") as AppLoadMode })}
        >
          <SelectTrigger id="app-load-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent positionerClassName={selectLayerClass}>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="simple">Simple — whole page</SelectItem>
            <SelectItem value="elements">Elements — by region</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {appLoad.mode === "simple" ? (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-3">
          <p className="text-xs font-medium text-foreground">Whole page transition</p>

          <div className="space-y-1.5">
            <Label htmlFor="app-load-simple-type">Transition style</Label>
            <Select
              value={appLoad.simple.type}
              onValueChange={(value) =>
                updateSimple({ type: (value ?? "fade") as AppLoadSpec["simple"]["type"] })
              }
            >
              <SelectTrigger id="app-load-simple-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent positionerClassName={selectLayerClass}>
                {PAGE_TRANSITION_OPTIONS.filter((option) => option.value !== "none").map(
                  (option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-load-simple-duration">
              Duration: {appLoad.simple.durationMs}ms
            </Label>
            <input
              id="app-load-simple-duration"
              type="range"
              min={100}
              max={1200}
              step={20}
              value={appLoad.simple.durationMs}
              onChange={(event) => updateSimple({ durationMs: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-load-simple-easing">Easing</Label>
            <Select
              value={appLoad.simple.easing}
              onValueChange={(value) => updateSimple({ easing: value ?? appLoad.simple.easing })}
            >
              <SelectTrigger id="app-load-simple-easing" className="w-full">
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

          <MotionTransitionDetailFields
            idPrefix="app-load-simple"
            spec={appLoad.simple}
            onChange={updateSimple}
          />
        </div>
      ) : null}

      {appLoad.mode === "elements" ? (
        <div className="space-y-3">
          {REGION_ORDER.map((regionId) => {
            const region = getAppLoadRegion(appLoad.elements.regions, regionId);
            if (!region) return null;

            return (
              <div key={regionId} className="rounded-xl border bg-muted/20 p-3">
                <MotionEditorAppLoadRegionFields
                  region={region}
                  onChange={(patch) => updateRegion(regionId, patch)}
                  selectLayerClass={selectLayerClass}
                  showSelector={regionId === "main"}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
