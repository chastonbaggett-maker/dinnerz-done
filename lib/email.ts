import type { Order } from "@/lib/types";
import { formatCents, formatServiceDate } from "@/lib/dates";
import { formatOrderNumber } from "@/lib/delivery/slots";

export async function sendOrderConfirmationEmail(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "orders@dinnerzdone.com";

  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — skipping confirmation for", order.email);
    return;
  }

  const serviceDate = order.daily_menu?.service_date
    ? formatServiceDate(order.daily_menu.service_date)
    : "your selected date";

  const lines = (order.order_lines ?? [])
    .map((l) => `${l.quantity}x ${l.item_name} — ${formatCents(l.line_total_cents)}`)
    .join("\n");

  const orderLabel = formatOrderNumber(order.order_number, order.daily_menu?.service_date);

  const body = {
    from,
    to: order.email,
    subject: `Order ${orderLabel} confirmed — Dinnerz Done`,
    text: `Hi ${order.customer_name},

Your order ${orderLabel} for ${serviceDate} is confirmed!

${lines}

Total: ${formatCents(order.total_cents)}
Fulfillment: ${order.fulfillment_type}
${order.delivery_address ? `Address: ${order.delivery_address}` : ""}

Thank you for ordering with Dinnerz Done!`,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[email] Failed to send confirmation:", await res.text());
  }
}
