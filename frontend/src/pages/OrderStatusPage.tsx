import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { errorMessage } from "../api/http";
import { FINAL_STATUSES, getOrder, Order, OrderStatus } from "../api/orders";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import { formatDateTime, formatMoney } from "../lib/format";
import { guestTokenFor } from "../lib/guestOrders";
import { useSession } from "../session/SessionContext";

const REFRESH_MS = 10000;
const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "SUBMITTED", label: "Sent" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "COMPLETED", label: "Completed" },
];

/**
 * /orders/:orderId — confirmation after ordering, then live status. The page
 * checks for updates every few seconds until the order is completed or
 * canceled, so the customer sees when it's ready.
 */
export default function OrderStatusPage() {
  const { orderId } = useParams();
  const id = Number(orderId);
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced ?? false;
  const { user, loading: sessionLoading } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (sessionLoading) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const latest = await getOrder(id, guestTokenFor(id));
        if (cancelled) return;
        setOrder(latest);
        setError(null);
        if (!FINAL_STATUSES.includes(latest.status)) timer = setTimeout(load, REFRESH_MS);
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, userId, sessionLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {error && !order && (
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-3xl font-semibold">Order not found</h1>
            <p className="m-0 text-[15px] text-muted">
              {error} Orders can be viewed by the account that placed them, or on the device a table order was
              placed from.
            </p>
            <Link to="/orders" className="w-fit text-[14px] font-semibold text-sage hover:text-sage-dark">
              Your orders
            </Link>
          </div>
        )}
        {!order && !error && <p className="m-0 text-[15px] text-muted-2">Loading your order…</p>}

        {order && (
          <>
            {justPlaced && (
              <div role="status" className="rounded-2xl px-5 py-4 bg-sage text-[#FBF6EC]">
                <p className="m-0 font-display text-xl font-semibold">Order placed</p>
                <p className="m-0 mt-1 text-[14.5px] text-[#DCE7D8]">
                  {order.restaurantName} has your order. This page updates on its own as they work on it.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold tracking-wide uppercase text-muted-2">
                Order #{order.id} · {order.method === "PICKUP" ? "Pickup" : `Dine-in, table ${order.tableCode}`}
              </span>
              <h1 className="m-0 font-display text-3xl font-semibold tracking-tight">{order.restaurantName}</h1>
              <span className="text-[14px] text-muted">Placed {formatDateTime(order.submittedAt)}</span>
            </div>

            <section className="bg-card border border-border rounded-2xl px-5 py-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="m-0 text-[15px] font-semibold">Status</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              {order.status === "CANCELED" ? (
                <p className="m-0 text-[14.5px] text-[#912018]">
                  This order was canceled{order.cancellationReason ? `: ${order.cancellationReason}` : "."}
                </p>
              ) : (
                <>
                  <StatusSteps status={order.status} />
                  <p className="m-0 text-[14.5px] text-muted">{statusMessage(order)}</p>
                </>
              )}
              {!FINAL_STATUSES.includes(order.status) && (
                <p className="m-0 text-[12.5px] text-muted-2">Checking for updates every few seconds.</p>
              )}
            </section>

            <section className="bg-card border border-border rounded-2xl px-5 py-5 flex flex-col gap-3">
              <h2 className="m-0 text-[15px] font-semibold">Items</h2>
              <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {order.items.map((line) => (
                  <li key={line.lineNum} className="flex justify-between gap-3 text-[14.5px]">
                    <span>
                      <span className="font-semibold tabular-nums">{line.quantity}×</span> {line.name}
                    </span>
                    <span className="tabular-nums text-muted">{formatMoney(line.unitPrice * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="m-0 pt-3 border-t border-border grid grid-cols-[1fr_auto] gap-y-1 text-[14px]">
                <dt className="text-muted">Subtotal</dt>
                <dd className="m-0 text-right tabular-nums">{formatMoney(order.subtotal)}</dd>
                <dt className="text-muted">Tax</dt>
                <dd className="m-0 text-right tabular-nums">{formatMoney(order.tax)}</dd>
                <dt className="font-semibold">Total</dt>
                <dd className="m-0 text-right font-semibold tabular-nums">{formatMoney(order.total)}</dd>
              </dl>
            </section>

            <div className="flex flex-wrap gap-4">
              <Link to="/orders" className="text-[14px] font-semibold text-sage hover:text-sage-dark">
                All your orders
              </Link>
              <Link to="/restaurants" className="text-[14px] font-semibold text-sage hover:text-sage-dark">
                Back to the map
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function statusMessage(order: Order): string {
  switch (order.status) {
    case "SUBMITTED":
      return "The restaurant has your order and will start on it soon.";
    case "PREPARING":
      return "The kitchen is preparing your order.";
    case "READY":
      return order.method === "PICKUP"
        ? `Your order is ready. Pick it up at ${order.restaurantName}.`
        : `Your order is ready and on its way to table ${order.tableCode}.`;
    case "COMPLETED":
      return "All done. Enjoy your meal!";
    default:
      return "";
  }
}

function StatusSteps({ status }: { status: OrderStatus }) {
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="m-0 p-0 list-none grid grid-cols-4 gap-2">
      {STEPS.map((step, i) => (
        <li key={step.status} className="flex flex-col gap-1.5">
          <span className={`h-1.5 rounded-full ${i <= current ? "bg-sage" : "bg-border"}`} />
          <span className={`text-[12.5px] ${i === current ? "font-semibold text-ink" : "text-muted-2"}`}>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
