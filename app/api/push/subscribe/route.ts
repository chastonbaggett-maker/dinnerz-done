import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const subscriptions = new Map<string, string>();

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const subscription = await request.json();
  subscriptions.set(userId, JSON.stringify(subscription));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ subscribed: false });
  }

  return NextResponse.json({ subscribed: subscriptions.has(userId) });
}
