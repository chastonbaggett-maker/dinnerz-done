import { NextResponse } from "next/server";
import { startRoute } from "@/lib/db/routes";

export async function POST(req: Request) {
  const { routeId } = await req.json();
  if (!routeId) return NextResponse.json({ error: "routeId required" }, { status: 400 });
  const route = await startRoute(routeId);
  return NextResponse.json(route);
}
