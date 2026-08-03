import { getBusinessSettings, getNextAvailableMenu, getUpcomingPublishedMenus } from "@/lib/db/queries";
import { DinnerMenuView } from "@/components/menu/DinnerMenuView";

export default async function MenuPage() {
  const [settings, menuData, upcomingMenus] = await Promise.all([
    getBusinessSettings(),
    getNextAvailableMenu(),
    getUpcomingPublishedMenus(),
  ]);

  if (!menuData) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 pb-36 text-center">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="mt-4 text-muted-foreground">
          No menu is available for ordering right now. Check back soon!
        </p>
      </div>
    );
  }

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
