import { notFound } from "next/navigation";
import { getDailyMenuByDate, getMenuItems } from "@/lib/db/queries";
import { DailyMenuBuilder } from "@/components/admin/DailyMenuBuilder";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function AdminMenuDatePage({ params }: PageProps) {
  const { date } = await params;
  const [menuData, libraryItems] = await Promise.all([
    getDailyMenuByDate(date),
    getMenuItems(true),
  ]);

  if (!menuData) notFound();

  return (
    <DailyMenuBuilder
      serviceDate={date}
      dailyMenuId={menuData.menu.id}
      items={menuData.items}
      libraryItems={libraryItems}
      status={menuData.menu.status}
    />
  );
}
