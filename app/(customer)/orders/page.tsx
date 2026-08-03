import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrdersForUser } from "@/lib/db/queries";
import { TrackOrdersView } from "@/components/orders/TrackOrdersView";

export default async function TrackOrdersPage() {
  const { userId } = await auth();
  const orders = userId ? await getOrdersForUser(userId) : [];

  if (orders.length === 1) {
    redirect(`/order/${orders[0].id}`);
  }

  return <TrackOrdersView orders={orders} />;
}
