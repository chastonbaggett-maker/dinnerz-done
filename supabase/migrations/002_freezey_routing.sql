-- Freezey Lunches, delivery windows, order numbers, driver routing

-- Business settings extensions
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS driver_delivery_fee_cents INT NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS premium_delivery_fee_cents INT NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS frozen_lunch_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS slot_duration_minutes INT NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS default_slot_start_hour INT NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS default_slot_end_hour INT NOT NULL DEFAULT 20;

-- Menu item types (meal vs frozen add-on)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'meal'
    CHECK (item_type IN ('meal', 'frozen_addon'));

-- Delivery time slots (2-hour windows by default)
CREATE TABLE IF NOT EXISTS delivery_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  window_start TIME NOT NULL,
  window_end TIME NOT NULL,
  max_orders INT NOT NULL DEFAULT 25,
  order_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_date, window_start, window_end)
);

CREATE INDEX IF NOT EXISTS idx_delivery_slots_date ON delivery_time_slots(service_date);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery routes
CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_routes_date ON delivery_routes(service_date);

-- Route stops (ordered delivery sequence)
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE (route_id, order_id),
  UNIQUE (route_id, sequence)
);

-- Order extensions
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number INT,
  ADD COLUMN IF NOT EXISTS delivery_slot_id UUID REFERENCES delivery_time_slots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_delivery_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_premium_delivery BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_fee_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES delivery_routes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS route_sequence INT,
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_service_date_number ON orders(daily_menu_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_route ON orders(route_id, route_sequence);

-- Order lines: support frozen add-ons without daily menu item
ALTER TABLE order_lines
  ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS line_type TEXT NOT NULL DEFAULT 'meal'
    CHECK (line_type IN ('meal', 'frozen_addon'));

ALTER TABLE order_lines
  ALTER COLUMN daily_menu_item_id DROP NOT NULL;

-- Per-day order number sequence helper
CREATE TABLE IF NOT EXISTS order_number_counters (
  service_date DATE PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

-- Seed sample frozen add-ons
INSERT INTO menu_items (name, description, base_price_cents, item_type, sort_order, active) VALUES
  ('Freezey Chili Lunch', 'Hearty beef chili packed in a freezer-ready container. Heat and eat for an easy lunch.', 799, 'frozen_addon', 101, true),
  ('Freezey Chicken Soup', 'Homemade chicken vegetable soup, perfect for the freezer.', 799, 'frozen_addon', 102, true),
  ('Freezey Pasta Bake', 'Baked ziti with marinara and cheese — freeze and reheat anytime.', 799, 'frozen_addon', 103, true)
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, phone, active) VALUES
  ('Driver 1', NULL, true),
  ('Driver 2', NULL, true)
ON CONFLICT DO NOTHING;

ALTER TABLE delivery_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read delivery slots" ON delivery_time_slots FOR SELECT USING (true);
