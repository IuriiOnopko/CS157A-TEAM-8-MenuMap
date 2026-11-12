import { useEffect, useState } from "react";
import type { MenuItem } from "../api/restaurants";

export type CartLine = { item: MenuItem; quantity: number };

const MAX_QUANTITY = 99; // matches OrderServlet

const sameItem = (a: MenuItem, b: MenuItem) => a.categoryId === b.categoryId && a.itemId === b.itemId;

// A cart put aside while the customer goes to the login page (sessionStorage: this tab only)
const STASH_KEY = "menumap.cart";
type Stash = { key: string; lines: CartLine[] };

function readStash(key: string): CartLine[] {
  try {
    const stash = JSON.parse(sessionStorage.getItem(STASH_KEY) ?? "null") as Stash | null;
    return stash?.key === key ? stash.lines : [];
  } catch {
    return [];
  }
}

function clearStash(key: string) {
  try {
    if (readStash(key).length > 0) sessionStorage.removeItem(STASH_KEY);
  } catch {
    // storage blocked (private mode etc.)
  }
}

/**
 * The items picked from one restaurant's menu. Prices here are only for
 * display; the server prices the order again when it's placed.
 *
 * `stashKey` names this cart (e.g. one per restaurant) so stash() can keep it
 * while the customer logs in, and it comes back when they return to the page.
 */
export function useCart(stashKey: string) {
  const [lines, setLines] = useState<CartLine[]>(() => readStash(stashKey));

  // A stashed cart is picked up once, then forgotten
  useEffect(() => {
    clearStash(stashKey);
  }, [stashKey]);

  const stash = () => {
    const stash: Stash = { key: stashKey, lines };
    try {
      sessionStorage.setItem(STASH_KEY, JSON.stringify(stash));
    } catch {
      // storage blocked: the customer just picks the items again
    }
  };

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

  return { lines, quantityOf, add, remove, count, subtotal, orderItems, stash };
}

export type Cart = ReturnType<typeof useCart>;
