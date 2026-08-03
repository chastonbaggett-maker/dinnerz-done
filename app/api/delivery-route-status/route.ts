import { auth } from "@clerk/nextjs/server";
import { hasDeliveryInRouteForUser } from "@/lib/orders/delivery-route-status";

export async function GET() {
  const { userId } = await auth();
  const inRoute = userId ? await hasDeliveryInRouteForUser(userId) : false;

  return Response.json(
    { inRoute },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
