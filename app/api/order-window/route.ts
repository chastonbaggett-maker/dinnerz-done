import { isOrderWindowOpen } from "@/lib/orders/order-window-status";

export async function GET() {
  const open = await isOrderWindowOpen();
  return Response.json(
    { open },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
