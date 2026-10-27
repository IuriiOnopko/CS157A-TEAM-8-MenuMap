/**
 * Ordering (OrderServlet) and table QR codes (TableTokenServlet).
 *
 * Dine-in orders carry the table's QR code token instead of an account, so
 * guests can order. Pickup orders need a signed-in customer.
 */
import { apiFetch } from "./http";

export type OrderMethod = "DINE_IN" | "PICKUP";
export type OrderStatus = "SUBMITTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";

export type OrderLine = { lineNum: number; name: string; unitPrice: number; quantity: number };

export type Order = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  method: OrderMethod;
  tableCode: string | null;
  status: OrderStatus;
  /** ISO-8601 instant */
  submittedAt: string;
  subtotal: number;
  tax: number;
  total: number;
  cancellationReason: string | null;
  items: OrderLine[];
};

export type NewOrder = {
  restaurantId: number;
  method: OrderMethod;
  /** The table's QR code token; required for DINE_IN. */
  token?: string;
  items: { categoryId: number; itemId: number; quantity: number }[];
};

export type TableInfo = {
  restaurantId: number;
  restaurantName: string;
  tableCode: string;
  isOpen: boolean;
  expiresAt: string;
};

/** GET /api/table — which restaurant and table a QR code belongs to. */
export function lookupTable(token: string): Promise<TableInfo> {
  return apiFetch<TableInfo>(`/table?token=${encodeURIComponent(token)}`);
}

/** POST /api/orders — the server prices the order and returns its id. */
export function placeOrder(order: NewOrder): Promise<{ orderId: number }> {
  return apiFetch<{ orderId: number }>("/orders", { method: "POST", body: JSON.stringify(order) });
}

/** GET /api/orders/{id} — guests pass the QR code token they ordered with. */
export function getOrder(id: number, token?: string): Promise<Order> {
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  return apiFetch<Order>(`/orders/${id}${qs}`);
}

/** GET /api/orders — the signed-in customer's history, newest first. */
export function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

/** Orders in these states won't change again, so their pages stop checking for updates. */
export const FINAL_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELED"];
