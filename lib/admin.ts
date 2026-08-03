import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;

  const role = user.publicMetadata?.role as string | undefined;
  if (role === "admin") return true;

  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return adminIds.includes(user.id);
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
}

export async function getOptionalUserId() {
  const { userId } = await auth();
  return userId;
}
