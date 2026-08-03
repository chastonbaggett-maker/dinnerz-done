import { NextResponse } from "next/server";
import { getBusinessSettings } from "@/lib/db/queries";

export async function GET() {
  const settings = await getBusinessSettings();
  return NextResponse.json(settings);
}
