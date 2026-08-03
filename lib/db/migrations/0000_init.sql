-- Dinnerz Done — Turso (SQLite) schema

CREATE TABLE IF NOT EXISTS business_settings (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Dinnerz Done',
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  default_cutoff_hour INTEGER NOT NULL DEFAULT 20,
  default_cutoff_minute INTEGER NOT NULL DEFAULT 0,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 500,
  min_order_cents INTEGER NOT NULL DEFAULT 1500,
  pickup_address TEXT,
  delivery_enabled INTEGER NOT NULL DEFAULT 1,
  pickup_enabled INTEGER NOT NULL DEFAULT 1,
  driver_delivery_fee_cents INTEGER NOT NULL DEFAULT 300,
  premium_delivery_fee_cents INTEGER NOT NULL DEFAULT 500,
  frozen_lunch_enabled INTEGER NOT NULL DEFAULT 1,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 120,
  default_slot_start_hour INTEGER NOT NULL DEFAULT 16,
  default_slot_end_hour INTEGER NOT NULL DEFAULT 20,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'meal' CHECK (item_type IN ('meal', 'frozen_addon')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customization_groups (
  id TEXT PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'text', 'quantity')),
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER NOT NULL DEFAULT 1,
  required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customization_options (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_menus (
  id TEXT PRIMARY KEY,
  service_date TEXT NOT NULL UNIQUE,
  order_cutoff_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_menu_items (
  id TEXT PRIMARY KEY,
  daily_menu_id TEXT NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  price_override_cents INTEGER,
  max_quantity INTEGER,
  sold_out INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (daily_menu_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS daily_customization_groups (
  id TEXT PRIMARY KEY,
  daily_menu_item_id TEXT NOT NULL REFERENCES daily_menu_items(id) ON DELETE CASCADE,
  source_group_id TEXT REFERENCES customization_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'text', 'quantity')),
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER NOT NULL DEFAULT 1,
  required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_customization_options (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES daily_customization_groups(id) ON DELETE CASCADE,
  source_option_id TEXT REFERENCES customization_options(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price_modifier_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS delivery_time_slots (
  id TEXT PRIMARY KEY,
  service_date TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  max_orders INTEGER NOT NULL DEFAULT 25,
  order_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (service_date, window_start, window_end)
);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS delivery_routes (
  id TEXT PRIMARY KEY,
  service_date TEXT NOT NULL,
  driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  daily_menu_id TEXT NOT NULL REFERENCES daily_menus(id) ON DELETE RESTRICT,
  order_number INTEGER,
  clerk_user_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  premium_fee_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'received' CHECK (order_status IN ('received', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  delivery_slot_id TEXT REFERENCES delivery_time_slots(id) ON DELETE SET NULL,
  requested_delivery_time TEXT,
  is_premium_delivery INTEGER NOT NULL DEFAULT 0,
  route_id TEXT REFERENCES delivery_routes(id) ON DELETE SET NULL,
  route_sequence INTEGER,
  driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_lines (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  daily_menu_item_id TEXT REFERENCES daily_menu_items(id) ON DELETE RESTRICT,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  line_type TEXT NOT NULL DEFAULT 'meal' CHECK (line_type IN ('meal', 'frozen_addon')),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_line_customizations (
  id TEXT PRIMARY KEY,
  order_line_id TEXT NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  option_name TEXT NOT NULL,
  price_modifier_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS route_stops (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  completed_at TEXT,
  UNIQUE (route_id, order_id),
  UNIQUE (route_id, sequence)
);

CREATE TABLE IF NOT EXISTS order_number_counters (
  service_date TEXT PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_daily_menus_service_date ON daily_menus(service_date);
CREATE INDEX IF NOT EXISTS idx_daily_menus_status ON daily_menus(status);
CREATE INDEX IF NOT EXISTS idx_orders_daily_menu_id ON orders(daily_menu_id);
CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id ON orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(active);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_date ON delivery_time_slots(service_date);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_date ON delivery_routes(service_date);
CREATE INDEX IF NOT EXISTS idx_orders_route ON orders(route_id, route_sequence);

INSERT OR IGNORE INTO business_settings (id) VALUES (lower(hex(randomblob(16))));

INSERT OR IGNORE INTO menu_items (id, name, description, base_price_cents, item_type, sort_order, active) VALUES
  (lower(hex(randomblob(16))), 'Freezey Chili Lunch', 'Hearty beef chili packed in a freezer-ready container.', 799, 'frozen_addon', 101, 1),
  (lower(hex(randomblob(16))), 'Freezey Chicken Soup', 'Homemade chicken vegetable soup, perfect for the freezer.', 799, 'frozen_addon', 102, 1),
  (lower(hex(randomblob(16))), 'Freezey Pasta Bake', 'Baked ziti with marinara and cheese — freeze and reheat anytime.', 799, 'frozen_addon', 103, 1);

INSERT OR IGNORE INTO drivers (id, name, phone, active) VALUES
  (lower(hex(randomblob(16))), 'Driver 1', NULL, 1),
  (lower(hex(randomblob(16))), 'Driver 2', NULL, 1);
