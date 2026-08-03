import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { createOrUpdateDailyMenu } from "@/lib/db/queries";

async function guardAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const { serviceDate } = await req.json();
  const menu = await createOrUpdateDailyMenu(serviceDate);
  return NextResponse.json(menu);
}
