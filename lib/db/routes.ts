import { eq, asc, inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import {
  drivers,
  deliveryTimeSlots,
  deliveryRoutes,
  routeStops,
  orders,
  newId,
} from "@/lib/db/schema";
import { getBusinessSettings, getOrders, hydrateOrders } from "@/lib/db/queries";
import { generateDefaultSlots } from "@/lib/delivery/slots";
import { generateRoutes, calculateDriverPay } from "@/lib/routing/generateRoutes";
import type { DeliveryRoute, DeliveryTimeSlot, Driver, DriverRouteSummary, RouteStop } from "@/lib/types";

const isSupabaseConfigured = isDatabaseConfigured;

const DEMO_DRIVERS: Driver[] = [
  { id: "demo-driver-1", name: "Driver 1", phone: null, active: true },
  { id: "demo-driver-2", name: "Driver 2", phone: null, active: true },
];

const demoSlots: DeliveryTimeSlot[] = [];
export const demoSlotsRef = demoSlots;
const demoRoutes: DeliveryRoute[] = [];
const demoStops: RouteStop[] = [];

function getDemoSlots(serviceDate: string): DeliveryTimeSlot[] {
  const existing = demoSlots.filter((s) => s.service_date === serviceDate);
  if (existing.length > 0) return existing;

  const settings = {
    default_slot_start_hour: 16,
    default_slot_end_hour: 20,
    slot_duration_minutes: 120,
  };

  const generated = generateDefaultSlots(
    serviceDate,
    settings.default_slot_start_hour,
    settings.default_slot_end_hour,
    settings.slot_duration_minutes
  );

  for (const slot of generated) {
    demoSlots.push({
      ...slot,
      id: crypto.randomUUID(),
      order_count: 0,
    });
  }

  return demoSlots.filter((s) => s.service_date === serviceDate);
}

async function hydrateRoutes(routeRows: (typeof deliveryRoutes.$inferSelect)[]): Promise<DeliveryRoute[]> {
  if (routeRows.length === 0) return [];

  const db = getDb();
  const routeIds = routeRows.map((r) => r.id);
  const driverIds = [...new Set(routeRows.map((r) => r.driver_id).filter(Boolean))] as string[];

  const driverRows =
    driverIds.length > 0 ? await db.select().from(drivers).where(inArray(drivers.id, driverIds)) : [];
  const driverById = new Map(driverRows.map((d) => [d.id, d as Driver]));

  const stops = await db
    .select()
    .from(routeStops)
    .where(inArray(routeStops.route_id, routeIds))
    .orderBy(asc(routeStops.sequence));

  const orderIds = stops.map((s) => s.order_id);
  const orderRows =
    orderIds.length > 0 ? await db.select().from(orders).where(inArray(orders.id, orderIds)) : [];
  const hydratedOrders = await hydrateOrders(orderRows);
  const orderById = new Map(hydratedOrders.map((o) => [o.id, o]));

  const stopsByRoute = new Map<string, RouteStop[]>();
  for (const stop of stops) {
    const list = stopsByRoute.get(stop.route_id) ?? [];
    list.push({
      ...(stop as RouteStop),
      order: orderById.get(stop.order_id),
    });
    stopsByRoute.set(stop.route_id, list);
  }

  return routeRows.map((route) => ({
    ...(route as DeliveryRoute),
    driver: route.driver_id ? driverById.get(route.driver_id) : undefined,
    stops: stopsByRoute.get(route.id) ?? [],
  }));
}

export async function getDrivers(): Promise<Driver[]> {
  if (!isSupabaseConfigured()) return DEMO_DRIVERS;

  const db = getDb();
  const rows = await db
    .select()
    .from(drivers)
    .where(eq(drivers.active, true))
    .orderBy(asc(drivers.name));

  return rows as Driver[];
}

export async function getDeliverySlots(serviceDate: string): Promise<DeliveryTimeSlot[]> {
  if (!isSupabaseConfigured()) return getDemoSlots(serviceDate);

  const db = getDb();
  const rows = await db
    .select()
    .from(deliveryTimeSlots)
    .where(eq(deliveryTimeSlots.service_date, serviceDate))
    .orderBy(asc(deliveryTimeSlots.window_start));

  if (rows.length > 0) return rows as DeliveryTimeSlot[];

  return ensureDeliverySlots(serviceDate);
}

export async function ensureDeliverySlots(serviceDate: string): Promise<DeliveryTimeSlot[]> {
  const settings = await getBusinessSettings();

  if (!isSupabaseConfigured()) return getDemoSlots(serviceDate);

  const db = getDb();
  const generated = generateDefaultSlots(
    serviceDate,
    settings.default_slot_start_hour,
    settings.default_slot_end_hour,
    settings.slot_duration_minutes
  );

  const now = new Date().toISOString();
  if (generated.length > 0) {
    await db
      .insert(deliveryTimeSlots)
      .values(
        generated.map((slot) => ({
          id: newId(),
          service_date: slot.service_date,
          window_start: slot.window_start,
          window_end: slot.window_end,
          max_orders: slot.max_orders,
          order_count: 0,
          created_at: now,
        }))
      )
      .onConflictDoNothing({
        target: [deliveryTimeSlots.service_date, deliveryTimeSlots.window_start, deliveryTimeSlots.window_end],
      });
  }

  const rows = await db
    .select()
    .from(deliveryTimeSlots)
    .where(eq(deliveryTimeSlots.service_date, serviceDate))
    .orderBy(asc(deliveryTimeSlots.window_start));

  return rows as DeliveryTimeSlot[];
}

export async function incrementSlotCount(slotId: string) {
  if (!isSupabaseConfigured()) {
    const slot = demoSlots.find((s) => s.id === slotId);
    if (slot) slot.order_count += 1;
    return;
  }

  const db = getDb();
  const [slot] = await db
    .select({ order_count: deliveryTimeSlots.order_count })
    .from(deliveryTimeSlots)
    .where(eq(deliveryTimeSlots.id, slotId))
    .limit(1);

  if (!slot) throw new Error("Delivery slot not found");

  await db
    .update(deliveryTimeSlots)
    .set({ order_count: slot.order_count + 1 })
    .where(eq(deliveryTimeSlots.id, slotId));
}

export async function generateDeliveryRoutes(serviceDate: string, driverCount: number) {
  const driversList = (await getDrivers()).slice(0, driverCount);
  const ordersList = await getOrders({ date: serviceDate });
  const routes = generateRoutes(ordersList, driverCount);

  if (!isSupabaseConfigured()) {
    demoRoutes.length = 0;
    demoStops.length = 0;

    for (let i = 0; i < routes.length; i++) {
      const routeId = crypto.randomUUID();
      const driver = driversList[i] ?? null;
      demoRoutes.push({
        id: routeId,
        service_date: serviceDate,
        driver_id: driver?.id ?? null,
        status: "planned",
        created_at: new Date().toISOString(),
        driver: driver ?? undefined,
      });

      routes[i].orders.forEach((order, seq) => {
        order.route_id = routeId;
        order.route_sequence = seq + 1;
        order.driver_id = driver?.id ?? null;
        demoStops.push({
          id: crypto.randomUUID(),
          route_id: routeId,
          order_id: order.id,
          sequence: seq + 1,
          completed_at: null,
          order,
        });
      });
    }

    return demoRoutes;
  }

  const db = getDb();
  const now = new Date().toISOString();

  const existingRoutes = await db
    .select({ id: deliveryRoutes.id })
    .from(deliveryRoutes)
    .where(eq(deliveryRoutes.service_date, serviceDate));

  if (existingRoutes.length > 0) {
    const routeIds = existingRoutes.map((r) => r.id);
    await db.delete(routeStops).where(inArray(routeStops.route_id, routeIds));
    await db.delete(deliveryRoutes).where(eq(deliveryRoutes.service_date, serviceDate));
    await db
      .update(orders)
      .set({ route_id: null, route_sequence: null, driver_id: null })
      .where(inArray(orders.id, ordersList.map((o) => o.id)));
  }

  const createdRoutes: DeliveryRoute[] = [];

  for (let i = 0; i < routes.length; i++) {
    const driver = driversList[i] ?? null;
    const routeId = newId();
    const [route] = await db
      .insert(deliveryRoutes)
      .values({
        id: routeId,
        service_date: serviceDate,
        driver_id: driver?.id ?? null,
        status: "planned",
        created_at: now,
        updated_at: now,
      })
      .returning();

    for (let seq = 0; seq < routes[i].orders.length; seq++) {
      const order = routes[i].orders[seq];
      await db.insert(routeStops).values({
        id: newId(),
        route_id: routeId,
        order_id: order.id,
        sequence: seq + 1,
      });

      await db
        .update(orders)
        .set({
          route_id: routeId,
          route_sequence: seq + 1,
          driver_id: driver?.id ?? null,
          updated_at: now,
        })
        .where(eq(orders.id, order.id));
    }

    createdRoutes.push({ ...(route as DeliveryRoute), driver: driver ?? undefined });
  }

  return createdRoutes;
}

export async function getRoutesForDate(serviceDate: string): Promise<DeliveryRoute[]> {
  if (!isSupabaseConfigured()) {
    return demoRoutes
      .filter((r) => r.service_date === serviceDate)
      .map((route) => ({
        ...route,
        driver: DEMO_DRIVERS.find((d) => d.id === route.driver_id),
        stops: demoStops
          .filter((s) => s.route_id === route.id)
          .sort((a, b) => a.sequence - b.sequence),
      }));
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(deliveryRoutes)
    .where(eq(deliveryRoutes.service_date, serviceDate))
    .orderBy(asc(deliveryRoutes.created_at));

  return hydrateRoutes(rows);
}

export async function getDriverRouteSummary(routeId: string): Promise<DriverRouteSummary | null> {
  const settings = await getBusinessSettings();

  if (!isSupabaseConfigured()) {
    const route = demoRoutes.find((r) => r.id === routeId);
    if (!route) return null;
    const stops = demoStops
      .filter((s) => s.route_id === routeId)
      .sort((a, b) => a.sequence - b.sequence);
    const completedCount = stops.filter((s) => s.completed_at).length;
    const nextStop = stops.find((s) => !s.completed_at) ?? null;

    return {
      route,
      stops,
      nextStop,
      completedCount,
      totalStops: stops.length,
      driverPayCents: calculateDriverPay(stops.length, settings.driver_delivery_fee_cents),
    };
  }

  const db = getDb();
  const [routeRow] = await db.select().from(deliveryRoutes).where(eq(deliveryRoutes.id, routeId)).limit(1);
  if (!routeRow) return null;

  const [route] = await hydrateRoutes([routeRow]);
  const stops = (route.stops ?? []).sort((a, b) => a.sequence - b.sequence);
  const completedCount = stops.filter((s) => s.completed_at).length;
  const nextStop = stops.find((s) => !s.completed_at) ?? null;

  return {
    route,
    stops,
    nextStop,
    completedCount,
    totalStops: stops.length,
    driverPayCents: calculateDriverPay(stops.length, settings.driver_delivery_fee_cents),
  };
}

export async function completeRouteStop(stopId: string) {
  if (!isSupabaseConfigured()) {
    const stop = demoStops.find((s) => s.id === stopId);
    if (stop) {
      stop.completed_at = new Date().toISOString();
      if (stop.order) stop.order.order_status = "completed";
    }
    return stop ?? null;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const [stop] = await db
    .update(routeStops)
    .set({ completed_at: now })
    .where(eq(routeStops.id, stopId))
    .returning();

  if (!stop) return null;

  await db
    .update(orders)
    .set({ order_status: "completed", updated_at: now })
    .where(eq(orders.id, stop.order_id));

  return stop as RouteStop;
}

export async function startRoute(routeId: string) {
  if (!isSupabaseConfigured()) {
    const route = demoRoutes.find((r) => r.id === routeId);
    if (route) route.status = "in_progress";
    return route ?? null;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const [route] = await db
    .update(deliveryRoutes)
    .set({ status: "in_progress", updated_at: now })
    .where(eq(deliveryRoutes.id, routeId))
    .returning();

  if (!route) return null;

  const stops = await db
    .select({ order_id: routeStops.order_id })
    .from(routeStops)
    .where(eq(routeStops.route_id, routeId));

  if (stops.length > 0) {
    await db
      .update(orders)
      .set({ order_status: "out_for_delivery", updated_at: now })
      .where(inArray(orders.id, stops.map((s) => s.order_id)));
  }

  return route as DeliveryRoute;
}
