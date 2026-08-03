import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav";
import { HeaderPageIcon } from "@/components/layout/HeaderPageIcon";
import { PageTransitionHost } from "@/components/motion/PageTransitionHost";
import { InstallHomeHost } from "@/components/pwa/InstallHomeHost";
import { OrderWindowStatusProvider } from "@/components/pwa/OrderWindowStatusProvider";
import { readPublishedMotionSpecs } from "@/lib/motion/published-store";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const motion = await readPublishedMotionSpecs();

  return (
    <OrderWindowStatusProvider>
      <header
        data-app-load-region="header"
        className="sticky top-0 z-30 overflow-hidden rounded-b-2xl border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="mx-auto flex h-[4.55rem] max-w-lg items-center justify-between px-5">
          <Link href="/" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-transparent.png"
              alt="Dinnerz Done"
              width={612}
              height={339}
              className="h-11 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <HeaderPageIcon />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <PageTransitionHost initialPageTransition={motion.pageTransition}>
          {children}
        </PageTransitionHost>
      </main>
      <CustomerBottomNav />
      <InstallHomeHost />
    </OrderWindowStatusProvider>
  );
}
