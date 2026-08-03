"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Home, Package, UtensilsCrossed, Snowflake } from "lucide-react";
import {
  SiteMenuShelfContent,
  useSiteMenuInstall,
} from "@/components/layout/SiteMenuShelfContent";
import {
  SiteMenuTransitionFrame,
  useSiteMenuTransitionSpec,
} from "@/components/motion/SiteMenuTransition";
import {
  MOTION_PREVIEW_PLAY_EVENT,
  MOTION_PREVIEW_STOP_EVENT,
  type MotionPreviewPlayDetail,
} from "@/lib/motion/preview-playback";
import { siteMenuTransitionDurationMs } from "@/lib/motion/site-menu-transition";
import type { SiteMenuTransitionPhase } from "@/lib/motion/site-menu-transition";
import { useDeliveryInRoute, useOrderWindowOpen } from "@/components/pwa/OrderWindowStatusProvider";
import { hasUsedNavShelf, markNavShelfUsed } from "@/lib/pwa/nav-shelf-discovery";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Dinner", icon: UtensilsCrossed },
  { href: "/freezey-lunches", label: "Freezey", icon: Snowflake },
  {
    href: "/orders",
    label: "Track",
    icon: Package,
    activeClassName:
      "font-medium text-violet-800 dark:text-violet-200 bg-violet-100/80 dark:bg-violet-950/60",
  },
] as const;

const EXTRA_SECTION_HEIGHT_PX = 260;
const OPEN_THRESHOLD = 0.28;
const DRAG_THRESHOLD_PX = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CustomerBottomNav() {
  const pathname = usePathname();
  const orderWindowOpen = useOrderWindowOpen();
  const deliveryInRoute = useDeliveryInRoute();
  const menuTransition = useSiteMenuTransitionSpec();
  const { installEligible, installKind, openInstall } = useSiteMenuInstall();

  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [menuPhase, setMenuPhase] = useState<SiteMenuTransitionPhase>("enter");
  const [motionFrameKey, setMotionFrameKey] = useState(0);
  const [motionActive, setMotionActive] = useState(false);
  const [showHandlePulse, setShowHandlePulse] = useState(false);

  const dragStartY = useRef(0);
  const dragStartProgress = useRef(0);
  const didDragRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const loopIntervalRef = useRef<number | null>(null);
  const previewLoopRef = useRef(false);

  const shelfOpen = progress >= 0.98;

  const rememberNavShelfUsed = useCallback(() => {
    markNavShelfUsed();
    setShowHandlePulse(false);
  }, []);

  useEffect(() => {
    setShowHandlePulse(!hasUsedNavShelf());
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const setShelfProgress = useCallback(
    (value: number, options?: { animate?: boolean; phase?: SiteMenuTransitionPhase }) => {
      const next = clamp(value, 0, 1);
      setProgress(next);

      if (options?.phase) {
        setMenuPhase(options.phase);
        setMotionActive(true);
        setMotionFrameKey((token) => token + 1);
      } else if (!options?.animate) {
        setMotionActive(false);
      }
    },
    []
  );

  const openShelf = useCallback(
    (animated = true) => {
      clearCloseTimer();
      rememberNavShelfUsed();
      if (!animated || menuTransition.enter.type === "none") {
        setShelfProgress(1);
        return;
      }
      setShelfProgress(1, { animate: true, phase: "enter" });
    },
    [clearCloseTimer, menuTransition.enter.type, rememberNavShelfUsed, setShelfProgress]
  );

  const closeShelf = useCallback(
    (onComplete?: () => void, animated = true) => {
      clearCloseTimer();

      if (progress <= 0) {
        onComplete?.();
        return;
      }

      if (!animated || menuTransition.exit.type === "none") {
        setShelfProgress(0);
        onComplete?.();
        return;
      }

      setShelfProgress(progress, { animate: true, phase: "exit" });

      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setShelfProgress(0);
        onComplete?.();
      }, siteMenuTransitionDurationMs(menuTransition, "exit"));
    },
    [clearCloseTimer, menuTransition, progress, setShelfProgress]
  );

  const toggleShelf = useCallback(() => {
    if (shelfOpen) {
      closeShelf(undefined, true);
    } else {
      openShelf(true);
    }
  }, [closeShelf, openShelf, shelfOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    function clearLoop() {
      if (loopIntervalRef.current !== null) {
        window.clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
      previewLoopRef.current = false;
    }

    function replayPreview() {
      closeShelf(() => {
        window.setTimeout(() => openShelf(true), 60);
      }, true);
    }

    function onPlay(event: Event) {
      const detail = (event as CustomEvent<MotionPreviewPlayDetail>).detail;
      if (detail.mode !== "menu-transition") return;

      clearLoop();
      previewLoopRef.current = detail.loop;
      openShelf(true);

      if (detail.loop) {
        const cycleMs =
          siteMenuTransitionDurationMs(menuTransition, "enter") +
          siteMenuTransitionDurationMs(menuTransition, "exit") +
          260;

        loopIntervalRef.current = window.setInterval(replayPreview, cycleMs);
      }
    }

    function onStop() {
      clearLoop();
      if (previewLoopRef.current) {
        closeShelf(undefined, true);
      }
    }

    window.addEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
    window.addEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);

    return () => {
      clearLoop();
      window.removeEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
      window.removeEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);
    };
  }, [closeShelf, menuTransition, openShelf]);

  function onHandlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragStartY.current = event.clientY;
    dragStartProgress.current = progress;
    didDragRef.current = false;
    setIsDragging(true);
    setMotionActive(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const deltaY = dragStartY.current - event.clientY;
    if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }
    const next = clamp(dragStartProgress.current + deltaY / EXTRA_SECTION_HEIGHT_PX, 0, 1);
    setProgress(next);
  }

  function onHandlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!didDragRef.current) {
      toggleShelf();
      return;
    }

    const shouldOpen = progress >= OPEN_THRESHOLD;
    if (shouldOpen) {
      openShelf(true);
    } else {
      closeShelf(undefined, progress > 0);
    }
  }

  const extraHeight = Math.round(progress * EXTRA_SECTION_HEIGHT_PX);
  const transitionMs = isDragging
    ? 0
    : menuPhase === "exit"
      ? siteMenuTransitionDurationMs(menuTransition, "exit")
      : siteMenuTransitionDurationMs(menuTransition, "enter");

  const shelfContent = (
    <SiteMenuShelfContent
      installEligible={installEligible}
      installKind={installKind}
      onInstall={() => openInstall(() => closeShelf(undefined, true))}
      onNavigate={() => closeShelf(undefined, true)}
    />
  );

  return (
    <nav
      data-app-load-region="bottom-nav"
      data-site-menu-shelf
      className="fixed inset-x-0 bottom-0 z-30 overflow-hidden rounded-t-2xl border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto w-full max-w-lg pb-[env(safe-area-inset-bottom)]">
        <div
          role="button"
          tabIndex={0}
          aria-label={shelfOpen ? "Pull down to close menu" : "Pull up for more menu options"}
          aria-expanded={shelfOpen}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleShelf();
            }
            if (event.key === "Escape" && shelfOpen) {
              closeShelf(undefined, true);
            }
          }}
          className="flex touch-none cursor-grab flex-col items-center px-4 pt-2.5 pb-1 active:cursor-grabbing"
        >
          <div
            className={cn(
              "h-1 w-16 rounded-full bg-muted-foreground/35",
              showHandlePulse && "animate-nav-shelf-handle-pulse"
            )}
            aria-hidden
          />
        </div>

        <div className="flex h-[5.2rem] items-stretch px-2">
          {links.map(({ href, label, icon: Icon, ...link }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : href === "/orders"
                  ? pathname === "/orders" || pathname.startsWith("/order/")
                  : pathname.startsWith(href);
            const activeClassName = "activeClassName" in link ? link.activeClassName : undefined;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => closeShelf(undefined, false)}
                aria-label={
                  href === "/menu" && orderWindowOpen !== null
                    ? orderWindowOpen
                      ? "Dinner menu — open to order"
                      : "Dinner menu — ordering closed"
                    : href === "/orders" && deliveryInRoute
                      ? "Track order — delivery in route"
                      : undefined
                }
                className={cn(
                  "mx-0.5 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors",
                  active
                    ? (activeClassName ?? "font-medium text-primary")
                    : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {href === "/menu" && orderWindowOpen !== null && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -top-0.5 -right-1 size-2 rounded-full ring-2 ring-background",
                        orderWindowOpen ? "bg-emerald-500" : "bg-red-500"
                      )}
                    />
                  )}
                  {href === "/orders" && deliveryInRoute && (
                    <span
                      aria-hidden
                      className="absolute -top-0.5 -right-1 size-2 rounded-full bg-violet-600 ring-2 ring-background dark:bg-violet-400"
                    />
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </div>

        <div
          aria-hidden={extraHeight === 0}
          className="overflow-hidden border-t border-border/60"
          style={{
            height: extraHeight,
            transition: isDragging ? "none" : `height ${transitionMs}ms ease-out`,
          }}
        >
          {extraHeight > 0 ? (
            <div className="h-full overflow-y-auto overscroll-contain touch-pan-y">
              {motionActive && menuTransition.enter.type !== "none" ? (
                <SiteMenuTransitionFrame
                  frameKey={`site-menu-shelf-${menuPhase}-${motionFrameKey}`}
                  menuTransition={menuTransition}
                  phase={menuPhase}
                >
                  {shelfContent}
                </SiteMenuTransitionFrame>
              ) : (
                shelfContent
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
