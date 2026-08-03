"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import {
  formatTime12,
  generatePremiumTimeOptions,
  getOverallDeliveryWindow,
} from "@/lib/delivery/slots";
import type { DeliveryTimeSlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 56;
const WHEEL_HEIGHT = 280;
const PADDING_ITEMS = 2;
const PADDING_Y = PADDING_ITEMS * ITEM_HEIGHT;

interface PremiumTimePickerProps {
  slots: DeliveryTimeSlot[];
  value: string;
  onChange: (time: string) => void;
}

function getItemVisual(index: number, scrollTop: number) {
  const itemCenterY = PADDING_Y + index * ITEM_HEIGHT + ITEM_HEIGHT / 2;
  const viewportCenterY = scrollTop + WHEEL_HEIGHT / 2;
  const distance = Math.abs(itemCenterY - viewportCenterY);
  const influence = Math.max(0, 1 - distance / (ITEM_HEIGHT * 1.5));
  const scale = 1 + influence * 0.4;
  const opacity = 0.3 + influence * 0.7;

  return { scale, opacity, isCentered: influence > 0.85 };
}

function TimeWheel({
  options,
  initialValue,
  onChange,
}: {
  options: string[];
  initialValue: string;
  onChange: (value: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const selectedRef = useRef(initialValue);
  selectedRef.current = initialValue;

  const updateVisuals = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    itemRefs.current.forEach((item, index) => {
      const label = labelRefs.current[index];
      if (!item || !label) return;

      const { scale, opacity, isCentered } = getItemVisual(index, scrollTop);
      label.style.transform = `scale(${scale})`;
      label.style.opacity = String(opacity);
      item.dataset.centered = isCentered ? "true" : "false";
    });
  }, []);

  const getNearestIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 0;
    const index = Math.round(container.scrollTop / ITEM_HEIGHT);
    return Math.max(0, Math.min(options.length - 1, index));
  }, [options.length]);

  const commitSelection = useCallback(() => {
    const index = getNearestIndex();
    const next = options[index];
    if (next && next !== selectedRef.current) {
      selectedRef.current = next;
      onChange(next);
    }
    updateVisuals();
  }, [getNearestIndex, onChange, options, updateVisuals]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      if (!container) return;
      container.scrollTo({ top: index * ITEM_HEIGHT, behavior });
    },
    []
  );

  useLayoutEffect(() => {
    const index = Math.max(0, options.indexOf(initialValue));
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = index * ITEM_HEIGHT;
    }
    updateVisuals();
    // Only position the wheel when it first mounts for this dialog session.
  }, [initialValue, options, updateVisuals]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function onScroll() {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateVisuals();
        rafRef.current = null;
      });

      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = window.setTimeout(() => {
        commitSelection();
      }, 80);
    }

    function onScrollEnd() {
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      commitSelection();
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("scrollend", onScrollEnd);

    return () => {
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("scrollend", onScrollEnd);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [commitSelection, updateVisuals]);

  function handleItemClick(index: number) {
    scrollToIndex(index);
    const next = options[index];
    if (next) {
      selectedRef.current = next;
      onChange(next);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-14 -translate-y-1/2 rounded-xl border-2 border-emerald-600/50 bg-emerald-600/8" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-popover to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-popover to-transparent" />

      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          height: WHEEL_HEIGHT,
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "y mandatory",
          scrollPaddingTop: WHEEL_HEIGHT / 2 - ITEM_HEIGHT / 2,
          scrollPaddingBottom: WHEEL_HEIGHT / 2 - ITEM_HEIGHT / 2,
          paddingTop: PADDING_Y,
          paddingBottom: PADDING_Y,
        }}
      >
        {options.map((option, index) => (
          <button
            key={option}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            onClick={() => handleItemClick(index)}
            className={cn(
              "flex w-full snap-center items-center justify-center tabular-nums",
              "data-[centered=true]:font-semibold data-[centered=true]:text-foreground",
              "data-[centered=false]:font-medium data-[centered=false]:text-muted-foreground"
            )}
            style={{ height: ITEM_HEIGHT }}
          >
            <span
              ref={(el) => {
                labelRefs.current[index] = el;
              }}
              className="inline-block origin-center text-xl will-change-transform sm:text-2xl"
            >
              {formatTime12(option)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PremiumTimePicker({ slots, value, onChange }: PremiumTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(value);
  const [wheelSession, setWheelSession] = useState(0);
  const options = useMemo(() => generatePremiumTimeOptions(slots), [slots]);
  const window = useMemo(() => getOverallDeliveryWindow(slots), [slots]);

  useEffect(() => {
    if (!open) return;

    if (value && options.includes(value)) {
      setDraftTime(value);
    } else if (options.length > 0) {
      setDraftTime(options[Math.floor(options.length / 2)] ?? options[0]);
    }

    setWheelSession((session) => session + 1);
  }, [open, options, value]);

  function handleConfirm() {
    if (draftTime) onChange(draftTime);
    setOpen(false);
  }

  if (options.length === 0 || !window) {
    return (
      <Button type="button" variant="outline" disabled className="mt-1 h-12 w-full justify-between px-3 font-normal">
        No delivery windows available
      </Button>
    );
  }

  return (
    <>
      <button
        id="requested-time"
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "mt-1 flex h-14 w-full items-center justify-between rounded-xl border border-input bg-transparent px-4 text-left text-base transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
        )}
      >
        <span className={value ? "text-lg font-medium" : "text-muted-foreground"}>
          {value ? formatTime12(value) : "Select arrival time"}
        </span>
        <Clock className="size-5 text-muted-foreground" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5 rounded-2xl p-5 sm:max-w-md">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-xl">Choose arrival time</DialogTitle>
            <DialogDescription className="text-base">
              Pick a time between {formatTime12(window.start)} and {formatTime12(window.end)}.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <TimeWheel
              key={wheelSession}
              options={options}
              initialValue={draftTime}
              onChange={setDraftTime}
            />
          ) : null}

          <DialogFooter className="grid grid-cols-1 gap-3 border-t-0 bg-transparent p-0 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full text-base"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" className="h-14 w-full text-base" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
