import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { publishDailyMenu } from "@/lib/db/queries";

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { serviceDate } = await req.json();
  const menu = await publishDailyMenu(serviceDate);
  return NextResponse.json(menu);
}
