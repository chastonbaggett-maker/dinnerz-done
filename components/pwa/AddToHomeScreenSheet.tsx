"use client";

import { useEffect, type ReactNode } from "react";
import {
  Download,
  Ellipsis,
  FileText,
  MoreHorizontal,
  PlusSquare,
  Share2,
  Smartphone,
} from "lucide-react";
import type { InstallKind } from "@/lib/pwa/browser-chrome";
import { cn } from "@/lib/utils";

type AddToHomeScreenSheetProps = {
  open: boolean;
  onClose: () => void;
  kind: InstallKind;
};

export function AddToHomeScreenSheet({ open, onClose, kind }: AddToHomeScreenSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const title =
    kind === "desktop-safari"
      ? "Add to Dock"
      : kind === "desktop-chromium"
        ? "Install App"
        : "Add to Home Screen";
  const subtitle =
    kind === "desktop-safari"
      ? "Installs the home page — one click away in your Dock."
      : kind === "desktop-chromium"
        ? "Installs the home page — one click away from your desktop or taskbar."
        : "Installs the home page — one tap away on your phone.";

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-homescreen-title"
        className="relative z-10 flex h-[75dvh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-lg sm:h-auto sm:max-h-[min(32rem,85dvh)] sm:rounded-2xl"
      >
        <div className="relative flex shrink-0 items-center justify-center px-5 pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:pb-8">
          <div className="flex flex-col gap-1.5">
            <h2 id="add-homescreen-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <InstallSteps kind={kind} />

          <p className="text-xs leading-relaxed text-muted-foreground">
            This makes Dinnerz Done run like an app on your home screen, with faster access and
            optional badges when the menu opens or your delivery is on the way.
          </p>
        </div>
      </div>
    </div>
  );
}

function InstallSteps({ kind }: { kind: InstallKind }) {
  if (kind === "desktop-safari") {
    return (
      <ol className="flex flex-col gap-3.5">
        <Step n={1} title="Open File" body="In Safari’s menu bar, click File." icon={<FileText className="size-5" />} />
        <Step n={2} title="Choose Share" body="In the File menu, choose Share." icon={<Share2 className="size-5" />} />
        <Step
          n={3}
          title="Add to Dock"
          body="Choose Add to Dock, then confirm."
          icon={<Download className="size-5" />}
        />
      </ol>
    );
  }

  if (kind === "desktop-chromium") {
    return (
      <ol className="flex flex-col gap-3.5">
        <Step
          n={1}
          title="Open the browser menu"
          body="Click the three-dot menu in the top-right of Chrome or Edge."
          icon={<MoreHorizontal className="size-5" />}
        />
        <Step
          n={2}
          title="Cast, save, and share"
          body="Open Cast, save, and share (wording may vary by browser)."
          icon={<Share2 className="size-5" />}
        />
        <Step
          n={3}
          title="Install page as app"
          body="Choose Install page as app / Install app, then confirm."
          icon={<Download className="size-5" />}
        />
      </ol>
    );
  }

  if (kind === "android") {
    return (
      <ol className="flex flex-col gap-3.5">
        <Step
          n={1}
          title="Open the browser menu"
          body="Tap the three-dot menu in Chrome’s top-right corner."
          icon={<MoreHorizontal className="size-5" />}
        />
        <Step
          n={2}
          title="Add to Home screen"
          body="Choose Add to Home screen, then tap Add to confirm."
          icon={<Smartphone className="size-5" />}
        />
      </ol>
    );
  }

  return (
    <ol className="flex flex-col gap-3.5">
      <Step
        n={1}
        title="Tap ···"
        body="In Safari’s bottom bar, tap the three dots on the right."
        icon={<Ellipsis className="size-5" />}
      />
      <Step n={2} title="Tap Share" body="Choose Share from the menu." icon={<Share2 className="size-5" />} />
      <Step n={3} title="Tap View More" body="Choose View More." icon={<MoreHorizontal className="size-5" />} />
      <Step
        n={4}
        title="Add to Home Screen"
        body="Find Add to Home Screen, then tap Add to confirm."
        icon={<PlusSquare className="size-5" />}
      />
    </ol>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: number;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3.5 text-left">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-foreground"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm tracking-wide text-foreground">
          <span className="text-muted-foreground">{n}. </span>
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

export function InstallPreviewIcons({ kind }: { kind: InstallKind }) {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
        <Share2 className="size-4" />
      </span>
      <span className="text-muted-foreground">→</span>
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl border bg-primary/10 text-primary",
          kind === "desktop-safari" && "rounded-[0.65rem]"
        )}
      >
        <Download className="size-4" />
      </span>
    </div>
  );
}
