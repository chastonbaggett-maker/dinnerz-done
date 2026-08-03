import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { addItemToDailyMenu, removeDailyMenuItem, updateDailyMenuItem } from "@/lib/db/queries";

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { dailyMenuId, menuItemId } = await req.json();
  const item = await addItemToDailyMenu(dailyMenuId, menuItemId);
  return NextResponse.json(item);
}

export async function PATCH(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, ...updates } = await req.json();
  const item = await updateDailyMenuItem(id, updates);
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await removeDailyMenuItem(id);
  return NextResponse.json({ ok: true });
}
