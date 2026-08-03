import { getBusinessSettings, getNextAvailableMenu } from "@/lib/db/queries";
import { HomeView } from "@/components/home/HomeView";

export default async function HomePage() {
  const [settings, menuData] = await Promise.all([
    getBusinessSettings(),
    getNextAvailableMenu(),
  ]);

  return (
    <HomeView
      menu={menuData?.menu ?? null}
      timezone={settings.timezone}
      frozenEnabled={settings.frozen_lunch_enabled}
    />
  );
}
