import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";

export const MOTION_EDITOR_COOKIE = "dd_motion_editor";

export async function canPublishMotionSpecs() {
  if (await isAdmin()) return true;

  const cookieStore = await cookies();
  return cookieStore.get(MOTION_EDITOR_COOKIE)?.value === "1";
}
