import { getBusinessSettings, getUpcomingPublishedMenus } from "@/lib/db/queries";
import { canPlaceOrderToday } from "@/lib/orders/cutoff";

export async function isOrderWindowOpen() {
  const settings = await getBusinessSettings();
  const menus = await getUpcomingPublishedMenus(settings.timezone);
  return menus.some((menu) => canPlaceOrderToday(menu, settings.timezone));
}
