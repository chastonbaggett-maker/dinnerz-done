import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { markOrderPaid } from "@/lib/db/queries";
import { getStripe } from "@/lib/stripe/client";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await markOrderPaid(
        orderId,
        session.id,
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id
      );
    }
  }

  return NextResponse.json({ received: true });
}
