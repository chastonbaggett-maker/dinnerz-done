"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RouteDatePicker({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate);

  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1">
        <Label>Service date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
      </div>
      <Button type="button" variant="outline" onClick={() => router.push(`/admin/routes?date=${date}`)}>
        View
      </Button>
    </div>
  );
}
