import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav";
import { HeaderPageIcon } from "@/components/layout/HeaderPageIcon";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[4.55rem] max-w-lg items-center justify-between px-5">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Dinnerz Done
          </Link>
          <div className="flex items-center gap-4">
            <HeaderPageIcon />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <CustomerBottomNav />
    </>
  );
}
