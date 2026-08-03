import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { generateDeliveryRoutes } from "@/lib/db/routes";

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { serviceDate, driverCount } = await req.json();
  const routes = await generateDeliveryRoutes(serviceDate, driverCount);
  return NextResponse.json(routes);
}
