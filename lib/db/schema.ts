import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const businessSettings = sqliteTable("business_settings", {
  id: text("id").primaryKey(),
  business_name: text("business_name").notNull(),
  timezone: text("timezone").notNull(),
  default_cutoff_hour: integer("default_cutoff_hour").notNull(),
  default_cutoff_minute: integer("default_cutoff_minute").notNull(),
  delivery_fee_cents: integer("delivery_fee_cents").notNull(),
  min_order_cents: integer("min_order_cents").notNull(),
  pickup_address: text("pickup_address"),
  delivery_enabled: integer("delivery_enabled", { mode: "boolean" }).notNull(),
  pickup_enabled: integer("pickup_enabled", { mode: "boolean" }).notNull(),
  driver_delivery_fee_cents: integer("driver_delivery_fee_cents").notNull(),
  premium_delivery_fee_cents: integer("premium_delivery_fee_cents").notNull(),
  frozen_lunch_enabled: integer("frozen_lunch_enabled", { mode: "boolean" }).notNull(),
  slot_duration_minutes: integer("slot_duration_minutes").notNull(),
  default_slot_start_hour: integer("default_slot_start_hour").notNull(),
  default_slot_end_hour: integer("default_slot_end_hour").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  base_price_cents: integer("base_price_cents").notNull(),
  image_url: text("image_url"),
  active: integer("active", { mode: "boolean" }).notNull(),
  sort_order: integer("sort_order").notNull(),
  item_type: text("item_type").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const customizationGroups = sqliteTable("customization_groups", {
  id: text("id").primaryKey(),
  menu_item_id: text("menu_item_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  min_selections: integer("min_selections").notNull(),
  max_selections: integer("max_selections").notNull(),
  required: integer("required", { mode: "boolean" }).notNull(),
  sort_order: integer("sort_order").notNull(),
  created_at: text("created_at").notNull(),
});

export const customizationOptions = sqliteTable("customization_options", {
  id: text("id").primaryKey(),
  group_id: text("group_id").notNull(),
  name: text("name").notNull(),
  price_modifier_cents: integer("price_modifier_cents").notNull(),
  sort_order: integer("sort_order").notNull(),
  created_at: text("created_at").notNull(),
});

export const dailyMenus = sqliteTable("daily_menus", {
  id: text("id").primaryKey(),
  service_date: text("service_date").notNull().unique(),
  order_cutoff_at: text("order_cutoff_at").notNull(),
  status: text("status").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const dailyMenuItems = sqliteTable("daily_menu_items", {
  id: text("id").primaryKey(),
  daily_menu_id: text("daily_menu_id").notNull(),
  menu_item_id: text("menu_item_id").notNull(),
  price_override_cents: integer("price_override_cents"),
  max_quantity: integer("max_quantity"),
  sold_out: integer("sold_out", { mode: "boolean" }).notNull(),
  sort_order: integer("sort_order").notNull(),
  created_at: text("created_at").notNull(),
});

export const dailyCustomizationGroups = sqliteTable("daily_customization_groups", {
  id: text("id").primaryKey(),
  daily_menu_item_id: text("daily_menu_item_id").notNull(),
  source_group_id: text("source_group_id"),
  name: text("name").notNull(),
  type: text("type").notNull(),
  min_selections: integer("min_selections").notNull(),
  max_selections: integer("max_selections").notNull(),
  required: integer("required", { mode: "boolean" }).notNull(),
  sort_order: integer("sort_order").notNull(),
});

export const dailyCustomizationOptions = sqliteTable("daily_customization_options", {
  id: text("id").primaryKey(),
  group_id: text("group_id").notNull(),
  source_option_id: text("source_option_id"),
  name: text("name").notNull(),
  price_modifier_cents: integer("price_modifier_cents").notNull(),
  sort_order: integer("sort_order").notNull(),
});

export const deliveryTimeSlots = sqliteTable("delivery_time_slots", {
  id: text("id").primaryKey(),
  service_date: text("service_date").notNull(),
  window_start: text("window_start").notNull(),
  window_end: text("window_end").notNull(),
  max_orders: integer("max_orders").notNull(),
  order_count: integer("order_count").notNull(),
  created_at: text("created_at").notNull(),
});

export const drivers = sqliteTable("drivers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  active: integer("active", { mode: "boolean" }).notNull(),
  created_at: text("created_at").notNull(),
});

export const deliveryRoutes = sqliteTable("delivery_routes", {
  id: text("id").primaryKey(),
  service_date: text("service_date").notNull(),
  driver_id: text("driver_id"),
  status: text("status").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  daily_menu_id: text("daily_menu_id").notNull(),
  order_number: integer("order_number"),
  clerk_user_id: text("clerk_user_id"),
  customer_name: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  fulfillment_type: text("fulfillment_type").notNull(),
  delivery_address: text("delivery_address"),
  subtotal_cents: integer("subtotal_cents").notNull(),
  delivery_fee_cents: integer("delivery_fee_cents").notNull(),
  premium_fee_cents: integer("premium_fee_cents").notNull(),
  total_cents: integer("total_cents").notNull(),
  payment_status: text("payment_status").notNull(),
  order_status: text("order_status").notNull(),
  stripe_session_id: text("stripe_session_id"),
  stripe_payment_intent_id: text("stripe_payment_intent_id"),
  notes: text("notes"),
  delivery_slot_id: text("delivery_slot_id"),
  requested_delivery_time: text("requested_delivery_time"),
  is_premium_delivery: integer("is_premium_delivery", { mode: "boolean" }).notNull(),
  route_id: text("route_id"),
  route_sequence: integer("route_sequence"),
  driver_id: text("driver_id"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const orderLines = sqliteTable("order_lines", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull(),
  daily_menu_item_id: text("daily_menu_item_id"),
  menu_item_id: text("menu_item_id"),
  line_type: text("line_type").notNull(),
  item_name: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit_price_cents: integer("unit_price_cents").notNull(),
  line_total_cents: integer("line_total_cents").notNull(),
  created_at: text("created_at").notNull(),
});

export const orderLineCustomizations = sqliteTable("order_line_customizations", {
  id: text("id").primaryKey(),
  order_line_id: text("order_line_id").notNull(),
  group_name: text("group_name").notNull(),
  option_name: text("option_name").notNull(),
  price_modifier_cents: integer("price_modifier_cents").notNull(),
});

export const routeStops = sqliteTable("route_stops", {
  id: text("id").primaryKey(),
  route_id: text("route_id").notNull(),
  order_id: text("order_id").notNull(),
  sequence: integer("sequence").notNull(),
  completed_at: text("completed_at"),
});

export const orderNumberCounters = sqliteTable("order_number_counters", {
  service_date: text("service_date").primaryKey(),
  last_number: integer("last_number").notNull(),
});

export function newId() {
  return crypto.randomUUID();
}

export { sql };
