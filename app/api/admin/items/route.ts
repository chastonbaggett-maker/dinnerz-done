import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { saveCustomizationGroups, upsertMenuItem } from "@/lib/db/queries";

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { groups, ...item } = await req.json();
  const saved = await upsertMenuItem(item);
  if (groups?.length) {
    await saveCustomizationGroups(saved.id, groups);
  }
  return NextResponse.json(saved);
}

export async function PUT(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { groups, ...item } = await req.json();
  const saved = await upsertMenuItem(item);
  await saveCustomizationGroups(saved.id, groups ?? []);
  return NextResponse.json(saved);
}
