import { getBusinessSettings } from "@/lib/db/queries";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
