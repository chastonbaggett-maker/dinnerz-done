"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMotionEditor } from "@/components/motion/MotionEditorProvider";
import {
  dispatchMotionPreviewPlay,
  MOTION_PREVIEW_STOP_EVENT,
  playElementPreview,
  stopMotionPreviewPlayback,
} from "@/lib/motion/preview-playback";
import { cn } from "@/lib/utils";

type PlaybackMode = "once" | "loop";

export function MotionEditorPlaybackControls({
  activeTab,
  routeTransitionSubTab = "general",
}: {
  activeTab: "elements" | "page-transition" | "app-load";
  routeTransitionSubTab?: "general" | "menu";
}) {
  const { selectedTargets, effects, pageTransition, menuTransition, appLoad } = useMotionEditor();
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("once");
  const [isPlaying, setIsPlaying] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    const onStop = () => {
      playingRef.current = false;
      setIsPlaying(false);
    };

    window.addEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);
    return () => {
      window.removeEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);
      stopMotionPreviewPlayback();
    };
  }, []);

  function handlePlay() {
    if (activeTab === "app-load") {
      if (appLoad.mode === "none") {
        toast.error("Choose an app load mode first.");
        return;
      }

      if (appLoad.mode === "simple" && appLoad.simple.type === "none") {
        toast.error("Choose a whole-page transition style first.");
        return;
      }

      if (appLoad.mode === "elements") {
        const hasEnabledRegion = appLoad.elements.regions.some((region) => region.enabled);
        if (!hasEnabledRegion) {
          toast.error("Enable at least one app load region first.");
          return;
        }
      }

      playingRef.current = playbackMode === "loop";
      setIsPlaying(playbackMode === "loop");
      dispatchMotionPreviewPlay({
        mode: "app-load",
        loop: playbackMode === "loop",
      });
      return;
    }

    if (activeTab === "page-transition") {
      const spec =
        routeTransitionSubTab === "menu" ? menuTransition.enter : pageTransition;
      const previewMode = routeTransitionSubTab === "menu" ? "menu-transition" : "page-transition";

      if (spec.type === "none") {
        toast.error(
          routeTransitionSubTab === "menu"
            ? "Choose a site menu enter transition style first."
            : "Choose a route transition style first."
        );
        return;
      }

      playingRef.current = true;
      setIsPlaying(true);
      dispatchMotionPreviewPlay({
        mode: previewMode,
        loop: playbackMode === "loop",
      });
      return;
    }

    if (selectedTargets.length === 0) {
      toast.error("Pick at least one element to preview.");
      return;
    }

    if (effects.animationName === "none") {
      toast.error("Choose an animation other than None.");
      return;
    }

    const played = playElementPreview(selectedTargets, effects, playbackMode === "loop");
    if (!played) {
      toast.error("Could not find the selected elements on this page.");
      return;
    }

    playingRef.current = playbackMode === "loop";
    setIsPlaying(playbackMode === "loop");
  }

  function handleStop() {
    stopMotionPreviewPlayback();
    playingRef.current = false;
    setIsPlaying(false);
  }

  const previewLabel =
    activeTab === "page-transition"
      ? routeTransitionSubTab === "menu"
        ? "site menu"
        : "route transition"
      : activeTab === "app-load"
        ? "app load"
        : "element animation";

  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Preview {previewLabel}</p>
        <div className="flex rounded-lg border bg-background p-0.5">
          <button
            type="button"
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              playbackMode === "once"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPlaybackMode("once")}
          >
            Once
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              playbackMode === "loop"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPlaybackMode("loop")}
          >
            Loop
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" className="flex-1" onClick={handlePlay}>
          <Play className="size-4" />
          Play
        </Button>
        {isPlaying ? (
          <Button type="button" size="sm" variant="outline" onClick={handleStop}>
            <Square className="size-4" />
            Stop
          </Button>
        ) : null}
      </div>
    </div>
  );
}
