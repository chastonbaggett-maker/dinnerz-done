import { auth } from "@clerk/nextjs/server";
import { getOrdersForUser } from "@/lib/db/queries";
import { TrackOrdersView } from "@/components/orders/TrackOrdersView";

export default async function TrackOrdersPage() {
  const { userId } = await auth();
  const orders = userId ? await getOrdersForUser(userId) : [];

  return <TrackOrdersView orders={orders} />;
}
