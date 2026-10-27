/**
 * Dine-in orders placed from this browser, with the table QR code each was
 * placed with. A guest has no account, so this is how they get back to their
 * order's status page; the server lets anyone holding the code view the order.
 */
type GuestOrder = { orderId: number; token: string };

const STORAGE_KEY = "menumap.guestOrders";
const MAX_REMEMBERED = 50;

export function guestOrders(): GuestOrder[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function rememberGuestOrder(order: GuestOrder): void {
  const others = guestOrders().filter((o) => o.orderId !== order.orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...others].slice(0, MAX_REMEMBERED)));
}

export function guestTokenFor(orderId: number): string | undefined {
  return guestOrders().find((o) => o.orderId === orderId)?.token;
}
