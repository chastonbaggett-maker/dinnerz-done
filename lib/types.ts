export type CustomizationType = "single_choice" | "multi_choice" | "text" | "quantity";
export type ItemType = "meal" | "frozen_addon";
export type LineType = "meal" | "frozen_addon";

export type DailyMenuStatus = "draft" | "published" | "closed";
export type FulfillmentType = "delivery" | "pickup";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type RouteStatus = "planned" | "in_progress" | "completed";
export type OrderStatus =
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export interface BusinessSettings {
  id: string;
  business_name: string;
  timezone: string;
  default_cutoff_hour: number;
  default_cutoff_minute: number;
  delivery_fee_cents: number;
  min_order_cents: number;
  pickup_address: string | null;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  driver_delivery_fee_cents: number;
  premium_delivery_fee_cents: number;
  frozen_lunch_enabled: boolean;
  slot_duration_minutes: number;
  default_slot_start_hour: number;
  default_slot_end_hour: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price_cents: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  item_type: ItemType;
}

export interface CustomizationGroup {
  id: string;
  menu_item_id: string;
  name: string;
  type: CustomizationType;
  min_selections: number;
  max_selections: number;
  required: boolean;
  sort_order: number;
  options?: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  group_id: string;
  name: string;
  price_modifier_cents: number;
  sort_order: number;
}

export interface DailyMenu {
  id: string;
  service_date: string;
  order_cutoff_at: string;
  status: DailyMenuStatus;
}

export interface DailyMenuItem {
  id: string;
  daily_menu_id: string;
  menu_item_id: string;
  price_override_cents: number | null;
  max_quantity: number | null;
  sold_out: boolean;
  sort_order: number;
  menu_item?: MenuItem;
  customization_groups?: DailyCustomizationGroup[];
}

export interface DailyCustomizationGroup {
  id: string;
  daily_menu_item_id: string;
  source_group_id: string | null;
  name: string;
  type: CustomizationType;
  min_selections: number;
  max_selections: number;
  required: boolean;
  sort_order: number;
  options?: DailyCustomizationOption[];
}

export interface DailyCustomizationOption {
  id: string;
  group_id: string;
  source_option_id: string | null;
  name: string;
  price_modifier_cents: number;
  sort_order: number;
}

export interface DeliveryTimeSlot {
  id: string;
  service_date: string;
  window_start: string;
  window_end: string;
  max_orders: number;
  order_count: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
}

export interface DeliveryRoute {
  id: string;
  service_date: string;
  driver_id: string | null;
  status: RouteStatus;
  created_at: string;
  driver?: Driver;
  stops?: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  order_id: string;
  sequence: number;
  completed_at: string | null;
  order?: Order;
}

export interface CartCustomization {
  groupId: string;
  groupName: string;
  type: CustomizationType;
  selections: {
    optionId?: string;
    optionName: string;
    priceModifierCents: number;
    textValue?: string;
    quantity?: number;
  }[];
}

export interface CartLine {
  id: string;
  lineType: LineType;
  dailyMenuItemId?: string;
  menuItemId?: string;
  itemName: string;
  unitPriceCents: number;
  quantity: number;
  customizations: CartCustomization[];
}

export interface Order {
  id: string;
  daily_menu_id: string;
  order_number: number | null;
  clerk_user_id: string | null;
  customer_name: string;
  phone: string;
  email: string;
  fulfillment_type: FulfillmentType;
  delivery_address: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  premium_fee_cents: number;
  total_cents: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  stripe_session_id: string | null;
  notes: string | null;
  delivery_slot_id: string | null;
  requested_delivery_time: string | null;
  is_premium_delivery: boolean;
  route_id: string | null;
  route_sequence: number | null;
  driver_id: string | null;
  created_at: string;
  daily_menu?: DailyMenu;
  delivery_slot?: DeliveryTimeSlot | null;
  order_lines?: OrderLine[];
}

export interface OrderLine {
  id: string;
  order_id: string;
  daily_menu_item_id: string | null;
  menu_item_id: string | null;
  line_type: LineType;
  item_name: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  order_line_customizations?: OrderLineCustomization[];
}

export interface OrderLineCustomization {
  id: string;
  order_line_id: string;
  group_name: string;
  option_name: string;
  price_modifier_cents: number;
}

export interface CheckoutPayload {
  dailyMenuId: string;
  customerName: string;
  phone: string;
  email: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  deliverySlotId?: string;
  isPremiumDelivery?: boolean;
  requestedDeliveryTime?: string;
  notes?: string;
  lines: CartLine[];
}

export interface GenerateRoutesPayload {
  serviceDate: string;
  driverCount: number;
}

export interface DriverRouteSummary {
  route: DeliveryRoute;
  stops: RouteStop[];
  nextStop: RouteStop | null;
  completedCount: number;
  totalStops: number;
  driverPayCents: number;
}
