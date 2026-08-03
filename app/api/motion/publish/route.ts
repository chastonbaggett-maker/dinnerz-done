import { NextResponse } from "next/server";
import { canPublishMotionSpecs } from "@/lib/motion/publish-auth";
import { writePublishedMotionSpecs } from "@/lib/motion/published-store";
import { normalizeMotionDocument } from "@/lib/motion/document";
import type { MotionSpecDocument } from "@/lib/motion/types";

export async function PUT(req: Request) {
  const allowed = await canPublishMotionSpecs();
  if (!allowed) {
    return NextResponse.json(
      { error: "Unauthorized. Unlock the motion editor (10 taps on Home) or sign in as admin." },
      { status: 403 }
    );
  }

  const body = normalizeMotionDocument((await req.json()) as MotionSpecDocument);
  if (!body || body.version !== 1 || !Array.isArray(body.rules)) {
    return NextResponse.json({ error: "Invalid motion spec document" }, { status: 400 });
  }

  const saved = await writePublishedMotionSpecs(body);
  return NextResponse.json(saved);
}
