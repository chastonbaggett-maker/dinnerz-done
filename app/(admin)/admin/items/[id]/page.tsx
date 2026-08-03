import { notFound } from "next/navigation";
import { getMenuItemWithCustomizations } from "@/lib/db/queries";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getMenuItemWithCustomizations(id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit menu item</h1>
      <MenuItemForm item={item} />
    </div>
  );
}
