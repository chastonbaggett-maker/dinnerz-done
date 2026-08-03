"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, ClipboardList, Scale, Shield } from "lucide-react";
import { InstallPreviewIcons } from "@/components/pwa/AddToHomeScreenSheet";
import {
  canShowAddToHomeScreen,
  detectInstallKind,
  installMenuLabel,
  isStandaloneApp,
  type InstallKind,
} from "@/lib/pwa/browser-chrome";
import { cn } from "@/lib/utils";

const menuLinkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60";

const menuHighlightClass =
  "mb-1 flex w-full flex-col items-center gap-2 rounded-xl border bg-card px-3 py-3 text-foreground transition-colors hover:bg-muted/40";

const LINKS = [
  { href: "/orders", label: "Past Orders", icon: ClipboardList },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/terms", label: "Terms and Conditions", icon: Scale },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
] as const;

export function SiteMenuShelfContent({
  onNavigate,
  installEligible,
  installKind,
  onInstall,
}: {
  onNavigate?: () => void;
  installEligible: boolean;
  installKind: InstallKind;
  onInstall: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2" aria-label="Additional menu">
      {installEligible ? (
        <button type="button" onClick={onInstall} className={menuHighlightClass}>
          <InstallPreviewIcons kind={installKind} />
          <span className="text-sm tracking-wide">{installMenuLabel(installKind)}</span>
        </button>
      ) : null}

      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(menuLinkClass)}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function useSiteMenuInstall() {
  const router = useRouter();
  const [installEligible, setInstallEligible] = useState(false);
  const [installKind, setInstallKind] = useState<InstallKind>("ios");

  useEffect(() => {
    setInstallEligible(canShowAddToHomeScreen());
    setInstallKind(detectInstallKind());
  }, []);

  function openInstall(onClose?: () => void) {
    onClose?.();
    if (isStandaloneApp()) return;
    router.push("/?install=1");
  }

  return {
    installEligible,
    installKind,
    openInstall,
  };
}
