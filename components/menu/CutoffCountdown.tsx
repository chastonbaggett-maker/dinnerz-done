"use client";

import { useEffect, useState } from "react";
import { formatCutoffCountdownAt } from "@/lib/dates";

interface CutoffCountdownProps {
  cutoffAt: string;
  timezone: string;
}

export function CutoffCountdown({ cutoffAt, timezone }: CutoffCountdownProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cutoffAt]);

  return <span className="tabular-nums">{formatCutoffCountdownAt(cutoffAt, timezone, elapsedMs)}</span>;
}
