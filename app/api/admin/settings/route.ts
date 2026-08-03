import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { updateBusinessSettings } from "@/lib/db/queries";

export async function PUT(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const updates = await req.json();
  const settings = await updateBusinessSettings(updates);
  return NextResponse.json(settings);
}
