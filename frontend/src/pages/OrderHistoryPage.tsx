import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/http";
import { getMyOrders, getOrder, Order } from "../api/orders";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import TestCustomerPicker from "../components/TestCustomerPicker";
import { formatDateTime, formatMoney } from "../lib/format";
import { guestOrders } from "../lib/guestOrders";
import { useSession } from "../session/SessionContext";

/**
 * /orders — order history: the signed-in customer's orders from the server,
 * plus any table orders placed as a guest on this device.
 */
export default function OrderHistoryPage() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const userId = user?.id;
  useEffect(() => {
    if (sessionLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const mine = userId !== undefined ? await getMyOrders() : [];
        const guest = await Promise.all(
          guestOrders()
            .filter((g) => !mine.some((o) => o.id === g.orderId))
            .map((g) => getOrder(g.orderId, g.token).catch(() => null)) // skip orders that can't be found any more
        );
        const all = [...mine, ...guest.filter((o): o is Order => o !== null)];
        all.sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
        if (!cancelled) {
          setOrders(all);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, sessionLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-3xl font-semibold tracking-tight">Your orders</h1>
          <p className="m-0 text-[15px] text-muted">
            {user ? `Signed in as ${user.name}.` : "Table orders placed as a guest on this device."}
          </p>
        </div>

        {error && (
          <p role="alert" className="m-0 text-[14.5px] text-[#B42318]">
            {error}
          </p>
        )}
        {!orders && !error && <p className="m-0 text-[15px] text-muted-2">Loading your orders…</p>}

        {orders && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl px-6 py-6 flex flex-col gap-3">
            <p className="m-0 text-[15px] text-muted">
              {user ? "You haven't placed any orders yet." : "No orders yet. Sign in to see your account's orders."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/restaurants"
                className="px-4 py-2.5 rounded-[10px] text-[14px] font-semibold bg-sage text-[#FBF6EC] hover:bg-sage-dark transition-colors"
              >
                Find a restaurant
              </Link>
              {!user && (
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="px-4 py-2.5 rounded-[10px] text-[14px] font-semibold border-[1.5px] border-border-strong hover:border-sage hover:text-sage transition-colors"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="block bg-card border border-border rounded-2xl px-5 py-4 hover:border-sage transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[16px] text-ink">{order.restaurantName}</span>
                      <span className="text-[13px] text-muted-2">
                        {formatDateTime(order.submittedAt)} ·{" "}
                        {order.method === "PICKUP" ? "Pickup" : `Dine-in, table ${order.tableCode}`} · #{order.id}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-[14px] text-muted">
                      {order.items.map((line) => `${line.quantity}× ${line.name}`).join(", ")}
                    </span>
                    <span className="font-semibold text-[15px] tabular-nums">{formatMoney(order.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />

      {signInOpen && (
        <TestCustomerPicker
          reason="Sign in to see your order history."
          onClose={() => setSignInOpen(false)}
          onSignedIn={() => setSignInOpen(false)}
        />
      )}
    </div>
  );
}
