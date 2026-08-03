import { eq, and, desc, asc, gte, sql, inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import {
  businessSettings,
  menuItems,
  customizationGroups,
  customizationOptions,
  dailyMenus,
  dailyMenuItems,
  dailyCustomizationGroups,
  dailyCustomizationOptions,
  deliveryTimeSlots,
  orders,
  orderLines,
  orderLineCustomizations,
  orderNumberCounters,
  newId,
} from "@/lib/db/schema";
import { getDefaultCutoff, getTomorrowDateString, getWeekdayMenuDates, DEFAULT_TIMEZONE } from "@/lib/dates";
import type {
  BusinessSettings,
  CartLine,
  CheckoutPayload,
  CustomizationGroup,
  CustomizationOption,
  DailyCustomizationGroup,
  DailyCustomizationOption,
  DailyMenu,
  DailyMenuItem,
  DeliveryTimeSlot,
  MenuItem,
  Order,
  OrderLine,
  OrderLineCustomization,
} from "@/lib/types";
import { calculateCartSubtotal, calculateLineTotal, calculateOrderTotal } from "@/lib/orders/pricing";

const isSupabaseConfigured = isDatabaseConfigured;

const DEMO_SETTINGS: BusinessSettings = {
  id: "demo-settings",
  business_name: "Dinnerz Done",
  timezone: "America/Chicago",
  default_cutoff_hour: 20,
  default_cutoff_minute: 0,
  delivery_fee_cents: 300,
  min_order_cents: 1500,
  pickup_address: "123 Main St, Your Town",
  delivery_enabled: true,
  pickup_enabled: false,
  driver_delivery_fee_cents: 300,
  premium_delivery_fee_cents: 500,
  frozen_lunch_enabled: true,
  slot_duration_minutes: 120,
  default_slot_start_hour: 16,
  default_slot_end_hour: 20,
};

import { MENU_ITEM_IMAGES } from "@/lib/menu-images";

const DEMO_FROZEN_ITEMS: MenuItem[] = [
  {
    id: "f1000000-0000-4000-8000-000000000001",
    name: "Freezey Chili Lunch",
    description: "Hearty beef chili in a freezer-ready container. Heat and eat for an easy lunch.",
    base_price_cents: 799,
    image_url: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000001"],
    active: true,
    sort_order: 101,
    item_type: "frozen_addon",
  },
  {
    id: "f1000000-0000-4000-8000-000000000002",
    name: "Freezey Chicken Soup",
    description: "Homemade chicken vegetable soup — perfect for the freezer.",
    base_price_cents: 799,
    image_url: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000002"],
    active: true,
    sort_order: 102,
    item_type: "frozen_addon",
  },
  {
    id: "f1000000-0000-4000-8000-000000000003",
    name: "Freezey Pasta Bake",
    description: "Baked ziti with marinara and cheese. Freeze and reheat anytime.",
    base_price_cents: 799,
    image_url: MENU_ITEM_IMAGES["f1000000-0000-4000-8000-000000000003"],
    active: true,
    sort_order: 103,
    item_type: "frozen_addon",
  },
];

const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    name: "Herb Roasted Chicken",
    description: "Half chicken with seasonal vegetables and mashed potatoes",
    base_price_cents: 1800,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000001"],
    active: true,
    sort_order: 1,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    name: "Beef Pot Roast",
    description: "Slow-braised beef with carrots, onions, and gravy",
    base_price_cents: 2000,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000002"],
    active: true,
    sort_order: 2,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    name: "Vegetable Lasagna",
    description: "Layers of pasta, ricotta, and roasted vegetables",
    base_price_cents: 1600,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000003"],
    active: true,
    sort_order: 3,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    name: "Salmon with Lemon Dill",
    description: "Pan-seared salmon, rice pilaf, and green beans",
    base_price_cents: 2200,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000004"],
    active: true,
    sort_order: 4,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    name: "BBQ Pulled Pork",
    description: "Slow-smoked pulled pork with coleslaw and cornbread",
    base_price_cents: 1900,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000005"],
    active: true,
    sort_order: 5,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000006",
    name: "Mediterranean Quinoa Bowl",
    description: "Quinoa, chickpeas, feta, olives, and roasted vegetables",
    base_price_cents: 1700,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000006"],
    active: true,
    sort_order: 6,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000007",
    name: "Turkey Meatloaf",
    description: "Homestyle meatloaf with mashed potatoes and green beans",
    base_price_cents: 1800,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000007"],
    active: true,
    sort_order: 7,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000008",
    name: "Shrimp Scampi Pasta",
    description: "Garlic butter shrimp over linguine with parsley",
    base_price_cents: 2100,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000008"],
    active: true,
    sort_order: 8,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000009",
    name: "Chicken Parmesan",
    description: "Breaded chicken cutlet with marinara and mozzarella, served with pasta",
    base_price_cents: 1900,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000009"],
    active: true,
    sort_order: 9,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000010",
    name: "Stuffed Bell Peppers",
    description: "Bell peppers filled with ground beef, rice, and tomato sauce",
    base_price_cents: 1700,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000010"],
    active: true,
    sort_order: 10,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000011",
    name: "Fish Tacos",
    description: "Crispy cod tacos with cabbage slaw and lime crema",
    base_price_cents: 1800,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000011"],
    active: true,
    sort_order: 11,
    item_type: "meal",
  },
  {
    id: "a1000000-0000-4000-8000-000000000012",
    name: "Shepherd's Pie",
    description: "Ground lamb and vegetables topped with creamy mashed potatoes",
    base_price_cents: 1900,
    image_url: MENU_ITEM_IMAGES["a1000000-0000-4000-8000-000000000012"],
    active: true,
    sort_order: 12,
    item_type: "meal",
  },
  ...DEMO_FROZEN_ITEMS,
];

const DEMO_MENU_ITEM_BY_ID = Object.fromEntries(DEMO_MENU_ITEMS.map((item) => [item.id, item]));

/** Menu item ids per day (Tue–Fri). */
const DEMO_WEEK_ITEM_IDS: string[][] = [
  [
    "a1000000-0000-4000-8000-000000000005",
    "a1000000-0000-4000-8000-000000000006",
    "a1000000-0000-4000-8000-000000000003",
  ],
  [
    "a1000000-0000-4000-8000-000000000007",
    "a1000000-0000-4000-8000-000000000008",
    "a1000000-0000-4000-8000-000000000004",
  ],
  [
    "a1000000-0000-4000-8000-000000000009",
    "a1000000-0000-4000-8000-000000000010",
    "a1000000-0000-4000-8000-000000000002",
  ],
  [
    "a1000000-0000-4000-8000-000000000011",
    "a1000000-0000-4000-8000-000000000012",
    "a1000000-0000-4000-8000-000000000001",
  ],
];

const DEMO_GROUPS: Record<string, DailyCustomizationGroup[]> = {
  "demo-dmi-1": [
    {
      id: "dcg-1",
      daily_menu_item_id: "demo-dmi-1",
      source_group_id: null,
      name: "Side",
      type: "single_choice",
      min_selections: 1,
      max_selections: 1,
      required: true,
      sort_order: 1,
      options: [
        { id: "dco-1", group_id: "dcg-1", source_option_id: null, name: "Mashed potatoes", price_modifier_cents: 0, sort_order: 1 },
        { id: "dco-2", group_id: "dcg-1", source_option_id: null, name: "Roasted vegetables", price_modifier_cents: 0, sort_order: 2 },
        { id: "dco-3", group_id: "dcg-1", source_option_id: null, name: "Rice pilaf", price_modifier_cents: 0, sort_order: 3 },
      ],
    },
    {
      id: "dcg-2",
      daily_menu_item_id: "demo-dmi-1",
      source_group_id: null,
      name: "Extra gravy",
      type: "quantity",
      min_selections: 0,
      max_selections: 3,
      required: false,
      sort_order: 2,
      options: [
        { id: "dco-4", group_id: "dcg-2", source_option_id: null, name: "Extra gravy", price_modifier_cents: 50, sort_order: 1 },
      ],
    },
    {
      id: "dcg-3",
      daily_menu_item_id: "demo-dmi-1",
      source_group_id: null,
      name: "Special instructions",
      type: "text",
      min_selections: 0,
      max_selections: 1,
      required: false,
      sort_order: 3,
      options: [],
    },
  ],
};

function buildDemoSideGroups(dailyMenuItemId: string, sideNames: string[]): DailyCustomizationGroup[] {
  const groupId = `dcg-side-${dailyMenuItemId}`;
  return [
    {
      id: groupId,
      daily_menu_item_id: dailyMenuItemId,
      source_group_id: null,
      name: "Side",
      type: "single_choice",
      min_selections: 1,
      max_selections: 1,
      required: true,
      sort_order: 1,
      options: sideNames.map((name, index) => ({
        id: `dco-side-${dailyMenuItemId}-${index + 1}`,
        group_id: groupId,
        source_option_id: null,
        name,
        price_modifier_cents: 0,
        sort_order: index + 1,
      })),
    },
  ];
}

function getDemoCustomizationGroups(dailyMenuItemId: string, menuItemId: string): DailyCustomizationGroup[] {
  if (menuItemId === "a1000000-0000-4000-8000-000000000001") {
    return DEMO_GROUPS["demo-dmi-1"].map((group) => ({
      ...group,
      id: `${group.id}-${dailyMenuItemId}`,
      daily_menu_item_id: dailyMenuItemId,
      options: (group.options ?? []).map((option) => ({
        ...option,
        id: `${option.id}-${dailyMenuItemId}`,
        group_id: `${group.id}-${dailyMenuItemId}`,
      })),
    }));
  }

  if (menuItemId === "a1000000-0000-4000-8000-000000000005") {
    return buildDemoSideGroups(dailyMenuItemId, ["Coleslaw", "Cornbread", "Mac & cheese"]);
  }

  if (menuItemId === "a1000000-0000-4000-8000-000000000002") {
    return buildDemoSideGroups(dailyMenuItemId, ["Mashed potatoes", "Roasted carrots", "Dinner rolls"]);
  }

  if (menuItemId === "a1000000-0000-4000-8000-000000000006") {
    return buildDemoSideGroups(dailyMenuItemId, ["Pita bread", "Hummus cup", "Greek yogurt"]);
  }

  if (menuItemId === "a1000000-0000-4000-8000-000000000009") {
    return buildDemoSideGroups(dailyMenuItemId, ["Spaghetti", "Garlic bread", "Side salad"]);
  }

  return [];
}

function getDemoWeekDates() {
  return getWeekdayMenuDates(DEMO_WEEK_ITEM_IDS.length, DEMO_SETTINGS.timezone);
}

function getDemoDailyMenuForDate(serviceDate: string): DailyMenu | null {
  const dates = getDemoWeekDates();
  const dayIndex = dates.indexOf(serviceDate);
  if (dayIndex === -1) return null;

  return {
    id: `demo-menu-${serviceDate}`,
    service_date: serviceDate,
    order_cutoff_at: getDefaultCutoff(serviceDate, DEMO_SETTINGS.default_cutoff_hour, DEMO_SETTINGS.default_cutoff_minute, DEMO_SETTINGS.timezone),
    status: "published",
  };
}

function getAllDemoDailyMenus(): DailyMenu[] {
  return getDemoWeekDates()
    .map((date) => getDemoDailyMenuForDate(date))
    .filter((menu): menu is DailyMenu => menu !== null);
}

function getDemoDailyMenuItems(menu: DailyMenu): DailyMenuItem[] {
  const dates = getDemoWeekDates();
  const dayIndex = dates.indexOf(menu.service_date);
  if (dayIndex === -1) return [];

  const itemIds = DEMO_WEEK_ITEM_IDS[dayIndex] ?? [];

  return itemIds.map((menuItemId, index) => {
    const item = DEMO_MENU_ITEM_BY_ID[menuItemId];
    const dailyMenuItemId = `demo-dmi-${menu.service_date}-${index + 1}`;

    return {
      id: dailyMenuItemId,
      daily_menu_id: menu.id,
      menu_item_id: item.id,
      price_override_cents: null,
      max_quantity: null,
      sold_out: false,
      sort_order: index + 1,
      menu_item: item,
      customization_groups: getDemoCustomizationGroups(dailyMenuItemId, menuItemId),
    };
  });
}

function getDemoDailyMenu(): DailyMenu {
  return getDemoDailyMenuForDate(getDemoWeekDates()[0])!;
}

const demoOrders: Order[] = [];
const demoOrderNumbers: Record<string, number> = {};

function mapMenuItem(row: typeof menuItems.$inferSelect): MenuItem {
  return row as MenuItem;
}

function mapDailyMenu(row: typeof dailyMenus.$inferSelect): DailyMenu {
  return row as DailyMenu;
}

async function loadCustomizationGroupsForMenuItem(menuItemId: string): Promise<CustomizationGroup[]> {
  const db = getDb();
  const groups = await db
    .select()
    .from(customizationGroups)
    .where(eq(customizationGroups.menu_item_id, menuItemId))
    .orderBy(asc(customizationGroups.sort_order));

  if (groups.length === 0) return [];

  const groupIds = groups.map((g) => g.id);
  const options = await db
    .select()
    .from(customizationOptions)
    .where(inArray(customizationOptions.group_id, groupIds))
    .orderBy(asc(customizationOptions.sort_order));

  const optionsByGroup = new Map<string, CustomizationOption[]>();
  for (const opt of options) {
    const list = optionsByGroup.get(opt.group_id) ?? [];
    list.push(opt as CustomizationOption);
    optionsByGroup.set(opt.group_id, list);
  }

  return groups.map((g) => ({
    ...(g as CustomizationGroup),
    options: optionsByGroup.get(g.id) ?? [],
  }));
}

async function loadDailyCustomizationGroups(
  dailyMenuItemIds: string[]
): Promise<Map<string, DailyCustomizationGroup[]>> {
  const result = new Map<string, DailyCustomizationGroup[]>();
  if (dailyMenuItemIds.length === 0) return result;

  const db = getDb();
  const groups = await db
    .select()
    .from(dailyCustomizationGroups)
    .where(inArray(dailyCustomizationGroups.daily_menu_item_id, dailyMenuItemIds))
    .orderBy(asc(dailyCustomizationGroups.sort_order));

  if (groups.length === 0) {
    for (const id of dailyMenuItemIds) result.set(id, []);
    return result;
  }

  const groupIds = groups.map((g) => g.id);
  const options = await db
    .select()
    .from(dailyCustomizationOptions)
    .where(inArray(dailyCustomizationOptions.group_id, groupIds))
    .orderBy(asc(dailyCustomizationOptions.sort_order));

  const optionsByGroup = new Map<string, DailyCustomizationOption[]>();
  for (const opt of options) {
    const list = optionsByGroup.get(opt.group_id) ?? [];
    list.push(opt as DailyCustomizationOption);
    optionsByGroup.set(opt.group_id, list);
  }

  for (const g of groups) {
    const list = result.get(g.daily_menu_item_id) ?? [];
    list.push({
      ...(g as DailyCustomizationGroup),
      options: optionsByGroup.get(g.id) ?? [],
    });
    result.set(g.daily_menu_item_id, list);
  }

  for (const id of dailyMenuItemIds) {
    if (!result.has(id)) result.set(id, []);
  }

  return result;
}

async function getDailyMenuItems(dailyMenuId: string): Promise<DailyMenuItem[]> {
  const db = getDb();
  const rows = await db
    .select({ dmi: dailyMenuItems, menu_item: menuItems })
    .from(dailyMenuItems)
    .innerJoin(menuItems, eq(dailyMenuItems.menu_item_id, menuItems.id))
    .where(eq(dailyMenuItems.daily_menu_id, dailyMenuId))
    .orderBy(asc(dailyMenuItems.sort_order));

  const groupsByDmi = await loadDailyCustomizationGroups(rows.map((r) => r.dmi.id));

  return rows.map(({ dmi, menu_item }) => ({
    ...(dmi as DailyMenuItem),
    menu_item: mapMenuItem(menu_item),
    customization_groups: groupsByDmi.get(dmi.id) ?? [],
  }));
}

export async function hydrateOrder(orderRow: typeof orders.$inferSelect): Promise<Order> {
  const db = getDb();
  const [dailyMenu] = await db.select().from(dailyMenus).where(eq(dailyMenus.id, orderRow.daily_menu_id)).limit(1);

  let deliverySlot: DeliveryTimeSlot | null = null;
  if (orderRow.delivery_slot_id) {
    const [slot] = await db
      .select()
      .from(deliveryTimeSlots)
      .where(eq(deliveryTimeSlots.id, orderRow.delivery_slot_id))
      .limit(1);
    deliverySlot = (slot as DeliveryTimeSlot) ?? null;
  }

  const lines = await db.select().from(orderLines).where(eq(orderLines.order_id, orderRow.id));
  const lineIds = lines.map((l) => l.id);
  const customizations =
    lineIds.length > 0
      ? await db.select().from(orderLineCustomizations).where(inArray(orderLineCustomizations.order_line_id, lineIds))
      : [];

  const custByLine = new Map<string, OrderLineCustomization[]>();
  for (const c of customizations) {
    const list = custByLine.get(c.order_line_id) ?? [];
    list.push(c as OrderLineCustomization);
    custByLine.set(c.order_line_id, list);
  }

  return {
    ...(orderRow as Order),
    daily_menu: dailyMenu ? mapDailyMenu(dailyMenu) : undefined,
    delivery_slot: deliverySlot,
    order_lines: lines.map((line) => ({
      ...(line as OrderLine),
      order_line_customizations: custByLine.get(line.id) ?? [],
    })),
  };
}

export async function hydrateOrders(orderRows: (typeof orders.$inferSelect)[]): Promise<Order[]> {
  if (orderRows.length === 0) return [];

  const db = getDb();
  const menuIds = [...new Set(orderRows.map((o) => o.daily_menu_id))];
  const slotIds = [...new Set(orderRows.map((o) => o.delivery_slot_id).filter(Boolean))] as string[];
  const orderIds = orderRows.map((o) => o.id);

  const menus =
    menuIds.length > 0 ? await db.select().from(dailyMenus).where(inArray(dailyMenus.id, menuIds)) : [];
  const menuById = new Map(menus.map((m) => [m.id, mapDailyMenu(m)]));

  const slots =
    slotIds.length > 0
      ? await db.select().from(deliveryTimeSlots).where(inArray(deliveryTimeSlots.id, slotIds))
      : [];
  const slotById = new Map(slots.map((s) => [s.id, s as DeliveryTimeSlot]));

  const lines = await db.select().from(orderLines).where(inArray(orderLines.order_id, orderIds));
  const lineIds = lines.map((l) => l.id);
  const customizations =
    lineIds.length > 0
      ? await db.select().from(orderLineCustomizations).where(inArray(orderLineCustomizations.order_line_id, lineIds))
      : [];

  const custByLine = new Map<string, OrderLineCustomization[]>();
  for (const c of customizations) {
    const list = custByLine.get(c.order_line_id) ?? [];
    list.push(c as OrderLineCustomization);
    custByLine.set(c.order_line_id, list);
  }

  const linesByOrder = new Map<string, OrderLine[]>();
  for (const line of lines) {
    const list = linesByOrder.get(line.order_id) ?? [];
    list.push({
      ...(line as OrderLine),
      order_line_customizations: custByLine.get(line.id) ?? [],
    });
    linesByOrder.set(line.order_id, list);
  }

  return orderRows.map((orderRow) => ({
    ...(orderRow as Order),
    daily_menu: menuById.get(orderRow.daily_menu_id),
    delivery_slot: orderRow.delivery_slot_id ? (slotById.get(orderRow.delivery_slot_id) ?? null) : null,
    order_lines: linesByOrder.get(orderRow.id) ?? [],
  }));
}

export const demoOrderCounter = {
  next(serviceDate: string) {
    demoOrderNumbers[serviceDate] = (demoOrderNumbers[serviceDate] ?? 0) + 1;
    return demoOrderNumbers[serviceDate];
  },
};

export async function assignOrderNumber(serviceDate: string): Promise<number> {
  if (!isSupabaseConfigured()) return demoOrderCounter.next(serviceDate);

  const db = getDb();
  const [row] = await db
    .insert(orderNumberCounters)
    .values({ service_date: serviceDate, last_number: 1 })
    .onConflictDoUpdate({
      target: orderNumberCounters.service_date,
      set: { last_number: sql`${orderNumberCounters.last_number} + 1` },
    })
    .returning({ last_number: orderNumberCounters.last_number });

  return row.last_number;
}

export async function incrementDeliverySlotCount(slotId: string) {
  const { incrementSlotCount } = await import("@/lib/db/routes");
  await incrementSlotCount(slotId);
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured()) return DEMO_SETTINGS;

  const db = getDb();
  const [row] = await db.select().from(businessSettings).limit(1);
  if (!row) return DEMO_SETTINGS;
  return row as BusinessSettings;
}

export async function updateBusinessSettings(updates: Partial<BusinessSettings>) {
  const settings = await getBusinessSettings();
  const db = getDb();
  const [row] = await db
    .update(businessSettings)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(eq(businessSettings.id, settings.id))
    .returning();
  if (!row) throw new Error("Failed to update business settings");
  return row as BusinessSettings;
}

export async function getMenuItems(includeInactive = false, itemType?: "meal" | "frozen_addon"): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) {
    let items = includeInactive ? DEMO_MENU_ITEMS : DEMO_MENU_ITEMS.filter((i) => i.active);
    if (itemType) items = items.filter((i) => i.item_type === itemType);
    return items;
  }

  const db = getDb();
  const conditions = [];
  if (!includeInactive) conditions.push(eq(menuItems.active, true));
  if (itemType) conditions.push(eq(menuItems.item_type, itemType));

  const rows = await db
    .select()
    .from(menuItems)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(menuItems.sort_order));

  return rows as MenuItem[];
}

export async function getFrozenAddons() {
  return getMenuItems(false, "frozen_addon");
}

export async function getMenuItemWithCustomizations(id: string) {
  if (!isSupabaseConfigured()) {
    const item = DEMO_MENU_ITEMS.find((i) => i.id === id);
    if (!item) return null;
    return {
      ...item,
      customization_groups: [] as CustomizationGroup[],
    };
  }

  const db = getDb();
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!item) return null;

  const groups = await loadCustomizationGroupsForMenuItem(id);
  return {
    ...mapMenuItem(item),
    customization_groups: groups,
  };
}

export async function upsertMenuItem(item: Partial<MenuItem> & { name: string; base_price_cents: number }) {
  const db = getDb();
  const now = new Date().toISOString();

  if (item.id) {
    const [row] = await db
      .update(menuItems)
      .set({ ...item, updated_at: now })
      .where(eq(menuItems.id, item.id))
      .returning();
    if (!row) throw new Error("Menu item not found");
    return row as MenuItem;
  }

  const [row] = await db
    .insert(menuItems)
    .values({
      id: newId(),
      name: item.name,
      description: item.description ?? null,
      base_price_cents: item.base_price_cents,
      image_url: item.image_url ?? null,
      active: item.active ?? true,
      sort_order: item.sort_order ?? 0,
      item_type: item.item_type ?? "meal",
      created_at: now,
      updated_at: now,
    })
    .returning();
  return row as MenuItem;
}

export async function deleteMenuItem(id: string) {
  const db = getDb();
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function saveCustomizationGroups(
  menuItemId: string,
  groups: Array<{
    id?: string;
    name: string;
    type: string;
    min_selections: number;
    max_selections: number;
    required: boolean;
    sort_order: number;
    options: Array<{ id?: string; name: string; price_modifier_cents: number; sort_order: number }>;
  }>
) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.delete(customizationGroups).where(eq(customizationGroups.menu_item_id, menuItemId));

  for (const group of groups) {
    const groupId = newId();
    await db.insert(customizationGroups).values({
      id: groupId,
      menu_item_id: menuItemId,
      name: group.name,
      type: group.type,
      min_selections: group.min_selections,
      max_selections: group.max_selections,
      required: group.required,
      sort_order: group.sort_order,
      created_at: now,
    });

    if (group.options.length > 0) {
      await db.insert(customizationOptions).values(
        group.options.map((opt) => ({
          id: newId(),
          group_id: groupId,
          name: opt.name,
          price_modifier_cents: opt.price_modifier_cents,
          sort_order: opt.sort_order,
          created_at: now,
        }))
      );
    }
  }
}

export async function getPublishedMenuForDate(serviceDate: string) {
  if (!isSupabaseConfigured()) {
    const menu = getDemoDailyMenuForDate(serviceDate);
    if (!menu) return null;
    return { menu, items: getDemoDailyMenuItems(menu) };
  }

  const db = getDb();
  const [menu] = await db
    .select()
    .from(dailyMenus)
    .where(and(eq(dailyMenus.service_date, serviceDate), eq(dailyMenus.status, "published")))
    .limit(1);

  if (!menu) return null;

  const items = await getDailyMenuItems(menu.id);
  return { menu: mapDailyMenu(menu), items };
}

export async function getNextAvailableMenu() {
  const settings = await getBusinessSettings();
  const tomorrow = getTomorrowDateString(settings.timezone);
  const menu = await getPublishedMenuForDate(tomorrow);
  if (menu) return menu;

  if (!isSupabaseConfigured()) {
    for (const date of getDemoWeekDates()) {
      if (date >= tomorrow) {
        const demoMenu = getDemoDailyMenuForDate(date);
        if (demoMenu) return { menu: demoMenu, items: getDemoDailyMenuItems(demoMenu) };
      }
    }
    return null;
  }

  const db = getDb();
  const [data] = await db
    .select()
    .from(dailyMenus)
    .where(and(eq(dailyMenus.status, "published"), gte(dailyMenus.service_date, tomorrow)))
    .orderBy(asc(dailyMenus.service_date))
    .limit(1);

  if (!data) return null;

  const items = await getDailyMenuItems(data.id);
  return { menu: mapDailyMenu(data), items };
}

export async function getUpcomingPublishedMenus(timezone = DEFAULT_TIMEZONE) {
  const tomorrow = getTomorrowDateString(timezone);

  if (!isSupabaseConfigured()) {
    return getAllDemoDailyMenus();
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(dailyMenus)
    .where(and(eq(dailyMenus.status, "published"), gte(dailyMenus.service_date, tomorrow)))
    .orderBy(asc(dailyMenus.service_date));

  return rows.map(mapDailyMenu);
}

export async function getDailyMenus() {
  if (!isSupabaseConfigured()) {
    return getAllDemoDailyMenus();
  }

  const db = getDb();
  const rows = await db.select().from(dailyMenus).orderBy(desc(dailyMenus.service_date));
  return rows.map(mapDailyMenu);
}

export async function getDailyMenuByDate(serviceDate: string) {
  if (!isSupabaseConfigured()) {
    const menu = getDemoDailyMenuForDate(serviceDate);
    if (!menu) return null;
    return { menu, items: getDemoDailyMenuItems(menu) };
  }

  const db = getDb();
  const [menu] = await db.select().from(dailyMenus).where(eq(dailyMenus.service_date, serviceDate)).limit(1);
  if (!menu) return null;

  const items = await getDailyMenuItems(menu.id);
  return { menu: mapDailyMenu(menu), items };
}

export async function createOrUpdateDailyMenu(serviceDate: string, status: DailyMenu["status"] = "draft") {
  const settings = await getBusinessSettings();
  const cutoff = getDefaultCutoff(
    serviceDate,
    settings.default_cutoff_hour,
    settings.default_cutoff_minute,
    settings.timezone
  );

  const db = getDb();
  const now = new Date().toISOString();
  const [row] = await db
    .insert(dailyMenus)
    .values({
      id: newId(),
      service_date: serviceDate,
      order_cutoff_at: cutoff,
      status,
      created_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: dailyMenus.service_date,
      set: {
        order_cutoff_at: cutoff,
        status,
        updated_at: now,
      },
    })
    .returning();

  return mapDailyMenu(row);
}

export async function publishDailyMenu(serviceDate: string) {
  const existing = await getDailyMenuByDate(serviceDate);
  let menu = existing?.menu;

  if (!menu) {
    menu = await createOrUpdateDailyMenu(serviceDate, "draft");
  }

  const db = getDb();
  const [row] = await db
    .update(dailyMenus)
    .set({ status: "published", updated_at: new Date().toISOString() })
    .where(eq(dailyMenus.id, menu.id))
    .returning();

  if (!row) throw new Error("Failed to publish daily menu");
  return mapDailyMenu(row);
}

export async function addItemToDailyMenu(dailyMenuId: string, menuItemId: string) {
  const db = getDb();
  const item = await getMenuItemWithCustomizations(menuItemId);
  if (!item) throw new Error("Menu item not found");

  const now = new Date().toISOString();
  const dailyItemId = newId();
  const [dailyItem] = await db
    .insert(dailyMenuItems)
    .values({
      id: dailyItemId,
      daily_menu_id: dailyMenuId,
      menu_item_id: menuItemId,
      sold_out: false,
      sort_order: 0,
      created_at: now,
    })
    .returning();

  for (const group of item.customization_groups ?? []) {
    const dailyGroupId = newId();
    await db.insert(dailyCustomizationGroups).values({
      id: dailyGroupId,
      daily_menu_item_id: dailyItem.id,
      source_group_id: group.id,
      name: group.name,
      type: group.type,
      min_selections: group.min_selections,
      max_selections: group.max_selections,
      required: group.required,
      sort_order: group.sort_order,
    });

    if (group.options && group.options.length > 0) {
      await db.insert(dailyCustomizationOptions).values(
        group.options.map((opt) => ({
          id: newId(),
          group_id: dailyGroupId,
          source_option_id: opt.id,
          name: opt.name,
          price_modifier_cents: opt.price_modifier_cents,
          sort_order: opt.sort_order,
        }))
      );
    }
  }

  return dailyItem as DailyMenuItem;
}

export async function updateDailyMenuItem(
  id: string,
  updates: Partial<Pick<DailyMenuItem, "price_override_cents" | "max_quantity" | "sold_out" | "sort_order">>
) {
  const db = getDb();
  const [row] = await db.update(dailyMenuItems).set(updates).where(eq(dailyMenuItems.id, id)).returning();
  if (!row) throw new Error("Daily menu item not found");
  return row as DailyMenuItem;
}

export async function removeDailyMenuItem(id: string) {
  const db = getDb();
  await db.delete(dailyMenuItems).where(eq(dailyMenuItems.id, id));
}

export async function createOrder(payload: CheckoutPayload, clerkUserId?: string | null) {
  const settings = await getBusinessSettings();
  const subtotal = calculateCartSubtotal(payload.lines);
  const deliveryFee =
    payload.fulfillmentType === "delivery" ? settings.driver_delivery_fee_cents : 0;
  const premiumFee =
    payload.fulfillmentType === "delivery" && payload.isPremiumDelivery
      ? settings.premium_delivery_fee_cents
      : 0;
  const total = calculateOrderTotal(
    subtotal,
    settings.driver_delivery_fee_cents,
    payload.fulfillmentType,
    premiumFee
  );

  if (subtotal < settings.min_order_cents) {
    throw new Error(`Minimum order is $${(settings.min_order_cents / 100).toFixed(2)}`);
  }

  if (payload.fulfillmentType === "delivery" && !payload.deliverySlotId) {
    throw new Error("Please select a delivery time window");
  }

  let serviceDate = getTomorrowDateString(settings.timezone);
  if (!isSupabaseConfigured()) {
    const demoMenu = getAllDemoDailyMenus().find((menu) => menu.id === payload.dailyMenuId);
    if (demoMenu) serviceDate = demoMenu.service_date;
  } else {
    const db = getDb();
    const [menu] = await db
      .select({ service_date: dailyMenus.service_date })
      .from(dailyMenus)
      .where(eq(dailyMenus.id, payload.dailyMenuId))
      .limit(1);
    if (menu) serviceDate = menu.service_date;
  }

  const orderNumber = await assignOrderNumber(serviceDate);

  if (!isSupabaseConfigured()) {
    const order: Order = {
      id: crypto.randomUUID(),
      daily_menu_id: payload.dailyMenuId,
      order_number: orderNumber,
      clerk_user_id: clerkUserId ?? null,
      customer_name: payload.customerName,
      phone: payload.phone,
      email: payload.email,
      fulfillment_type: payload.fulfillmentType,
      delivery_address: payload.deliveryAddress ?? null,
      subtotal_cents: subtotal,
      delivery_fee_cents: deliveryFee,
      premium_fee_cents: premiumFee,
      total_cents: total,
      payment_status: "pending",
      order_status: "received",
      stripe_session_id: null,
      notes: payload.notes ?? null,
      delivery_slot_id: payload.deliverySlotId ?? null,
      requested_delivery_time: payload.requestedDeliveryTime ?? null,
      is_premium_delivery: payload.isPremiumDelivery ?? false,
      route_id: null,
      route_sequence: null,
      driver_id: null,
      created_at: new Date().toISOString(),
      order_lines: payload.lines.map((line) => ({
        id: crypto.randomUUID(),
        order_id: "",
        daily_menu_item_id: line.dailyMenuItemId ?? null,
        menu_item_id: line.menuItemId ?? null,
        line_type: line.lineType,
        item_name: line.itemName,
        quantity: line.quantity,
        unit_price_cents: line.unitPriceCents,
        line_total_cents: calculateLineTotal(line),
        order_line_customizations: line.customizations.flatMap((group) =>
          group.selections.map((sel) => ({
            id: crypto.randomUUID(),
            order_line_id: "",
            group_name: group.groupName,
            option_name: sel.textValue ?? sel.optionName,
            price_modifier_cents: sel.priceModifierCents * (sel.quantity ?? 1),
          }))
        ),
      })),
    };
    demoOrders.unshift(order);
    if (payload.deliverySlotId) await incrementDeliverySlotCount(payload.deliverySlotId);
    return order;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const orderId = newId();

  const order = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(orders)
      .values({
        id: orderId,
        daily_menu_id: payload.dailyMenuId,
        order_number: orderNumber,
        clerk_user_id: clerkUserId ?? null,
        customer_name: payload.customerName,
        phone: payload.phone,
        email: payload.email,
        fulfillment_type: payload.fulfillmentType,
        delivery_address: payload.deliveryAddress ?? null,
        subtotal_cents: subtotal,
        delivery_fee_cents: deliveryFee,
        premium_fee_cents: premiumFee,
        total_cents: total,
        payment_status: "pending",
        order_status: "received",
        notes: payload.notes ?? null,
        delivery_slot_id: payload.deliverySlotId ?? null,
        requested_delivery_time: payload.requestedDeliveryTime ?? null,
        is_premium_delivery: payload.isPremiumDelivery ?? false,
        created_at: now,
        updated_at: now,
      })
      .returning();

    for (const line of payload.lines) {
      const lineId = newId();
      await tx.insert(orderLines).values({
        id: lineId,
        order_id: orderId,
        daily_menu_item_id: line.dailyMenuItemId ?? null,
        menu_item_id: line.menuItemId ?? null,
        line_type: line.lineType,
        item_name: line.itemName,
        quantity: line.quantity,
        unit_price_cents: line.unitPriceCents,
        line_total_cents: calculateLineTotal(line),
        created_at: now,
      });

      const customizations = line.customizations.flatMap((group) =>
        group.selections.map((sel) => ({
          id: newId(),
          order_line_id: lineId,
          group_name: group.groupName,
          option_name: sel.textValue ?? sel.optionName,
          price_modifier_cents: sel.priceModifierCents * (sel.quantity ?? 1),
        }))
      );

      if (customizations.length > 0) {
        await tx.insert(orderLineCustomizations).values(customizations);
      }
    }

    return inserted;
  });

  if (payload.deliverySlotId) await incrementDeliverySlotCount(payload.deliverySlotId);

  return order as Order;
}

export async function getOrder(id: string) {
  if (!isSupabaseConfigured()) {
    return demoOrders.find((o) => o.id === id) ?? null;
  }

  const db = getDb();
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return null;
  return hydrateOrder(row);
}

export async function getOrders(filters?: { date?: string; status?: string }) {
  if (!isSupabaseConfigured()) {
    const { demoSlotsRef } = await import("@/lib/db/routes");
    return demoOrders.map((o) => ({
      ...o,
      delivery_slot: o.delivery_slot_id
        ? demoSlotsRef.find((s) => s.id === o.delivery_slot_id) ?? null
        : null,
    }));
  }

  const db = getDb();
  const conditions = [];
  if (filters?.status) conditions.push(eq(orders.order_status, filters.status));
  if (filters?.date) conditions.push(eq(dailyMenus.service_date, filters.date));

  const rows = await db
    .select({ order: orders })
    .from(orders)
    .leftJoin(dailyMenus, eq(orders.daily_menu_id, dailyMenus.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.created_at));

  return hydrateOrders(rows.map((r) => r.order));
}

export async function getOrdersForUser(clerkUserId: string) {
  if (!isSupabaseConfigured()) {
    return demoOrders.filter((o) => o.clerk_user_id === clerkUserId);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.clerk_user_id, clerkUserId))
    .orderBy(desc(orders.created_at));

  return hydrateOrders(rows);
}

export async function updateOrderStatus(id: string, orderStatus: Order["order_status"]) {
  if (!isSupabaseConfigured()) {
    const order = demoOrders.find((o) => o.id === id);
    if (order) order.order_status = orderStatus;
    return order ?? null;
  }

  const db = getDb();
  const [row] = await db
    .update(orders)
    .set({ order_status: orderStatus, updated_at: new Date().toISOString() })
    .where(eq(orders.id, id))
    .returning();

  if (!row) throw new Error("Order not found");
  return row as Order;
}

export async function markOrderPaid(id: string, stripeSessionId: string, paymentIntentId?: string) {
  if (!isSupabaseConfigured()) {
    const order = demoOrders.find((o) => o.id === id);
    if (order) {
      order.payment_status = "paid";
      order.stripe_session_id = stripeSessionId;
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      await sendOrderConfirmationEmail(order);
    }
    return order ?? null;
  }

  const db = getDb();
  const [row] = await db
    .update(orders)
    .set({
      payment_status: "paid",
      stripe_session_id: stripeSessionId,
      stripe_payment_intent_id: paymentIntentId ?? null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(orders.id, id))
    .returning();

  if (!row) throw new Error("Order not found");
  const full = await getOrder(id);
  if (full) {
    const { sendOrderConfirmationEmail } = await import("@/lib/email");
    await sendOrderConfirmationEmail(full);
  }
  return row as Order;
}

export async function updateOrderStripeSession(id: string, stripeSessionId: string) {
  if (!isSupabaseConfigured()) return;

  const db = getDb();
  await db
    .update(orders)
    .set({ stripe_session_id: stripeSessionId, updated_at: new Date().toISOString() })
    .where(eq(orders.id, id));
}

export async function getDashboardStats() {
  const orders = await getOrders();
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.daily_menu?.service_date === today || o.created_at.startsWith(today));
  const paidOrders = todayOrders.filter((o) => o.payment_status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);

  return {
    todayOrderCount: todayOrders.length,
    todayRevenueCents: revenue,
    pendingOrders: orders.filter((o) => o.order_status === "received" && o.payment_status === "paid").length,
  };
}
