import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
