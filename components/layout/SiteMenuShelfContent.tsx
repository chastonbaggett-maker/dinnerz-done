"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const menuHighlightClass =
  "mt-1 flex w-full flex-col items-center gap-2 rounded-xl bg-card/80 px-3 py-3 text-foreground transition-colors hover:bg-muted/40";

const LINKS = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/orders", label: "Past Orders", icon: ClipboardList, activeClassName: "font-medium text-violet-800 dark:text-violet-200" },
  { href: "/terms", label: "Terms", icon: Scale },
  { href: "/privacy", label: "Privacy", icon: Shield },
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
  const pathname = usePathname();

  return (
    <nav className="px-2 py-2" aria-label="Additional menu">
      <div className="grid grid-cols-4 gap-1">
        {LINKS.map(({ href, label, icon: Icon, ...link }) => {
          const active =
            href === "/orders"
              ? pathname === "/orders" || pathname.startsWith("/order/")
              : pathname.startsWith(href);
          const activeClassName = "activeClassName" in link ? link.activeClassName : undefined;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "mx-0.5 flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-xs transition-colors",
                active
                  ? (activeClassName ?? "font-medium text-primary")
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-center leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>

      {installEligible ? (
        <button type="button" onClick={onInstall} className={menuHighlightClass}>
          <InstallPreviewIcons kind={installKind} />
          <span className="text-sm tracking-wide">{installMenuLabel(installKind)}</span>
        </button>
      ) : null}
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
