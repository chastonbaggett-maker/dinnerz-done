"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Home, Package, UtensilsCrossed, Snowflake } from "lucide-react";
import {
  SiteMenuShelfContent,
  useSiteMenuInstall,
} from "@/components/layout/SiteMenuShelfContent";
import {
  SiteMenuTransitionFrame,
  useSiteMenuTransitionSpec,
} from "@/components/motion/SiteMenuTransition";
import { siteMenuTransitionDurationMs } from "@/lib/motion/site-menu-transition";
import type { SiteMenuTransitionPhase } from "@/lib/motion/site-menu-transition";
import { useDeliveryInRoute, useOrderWindowOpen } from "@/components/pwa/OrderWindowStatusProvider";
import {
  APP_LOAD_COMPLETE_EVENT,
  NAV_SHELF_APP_OPEN_PEEK,
  recordNavShelfUse,
  shouldPlayNavShelfAppOpenPeek,
  shouldShowNavShelfPulse,
} from "@/lib/pwa/nav-shelf-discovery";
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

const EXTRA_SECTION_HEIGHT_PX = 200;
const TAB_HANDLE_HEIGHT = "2.75rem";
const TAB_LINK_BLOCK_HEIGHT = "3rem";
const TAB_ROW_BOTTOM_PADDING = "0.9984rem";
const TAB_ROW_HEIGHT = `calc(${TAB_HANDLE_HEIGHT} + ${TAB_LINK_BLOCK_HEIGHT} + ${TAB_ROW_BOTTOM_PADDING})`;
export { TAB_ROW_HEIGHT as CUSTOMER_BOTTOM_NAV_HEIGHT };
const OPEN_THRESHOLD = 0.28;
const DRAG_THRESHOLD_PX = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CustomerBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const isSignedInUser = isSignedIn === true;
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
  const [peekAnimating, setPeekAnimating] = useState(false);

  const dragStartY = useRef(0);
  const dragStartProgress = useRef(0);
  const didDragRef = useRef(false);
  const isDraggingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const peekDelayTimerRef = useRef<number | null>(null);
  const peekAnimatingRef = useRef(false);
  const progressRef = useRef(0);
  const isSignedInRef = useRef(isSignedInUser);
  isSignedInRef.current = isSignedInUser;

  const shelfOpen = progress >= 0.98;
  progressRef.current = progress;

  const rememberNavShelfUsed = useCallback(() => {
    recordNavShelfUse(isSignedInUser);
    setShowHandlePulse(shouldShowNavShelfPulse(isSignedInUser));
  }, [isSignedInUser]);

  useEffect(() => {
    setShowHandlePulse(shouldShowNavShelfPulse(isSignedInUser));
  }, [isSignedInUser]);

  const clearPeekAnimation = useCallback(() => {
    if (peekDelayTimerRef.current !== null) {
      window.clearTimeout(peekDelayTimerRef.current);
      peekDelayTimerRef.current = null;
    }
    setPeekAnimating(false);
  }, []);

  useEffect(() => {
    function onAppLoadComplete() {
      if (!shouldPlayNavShelfAppOpenPeek(isSignedInRef.current)) return;
      if (progressRef.current > 0 || peekAnimatingRef.current) return;

      peekDelayTimerRef.current = window.setTimeout(() => {
        peekDelayTimerRef.current = null;
        setMotionActive(false);
        setPeekAnimating(true);
      }, NAV_SHELF_APP_OPEN_PEEK.delayAfterAppLoadMs);
    }

    window.addEventListener(APP_LOAD_COMPLETE_EVENT, onAppLoadComplete);

    return () => {
      window.removeEventListener(APP_LOAD_COMPLETE_EVENT, onAppLoadComplete);
      clearPeekAnimation();
    };
  }, [clearPeekAnimation]);

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

  function onHandlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    clearPeekAnimation();
    dragStartY.current = event.clientY;
    dragStartProgress.current = progress;
    didDragRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
    setMotionActive(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const deltaY = dragStartY.current - event.clientY;
    if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }
    const next = clamp(dragStartProgress.current + deltaY / EXTRA_SECTION_HEIGHT_PX, 0, 1);
    setProgress(next);
  }

  function onHandlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
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
  const shelfExpanded = extraHeight > 0 || peekAnimating;
  peekAnimatingRef.current = peekAnimating;

  const shelfContent = (
    <SiteMenuShelfContent
      installEligible={installEligible}
      installKind={installKind}
      onInstall={() => openInstall(() => closeShelf(undefined, true))}
      onNavigate={() => closeShelf(undefined, true)}
    />
  );

  const renderNavTab = (
    { href, label, icon: Icon, ...link }: (typeof links)[number],
    layoutClassName: string,
    layoutStyle?: CSSProperties
  ) => {
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
        style={layoutStyle}
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
          "pointer-events-auto flex flex-col items-center gap-0.5 rounded-xl text-[0.65rem] leading-tight transition-colors",
          layoutClassName,
          active
            ? (activeClassName ?? "font-medium text-primary")
            : "text-muted-foreground"
        )}
      >
        <span className="relative">
          <Icon className="size-[1.728rem] shrink-0" />
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
  };

  return (
    <nav
      data-app-load-region="bottom-nav"
      data-site-menu-shelf
      className="fixed inset-x-0 bottom-0 z-30 overflow-hidden rounded-t-2xl border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto w-full max-w-lg pb-[env(safe-area-inset-bottom)]">
        <div className="relative" style={{ height: TAB_ROW_HEIGHT }}>
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
            className="absolute inset-x-0 top-0 z-30 flex touch-none cursor-grab flex-col items-center px-4 pt-3 active:cursor-grabbing"
            style={{ height: TAB_HANDLE_HEIGHT }}
          >
            <div
              className={cn(
                "h-1 w-16 shrink-0 rounded-full bg-muted-foreground/35",
                showHandlePulse && "animate-nav-shelf-handle-pulse"
              )}
              aria-hidden
            />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
            style={{ height: TAB_ROW_HEIGHT }}
          >
            {links
              .filter(({ href }) => href === "/" || href === "/orders")
              .map((entry) =>
                renderNavTab(
                  entry,
                  entry.href === "/"
                    ? "absolute inset-y-0 left-0 w-1/4 justify-end"
                    : "absolute inset-y-0 right-0 w-1/4 justify-end",
                  { paddingBottom: `calc(${TAB_ROW_BOTTOM_PADDING} + 0.375rem)` }
                )
              )}
            <div
              className="absolute left-1/4 right-1/4 flex items-end px-1 pb-1.5"
              style={{ height: TAB_LINK_BLOCK_HEIGHT, bottom: TAB_ROW_BOTTOM_PADDING }}
            >
              {links
                .filter(({ href }) => href !== "/" && href !== "/orders")
                .map((entry) => renderNavTab(entry, "mx-0.5 min-w-0 flex-1 self-end"))}
            </div>
          </div>
        </div>

        <div
          aria-hidden={!shelfExpanded}
          className={cn("overflow-hidden", peekAnimating && "animate-nav-shelf-app-open-peek")}
          style={
            peekAnimating
              ? ({
                  "--nav-shelf-peek-height": `${EXTRA_SECTION_HEIGHT_PX}px`,
                } as CSSProperties)
              : {
                  height: extraHeight,
                  transition: isDragging ? "none" : `height ${transitionMs}ms ease-out`,
                }
          }
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget || !peekAnimating) return;
            setPeekAnimating(false);
            setProgress(0);
          }}
        >
          {shelfExpanded ? (
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
