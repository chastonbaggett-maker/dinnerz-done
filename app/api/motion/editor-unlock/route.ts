import { NextResponse } from "next/server";
import { MOTION_EDITOR_COOKIE } from "@/lib/motion/publish-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MOTION_EDITOR_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
