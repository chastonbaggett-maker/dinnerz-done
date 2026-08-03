"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Sparkles,
  X,
  Upload,
  ChevronUp,
  ChevronDown,
  Pin,
  PinOff,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { useMotionEditor } from "@/components/motion/MotionEditorProvider";
import { MotionEditorAppLoadTab } from "@/components/motion/MotionEditorAppLoadTab";
import { MotionEditorElementsTab } from "@/components/motion/MotionEditorElementsTab";
import { MotionEditorPageTransitionTab, type RouteTransitionSubTab } from "@/components/motion/MotionEditorPageTransitionTab";
import { MotionEditorPlaybackControls } from "@/components/motion/MotionEditorPlaybackControls";
import { cn } from "@/lib/utils";

const DEFAULT_LEFT_PX = 16;
const VIEWPORT_MARGIN_PX = 8;

function clampPanelPosition(x: number, y: number, width: number, height: number) {
  const maxX = Math.max(VIEWPORT_MARGIN_PX, window.innerWidth - width - VIEWPORT_MARGIN_PX);
  const maxY = Math.max(VIEWPORT_MARGIN_PX, window.innerHeight - height - VIEWPORT_MARGIN_PX);
  return {
    x: Math.min(Math.max(x, VIEWPORT_MARGIN_PX), maxX),
    y: Math.min(Math.max(y, VIEWPORT_MARGIN_PX), maxY),
  };
}

export function MotionEditorPanel() {
  const {
    enabled,
    panelOpen,
    closePanel,
    pickMode,
    setPickMode,
    draft,
    publish,
    publishing,
  } = useMotionEditor();

  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "elements" | "page-transition" | "app-load"
  >("elements");
  const [routeTransitionSubTab, setRouteTransitionSubTab] =
    useState<RouteTransitionSubTab>("general");
  const [pinnedToTop, setPinnedToTop] = useState(false);
  const [dragLocked, setDragLocked] = useState(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const selectLayerClass = pinnedToTop ? "z-[1000]" : "z-[70]";
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function getPanelOrigin() {
    const panel = panelRef.current;
    if (!panel) return { x: DEFAULT_LEFT_PX, y: 0 };

    if (position) return position;

    const rect = panel.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  function handleHeaderPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragLocked) return;

    const origin = getPanelOrigin();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleHeaderPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    const panel = panelRef.current;
    if (dragLocked || !dragState || dragState.pointerId !== event.pointerId || !panel) return;

    const rect = panel.getBoundingClientRect();
    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);
    setPosition(clampPanelPosition(nextX, nextY, rect.width, rect.height));
  }

  function handleHeaderPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  if (!enabled || !panelOpen) return null;

  return (
    <div
      ref={panelRef}
      data-motion-editor-panel
      className={cn(
        "fixed flex w-[min(22rem,calc(100vw-2rem))] flex-col",
        !position && "bottom-[6.5rem] left-4 max-h-[calc(100dvh-7rem)]",
        position && "max-h-[calc(100dvh-1rem)]",
        pinnedToTop ? "z-[999]" : "z-[60]"
      )}
      style={
        position
          ? {
              top: position.y,
              left: position.x,
              bottom: "auto",
            }
          : undefined
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2",
            !dragLocked && "cursor-grab touch-none active:cursor-grabbing"
          )}
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={handleHeaderPointerUp}
          onPointerCancel={handleHeaderPointerUp}
        >
          <div className="flex items-center gap-2 text-sm font-semibold select-none">
            <Sparkles className="size-4 text-primary" />
            Motion Editor
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant={dragLocked ? "ghost" : "secondary"}
              onClick={() => setDragLocked((value) => !value)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label={dragLocked ? "Unlock panel to drag" : "Lock panel position"}
              aria-pressed={!dragLocked}
            >
              {dragLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={pinnedToTop ? "secondary" : "ghost"}
              onClick={() => setPinnedToTop((value) => !value)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label={pinnedToTop ? "Unpin panel from top layer" : "Pin panel on top"}
              aria-pressed={pinnedToTop}
            >
              {pinnedToTop ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setExpanded((value) => !value)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={closePanel}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Close motion editor"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain p-3">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                const tab =
                  value === "page-transition"
                    ? "page-transition"
                    : value === "app-load"
                      ? "app-load"
                      : "elements";
                setActiveTab(tab);
                if (tab !== "elements") {
                  setPickMode(false);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="page-transition">Route</TabsTrigger>
                <TabsTrigger value="app-load">App load</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="mt-4 space-y-4">
                <MotionEditorElementsTab
                  pickMode={pickMode}
                  setPickMode={setPickMode}
                  selectLayerClass={selectLayerClass}
                />
              </TabsContent>

              <TabsContent value="page-transition" className="mt-4">
                <MotionEditorPageTransitionTab
                  selectLayerClass={selectLayerClass}
                  activeSubTab={routeTransitionSubTab}
                  onSubTabChange={setRouteTransitionSubTab}
                />
              </TabsContent>

              <TabsContent value="app-load" className="mt-4">
                <MotionEditorAppLoadTab selectLayerClass={selectLayerClass} />
              </TabsContent>
            </Tabs>

            <MotionEditorPlaybackControls
              activeTab={activeTab}
              routeTransitionSubTab={routeTransitionSubTab}
            />

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Draft rules: {draft.rules.length} · Updated{" "}
              {new Date(draft.updatedAt).toLocaleTimeString()}
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={publishing}
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
