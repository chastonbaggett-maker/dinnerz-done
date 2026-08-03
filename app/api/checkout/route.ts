import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import {
  createOrder,
  getBusinessSettings,
  updateOrderStripeSession,
  markOrderPaid,
  getDailyMenuById,
} from "@/lib/db/queries";
import { canPlaceOrderToday } from "@/lib/orders/cutoff";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import type { CartLine, CheckoutPayload } from "@/lib/types";

const checkoutSchema = z.object({
  dailyMenuId: z.string(),
  customerName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().optional(),
  deliverySlotId: z.string().optional(),
  isPremiumDelivery: z.boolean().optional(),
  requestedDeliveryTime: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(z.custom<CartLine>()).min(1),
});

export async function POST(req: Request) {
  try {
    const body = checkoutSchema.parse(await req.json()) as CheckoutPayload;
    const settings = await getBusinessSettings();
    const { userId } = await auth();

    const menu = await getDailyMenuById(body.dailyMenuId);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (!canPlaceOrderToday(menu, settings.timezone)) {
      return NextResponse.json({ error: "Ordering is closed for this menu" }, { status: 400 });
    }

    if (body.fulfillmentType === "delivery" && !settings.delivery_enabled) {
      return NextResponse.json({ error: "Delivery is not available" }, { status: 400 });
    }

    if (body.fulfillmentType === "pickup" && !settings.pickup_enabled) {
      return NextResponse.json({ error: "Pickup is not available" }, { status: 400 });
    }

    const order = await createOrder(body, userId);

    if (!isStripeConfigured()) {
      await markOrderPaid(order.id, "demo_session");
      return NextResponse.json({ orderId: order.id, demo: true });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Dinnerz Done — ${menu.service_date}`,
              description: `${body.lines.length} item(s)`,
            },
            unit_amount: order.total_cents,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${appUrl}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
    });

    await updateOrderStripeSession(order.id, session.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
