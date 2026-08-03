"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ClipboardList, Menu, Scale, Shield } from "lucide-react";
import { InstallPreviewIcons } from "@/components/pwa/AddToHomeScreenSheet";
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
import {
  canShowAddToHomeScreen,
  detectInstallKind,
  installMenuLabel,
  isStandaloneApp,
  type InstallKind,
} from "@/lib/pwa/browser-chrome";
import { cn } from "@/lib/utils";

const menuLinkClass =
  "rounded-xl px-4 py-3.5 text-base tracking-wide text-foreground transition-colors hover:bg-muted/60";

const menuHighlightClass =
  "mb-2 flex w-full flex-col items-center gap-3 rounded-2xl border bg-card px-4 py-4 text-foreground shadow-sm transition-colors hover:bg-muted/40";

const LINKS = [
  { href: "/orders", label: "Past Orders", icon: ClipboardList },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/terms", label: "Terms and Conditions", icon: Scale },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
] as const;

export function SiteMenuFab() {
  const router = useRouter();
  const menuTransition = useSiteMenuTransitionSpec();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPhase, setMenuPhase] = useState<SiteMenuTransitionPhase>("enter");
  const [previewToken, setPreviewToken] = useState(0);
  const [installEligible, setInstallEligible] = useState(true);
  const [installKind, setInstallKind] = useState<InstallKind>("ios");
  const [standalone, setStandalone] = useState(false);
  const loopIntervalRef = useRef<number | null>(null);
  const previewLoopRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setMenuVisible(true);
    setMenuPhase("enter");
    setPreviewToken((token) => token + 1);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(
    (onComplete?: () => void) => {
      clearCloseTimer();

      if (!menuVisible) {
        onComplete?.();
        return;
      }

      if (menuTransition.exit.type === "none") {
        setMenuVisible(false);
        setMenuPhase("enter");
        onComplete?.();
        return;
      }

      setMenuPhase("exit");
      setPreviewToken((token) => token + 1);

      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setMenuVisible(false);
        setMenuPhase("enter");
        onComplete?.();
      }, siteMenuTransitionDurationMs(menuTransition, "exit"));
    },
    [clearCloseTimer, menuTransition, menuVisible]
  );

  useEffect(() => {
    setInstallEligible(canShowAddToHomeScreen());
    setInstallKind(detectInstallKind());
    setStandalone(isStandaloneApp());
  }, []);

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
      closeMenu(() => {
        window.setTimeout(() => {
          openMenu();
        }, 60);
      });
    }

    function onPlay(event: Event) {
      const detail = (event as CustomEvent<MotionPreviewPlayDetail>).detail;
      if (detail.mode !== "menu-transition") return;

      clearLoop();
      previewLoopRef.current = detail.loop;
      openMenu();

      if (detail.loop) {
        const cycleMs =
          siteMenuTransitionDurationMs(menuTransition, "enter") +
          siteMenuTransitionDurationMs(menuTransition, "exit") +
          260;

        loopIntervalRef.current = window.setInterval(() => {
          replayPreview();
        }, cycleMs);
      }
    }

    function onStop() {
      clearLoop();
      if (previewLoopRef.current) {
        closeMenu();
      }
    }

    window.addEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
    window.addEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);

    return () => {
      clearLoop();
      window.removeEventListener(MOTION_PREVIEW_PLAY_EVENT, onPlay);
      window.removeEventListener(MOTION_PREVIEW_STOP_EVENT, onStop);
    };
  }, [closeMenu, menuTransition, openMenu]);

  function openInstallInstructions() {
    closeMenu();
    if (standalone) return;
    router.push("/?install=1");
  }

  const menuExpanded = menuVisible && menuPhase === "enter";

  return (
    <>
      <button
        type="button"
        aria-label="Open site menu"
        aria-expanded={menuExpanded}
        onClick={openMenu}
        className="fixed right-6 z-40 flex size-[4.5rem] items-center justify-center rounded-full border border-primary/25 bg-background/90 text-foreground shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_50%,transparent),0_4px_14px_rgba(0,0,0,0.12)] backdrop-blur-md transition-[box-shadow,background-color] hover:bg-muted/80 hover:shadow-[0_0_36px_color-mix(in_oklch,var(--primary)_65%,transparent),0_4px_18px_rgba(0,0,0,0.14)]"
        style={{ bottom: "60%", transform: "translateY(50%)" }}
      >
        <Menu className="size-7" />
      </button>

      {menuVisible ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close site menu"
            onClick={() => closeMenu()}
          />
          <SiteMenuTransitionFrame
            frameKey={`site-menu-${menuPhase}-${previewToken}`}
            menuTransition={menuTransition}
            phase={menuPhase}
            className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-lg sm:rounded-2xl"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="site-menu-title"
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="relative flex shrink-0 items-center justify-center px-5 pb-2 pt-3">
                <div className="h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
                <button
                  type="button"
                  onClick={() => closeMenu()}
                  className="absolute right-4 top-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:pb-8">
                <h2
                  id="site-menu-title"
                  className="mb-6 text-center text-2xl font-semibold tracking-tight"
                >
                  Menu
                </h2>

                <nav className="flex flex-col gap-1" aria-label="Site menu">
                  {installEligible ? (
                    <button
                      type="button"
                      onClick={openInstallInstructions}
                      className={menuHighlightClass}
                    >
                      <InstallPreviewIcons kind={installKind} />
                      <span className="text-base tracking-wide">{installMenuLabel(installKind)}</span>
                    </button>
                  ) : null}

                  {LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => closeMenu()}
                      className={cn(menuLinkClass, "flex items-center gap-3")}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </SiteMenuTransitionFrame>
        </div>
      ) : null}
    </>
  );
}
