import { getOrders } from "@/lib/db/queries";
import { OrderTable } from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
