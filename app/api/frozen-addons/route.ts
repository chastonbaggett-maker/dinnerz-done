import { NextResponse } from "next/server";
import { getFrozenAddons } from "@/lib/db/queries";

export async function GET() {
  const items = await getFrozenAddons();
  return NextResponse.json(items);
}
