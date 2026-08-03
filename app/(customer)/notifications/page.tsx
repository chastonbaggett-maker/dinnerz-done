import type { Metadata } from "next";
import Link from "next/link";
import { NotificationSettings } from "@/components/pwa/NotificationSettings";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Notifications · Dinnerz Done",
  description: "Manage push notifications and app icon badges for Dinnerz Done.",
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-36">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control push alerts and home-screen badge indicators for the installed app.
        </p>
      </div>

      <NotificationSettings />

      <div className="mt-8">
        <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
