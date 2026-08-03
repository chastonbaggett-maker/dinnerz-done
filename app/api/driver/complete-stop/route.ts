import { NextResponse } from "next/server";
import { completeRouteStop } from "@/lib/db/routes";

export async function POST(req: Request) {
  const { stopId } = await req.json();
  if (!stopId) return NextResponse.json({ error: "stopId required" }, { status: 400 });
  const stop = await completeRouteStop(stopId);
  return NextResponse.json(stop);
}
