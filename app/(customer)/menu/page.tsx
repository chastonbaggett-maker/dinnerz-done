import { getBusinessSettings, getUpcomingMenusWithItems } from "@/lib/db/queries";
import { getPreferredMenuDate } from "@/lib/orders/cutoff";
import { DinnerMenuView } from "@/components/menu/DinnerMenuView";

export default async function MenuPage() {
  const settings = await getBusinessSettings();
  const menusWithItems = await getUpcomingMenusWithItems(settings.timezone);

  if (menusWithItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 pb-36 text-center">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="mt-4 text-muted-foreground">
          No menu is available for ordering right now. Check back soon!
        </p>
      </div>
    );
  }

  const initialDate = getPreferredMenuDate(
    menusWithItems.map(({ menu }) => menu),
    settings.timezone
  );

  return (
    <DinnerMenuView
      menusWithItems={menusWithItems}
      timezone={settings.timezone}
      businessName={settings.business_name}
      initialExpandedDate={initialDate}
    />
  );
}
