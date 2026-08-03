import { notFound } from "next/navigation";
import { getBusinessSettings, getPublishedMenuForDate, getUpcomingPublishedMenus } from "@/lib/db/queries";
import { DinnerMenuView } from "@/components/menu/DinnerMenuView";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function MenuDatePage({ params }: PageProps) {
  const { date } = await params;
  const [settings, menuData, upcomingMenus] = await Promise.all([
    getBusinessSettings(),
    getPublishedMenuForDate(date),
    getUpcomingPublishedMenus(),
  ]);

  if (!menuData) notFound();

  return (
    <DinnerMenuView
      menu={menuData.menu}
      items={menuData.items}
      upcomingMenus={upcomingMenus}
      timezone={settings.timezone}
      businessName={settings.business_name}
    />
  );
}
