import { redirect } from "next/navigation";
import { getBusinessSettings, getFrozenAddons, getNextAvailableMenu } from "@/lib/db/queries";
import { FreezeyLunchesView } from "@/components/menu/FreezeyLunchesView";

export default async function FreezeyLunchesPage() {
  const [settings, menuData, frozenItems] = await Promise.all([
    getBusinessSettings(),
    getNextAvailableMenu(),
    getFrozenAddons(),
  ]);

  if (!settings.frozen_lunch_enabled) {
    redirect("/menu");
  }

  return (
    <FreezeyLunchesView
      menu={menuData?.menu ?? null}
      items={frozenItems}
      timezone={settings.timezone}
    />
  );
}
