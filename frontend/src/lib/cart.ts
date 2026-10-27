import { useState } from "react";
import type { MenuItem } from "../api/restaurants";

export type CartLine = { item: MenuItem; quantity: number };

const MAX_QUANTITY = 99; // matches OrderServlet

const sameItem = (a: MenuItem, b: MenuItem) => a.categoryId === b.categoryId && a.itemId === b.itemId;

/**
 * The items picked from one restaurant's menu. Prices here are only for
 * display; the server prices the order again when it's placed.
 */
export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const quantityOf = (item: MenuItem) => lines.find((l) => sameItem(l.item, item))?.quantity ?? 0;

  const add = (item: MenuItem) =>
    setLines((prev) => {
      const existing = prev.find((l) => sameItem(l.item, item));
      if (!existing) return [...prev, { item, quantity: 1 }];
      return prev.map((l) => (l === existing ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QUANTITY) } : l));
    });

  const remove = (item: MenuItem) =>
    setLines((prev) =>
      prev.flatMap((l) => {
        if (!sameItem(l.item, item)) return [l];
        return l.quantity > 1 ? [{ ...l, quantity: l.quantity - 1 }] : [];
      })
    );

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
  const orderItems = lines.map((l) => ({
    categoryId: l.item.categoryId,
    itemId: l.item.itemId,
    quantity: l.quantity,
  }));

  return { lines, quantityOf, add, remove, count, subtotal, orderItems };
}

export type Cart = ReturnType<typeof useCart>;
