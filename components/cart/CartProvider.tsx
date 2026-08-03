"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { calculateCartSubtotal, generateCartLineId } from "@/lib/orders/pricing";

interface CartContextValue {
  lines: CartLine[];
  dailyMenuId: string | null;
  serviceDate: string | null;
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  setMenuContext: (dailyMenuId: string, serviceDate: string) => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  updateLine: (id: string, line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "dinnerz-done-cart";

interface StoredCart {
  lines: CartLine[];
  dailyMenuId: string | null;
  serviceDate: string | null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [dailyMenuId, setDailyMenuId] = useState<string | null>(null);
  const [serviceDate, setServiceDate] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCart;
        setLines(parsed.lines ?? []);
        setDailyMenuId(parsed.dailyMenuId ?? null);
        setServiceDate(parsed.serviceDate ?? null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: StoredCart = { lines, dailyMenuId, serviceDate };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [lines, dailyMenuId, serviceDate, hydrated]);

  const setMenuContext = useCallback(
    (menuId: string, date: string) => {
      if (dailyMenuId && dailyMenuId !== menuId) {
        setLines([]);
      }
      setDailyMenuId(menuId);
      setServiceDate(date);
    },
    [dailyMenuId]
  );

  const addLine = useCallback((line: Omit<CartLine, "id">) => {
    setLines((prev) => [...prev, { ...line, id: generateCartLineId() }]);
  }, []);

  const updateLine = useCallback((id: string, line: Omit<CartLine, "id">) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...line, id } : l)));
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotalCents = useMemo(() => calculateCartSubtotal(lines), [lines]);

  const value = useMemo(
    () => ({
      lines,
      dailyMenuId,
      serviceDate,
      itemCount,
      subtotalCents,
      hydrated,
      setMenuContext,
      addLine,
      updateLine,
      removeLine,
      clearCart,
    }),
    [lines, dailyMenuId, serviceDate, itemCount, subtotalCents, hydrated, setMenuContext, addLine, updateLine, removeLine, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
