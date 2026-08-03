"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AddToHomeScreenSheet } from "@/components/pwa/AddToHomeScreenSheet";
import {
  canShowAddToHomeScreen,
  detectInstallKind,
  type InstallKind,
} from "@/lib/pwa/browser-chrome";

function InstallHomeHostInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<InstallKind>("ios");

  useEffect(() => {
    setKind(detectInstallKind());
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    if (searchParams.get("install") !== "1") return;
    if (!canShowAddToHomeScreen()) {
      router.replace("/");
      return;
    }
    setKind(detectInstallKind());
    setOpen(true);
    window.history.replaceState(null, "", "/");
  }, [pathname, searchParams, router]);

  if (!open) return null;

  return <AddToHomeScreenSheet open={open} onClose={() => setOpen(false)} kind={kind} />;
}

export function InstallHomeHost() {
  return (
    <Suspense fallback={null}>
      <InstallHomeHostInner />
    </Suspense>
  );
}
