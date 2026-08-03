"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMotionEditor } from "@/components/motion/MotionEditorProvider";
import { MotionTransitionControls } from "@/components/motion/MotionTransitionControls";

export type RouteTransitionSubTab = "general" | "menu";

export function MotionEditorPageTransitionTab({
  selectLayerClass = "z-[70]",
  activeSubTab,
  onSubTabChange,
}: {
  selectLayerClass?: string;
  activeSubTab?: RouteTransitionSubTab;
  onSubTabChange?: (tab: RouteTransitionSubTab) => void;
}) {
  const { pageTransition, setPageTransition, menuTransition, setMenuTransition } = useMotionEditor();
  const [internalSubTab, setInternalSubTab] = useState<RouteTransitionSubTab>("general");
  const subTab = activeSubTab ?? internalSubTab;

  function setSubTab(tab: RouteTransitionSubTab) {
    setInternalSubTab(tab);
    onSubTabChange?.(tab);
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={subTab}
        onValueChange={(value) =>
          setSubTab(value === "menu" ? "menu" : "general")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="menu">Site menu</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Default transition for most routes. Tap a bottom nav item or link to preview.
          </p>
          <MotionTransitionControls
            idPrefix="page-transition"
            spec={pageTransition}
            onChange={(patch) => setPageTransition({ ...pageTransition, ...patch })}
            selectLayerClass={selectLayerClass}
          />
        </TabsContent>

        <TabsContent value="menu" className="mt-4 space-y-6">
          <p className="text-xs text-muted-foreground">
            Animates the hamburger site menu sheet when it opens and closes. Tap the floating menu
            button on the right, or use Play below to preview.
          </p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Enter animation</h3>
            <MotionTransitionControls
              idPrefix="menu-transition-enter"
              spec={menuTransition.enter}
              onChange={(patch) =>
                setMenuTransition({
                  ...menuTransition,
                  enter: { ...menuTransition.enter, ...patch },
                })
              }
              selectLayerClass={selectLayerClass}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Exit animation</h3>
            <MotionTransitionControls
              idPrefix="menu-transition-exit"
              spec={menuTransition.exit}
              onChange={(patch) =>
                setMenuTransition({
                  ...menuTransition,
                  exit: { ...menuTransition.exit, ...patch },
                })
              }
              selectLayerClass={selectLayerClass}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
