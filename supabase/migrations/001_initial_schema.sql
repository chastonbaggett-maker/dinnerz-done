-- Dinnerz Done initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Business settings (singleton row)
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'Dinnerz Done',
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  default_cutoff_hour INT NOT NULL DEFAULT 20,
  default_cutoff_minute INT NOT NULL DEFAULT 0,
  delivery_fee_cents INT NOT NULL DEFAULT 500,
  min_order_cents INT NOT NULL DEFAULT 1500,
  pickup_address TEXT,
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO business_settings (id) VALUES (gen_random_uuid());

-- Menu item templates
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price_cents INT NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customization groups on template items
CREATE TABLE customization_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'text', 'quantity')),
  min_selections INT NOT NULL DEFAULT 0,
  max_selections INT NOT NULL DEFAULT 1,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier_cents INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily menus
CREATE TABLE daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL UNIQUE,
  order_cutoff_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE daily_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_menu_id UUID NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  price_override_cents INT,
  max_quantity INT,
  sold_out BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (daily_menu_id, menu_item_id)
);

-- Customizations copied to daily menu items (optional overrides)
CREATE TABLE daily_customization_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_menu_item_id UUID NOT NULL REFERENCES daily_menu_items(id) ON DELETE CASCADE,
  source_group_id UUID REFERENCES customization_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_choice', 'multi_choice', 'text', 'quantity')),
  min_selections INT NOT NULL DEFAULT 0,
  max_selections INT NOT NULL DEFAULT 1,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE daily_customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES daily_customization_groups(id) ON DELETE CASCADE,
  source_option_id UUID REFERENCES customization_options(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price_modifier_cents INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_menu_id UUID NOT NULL REFERENCES daily_menus(id) ON DELETE RESTRICT,
  clerk_user_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  subtotal_cents INT NOT NULL,
  delivery_fee_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'received' CHECK (order_status IN ('received', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  daily_menu_item_id UUID NOT NULL REFERENCES daily_menu_items(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL,
  line_total_cents INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_line_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_line_id UUID NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  option_name TEXT NOT NULL,
  price_modifier_cents INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_daily_menus_service_date ON daily_menus(service_date);
CREATE INDEX idx_daily_menus_status ON daily_menus(status);
CREATE INDEX idx_orders_daily_menu_id ON orders(daily_menu_id);
CREATE INDEX idx_orders_clerk_user_id ON orders(clerk_user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_menu_items_active ON menu_items(active);

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_customizations ENABLE ROW LEVEL SECURITY;

-- Public read for published menus and settings
CREATE POLICY "Public read business settings" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Public read active menu items" ON menu_items FOR SELECT USING (active = true);
CREATE POLICY "Public read customization groups" ON customization_groups FOR SELECT USING (true);
CREATE POLICY "Public read customization options" ON customization_options FOR SELECT USING (true);
CREATE POLICY "Public read published daily menus" ON daily_menus FOR SELECT USING (status = 'published');
CREATE POLICY "Public read daily menu items" ON daily_menu_items FOR SELECT USING (true);
CREATE POLICY "Public read daily customization groups" ON daily_customization_groups FOR SELECT USING (true);
CREATE POLICY "Public read daily customization options" ON daily_customization_options FOR SELECT USING (true);

-- Service role handles writes (via server-side Supabase client)
