import { NextResponse } from "next/server";
import { readPublishedMotionSpecs } from "@/lib/motion/published-store";

export async function GET() {
  const specs = await readPublishedMotionSpecs();
  return NextResponse.json(specs);
}
