import { MenuItemForm } from "@/components/admin/MenuItemForm";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New menu item</h1>
      <MenuItemForm />
    </div>
  );
}
