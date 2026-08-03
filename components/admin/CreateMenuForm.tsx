"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTomorrowDateString } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateMenuForm() {
  const router = useRouter();
  const [date, setDate] = useState(getTomorrowDateString());
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceDate: date }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Menu created");
      router.push(`/admin/menus/${date}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
      <Button onClick={handleCreate} disabled={loading}>
        Create menu
      </Button>
    </div>
  );
}
