import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { writePublishedMotionSpecs } from "@/lib/motion/published-store";
import type { MotionSpecDocument } from "@/lib/motion/types";

export async function PUT(req: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = (await req.json()) as MotionSpecDocument;
  if (!body || body.version !== 1 || !Array.isArray(body.rules)) {
    return NextResponse.json({ error: "Invalid motion spec document" }, { status: 400 });
  }

  const saved = await writePublishedMotionSpecs(body);
  return NextResponse.json(saved);
}
