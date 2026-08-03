import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { updateOrderStatus } from "@/lib/db/queries";
import type { Order } from "@/lib/types";

export async function PATCH(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, orderStatus } = await req.json();
  const order = await updateOrderStatus(id, orderStatus as Order["order_status"]);
  return NextResponse.json(order);
}
