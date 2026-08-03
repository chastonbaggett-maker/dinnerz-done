import { notFound } from "next/navigation";
import { getBusinessSettings, getUpcomingMenusWithItems } from "@/lib/db/queries";
import { DinnerMenuView } from "@/components/menu/DinnerMenuView";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function MenuDatePage({ params }: PageProps) {
  const { date } = await params;
  const settings = await getBusinessSettings();
  const menusWithItems = await getUpcomingMenusWithItems(settings.timezone);

  if (!menusWithItems.some(({ menu }) => menu.service_date === date)) {
    notFound();
  }

  return (
    <DinnerMenuView
      menusWithItems={menusWithItems}
      timezone={settings.timezone}
      businessName={settings.business_name}
      initialExpandedDate={date}
    />
  );
}
