import { NextResponse } from "next/server";
import { getDeliverySlots, ensureDeliverySlots } from "@/lib/db/routes";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  await ensureDeliverySlots(date);
  const slots = await getDeliverySlots(date);
  return NextResponse.json(slots);
}
