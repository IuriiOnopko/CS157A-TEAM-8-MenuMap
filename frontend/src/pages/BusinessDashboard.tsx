import React, { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../utils/currentUser";
import { useSession } from "../session/SessionContext";
import { getRestaurantOrders, updateOrderStatus, Order, OrderStatus, FINAL_STATUSES } from "../api/orders";
import { errorMessage } from "../api/http";

// Basic owner dashboard shown after a business login.
// Sections match the Business-Owner View in the project report.
// Orders are loaded and updated through UpdateOrderServlet (/api/update/orders);
// the menu, info and restrictions sections still show empty states.

const BASE = process.env.PUBLIC_URL;

type Tab = "overview" | "orders" | "menu" | "info" | "restrictions";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" /> },
  { key: "orders", label: "Orders", icon: <path d="M7 3h10l1 4H6l1-4ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Zm4 5h4M10 16h4" /> },
  { key: "menu", label: "Menu", icon: <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm4 5h6M9 13h6" /> },
  { key: "info", label: "Restaurant info", icon: <path d="M4 10 12 4l8 6v10H4V10Zm6 10v-6h4v6" /> },
  { key: "restrictions", label: "Restrictions", icon: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM5.6 5.6l12.8 12.8" /> },
];

const ORDER_STATUSES: { key: OrderStatus; label: string }[] = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELED", label: "Canceled" },
];

const STATUS_LABEL = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, s.label])) as Record<OrderStatus, string>;

// Orders tab order: completed orders sink to the bottom; within each group, newest first
function completedLastNewestFirst(a: Order, b: Order) {
  const completed = Number(a.status === "COMPLETED") - Number(b.status === "COMPLETED");
  return completed || Date.parse(b.submittedAt) - Date.parse(a.submittedAt) || b.id - a.id;
}

// the one forward step offered for each open order: Submitted → Preparing → Ready → Completed
const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  SUBMITTED: { status: "PREPARING", label: "Start Preparing" },
  PREPARING: { status: "READY", label: "Mark Ready" },
  READY: { status: "COMPLETED", label: "Mark Completed" },
};

export default function BusinessDashboard() {
  const stored = getCurrentUser();
  const user = stored && stored.role === "BUSINESS_OWNER" ? stored : null;
  const [tab, setTab] = useState<Tab>("overview");
  const { signOut } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // per-order update state: which order is saving, which one has the cancel form open, and errors
  const [savingId, setSavingId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [updateErrors, setUpdateErrors] = useState<Record<number, string>>({});

  // getCurrentUser() returns a new object every render, so depend on this flag instead of `user`
  const isOwner = user !== null;

  // loads the orders and returns them, so an update can check what the server actually saved
  const loadOrders = useCallback(async (): Promise<Order[] | null> => {
    try {
      const data = await getRestaurantOrders();
      setOrders(data);
      setOrdersError("");
      return data;
    } catch (err) {
      setOrdersError(errorMessage(err));
      return null;
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOwner) {
      setOrdersLoading(false);
      return;
    }
    loadOrders();
  }, [isOwner, loadOrders]);

  async function changeStatus(order: Order, status: OrderStatus, reason?: string) {
    setSavingId(order.id);
    setUpdateErrors(({ [order.id]: _, ...rest }) => rest);
    try {
      await updateOrderStatus(order.id, status, reason);
      // UpdateOrderServlet answers ok even if no row changed, so confirm against a fresh load
      const fresh = await loadOrders();
      const saved = fresh?.find((o) => o.id === order.id);
      if (fresh && saved?.status !== status) {
        setUpdateErrors((e) => ({ ...e, [order.id]: "The order wasn't updated. Try signing in again." }));
      } else if (status === "CANCELED") {
        setCancelingId(null);
        setCancelReason("");
      }
    } catch (err) {
      setUpdateErrors((e) => ({ ...e, [order.id]: errorMessage(err) }));
    } finally {
      setSavingId(null);
    }
  }

  // signOut also ends the server session (the business login signs in there too)
  async function logOut() {
    await signOut().catch(() => {}); // still go to the login page if the server can't be reached
    window.location.href = `${BASE}/business/login`;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream font-body text-ink flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl px-6 py-10">
          <h1 className="font-display text-[28px] font-semibold tracking-tight">Business login required</h1>
          <p className="mt-2 text-[15px] text-muted">Log in with your business account to open the dashboard.</p>
          <a
            href={`${BASE}/business/login`}
            className="mt-6 inline-flex h-11 px-6 items-center justify-center rounded-[10px] bg-ink text-[#FBF6EC] text-[15px] font-semibold hover:bg-black transition"
          >
            Go to business login
          </a>
        </div>
      </div>
    );
  }

  const current = TABS.find((t) => t.key === tab)!;

  const today = new Date().toDateString();

  const ordersToday = orders.filter(
  (order) => new Date(order.submittedAt).toDateString() === today).length;

  const openOrders = orders.filter((order) =>
    order.status === "SUBMITTED" ||
    order.status === "PREPARING" ||
    order.status === "READY"
  ).length;

  const recentOrders = orders.slice(0, 5);

  const shownOrders = (statusFilter === "ALL" ? [...orders] : orders.filter((order) => order.status === statusFilter)).sort(
    completedLastNewestFirst
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      {/* Top bar */}
      <header className="bg-ink text-[#FBF6EC]">
        <div className="px-5 md:px-8 py-3.5 flex items-center gap-3">
          {/* items-baseline puts the BUSINESS pill's text on the MenuMap wordmark's baseline, so it stays put
              if fonts or sizes change; the icon opts back into centering. The pill's -translate-y-0.5 then
              raises it 2px above that baseline, which is where it looked right by eye. */}
          <div className="flex items-baseline gap-3">
            <a href={`${BASE}/`} className="flex items-baseline gap-2.5">
              <span className="self-center w-8 h-8 rounded-[9px] bg-[#FBF6EC] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z" stroke="#1B211A" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.6" fill="#1B211A" />
                </svg>
              </span>
              {/* leading-8 matches the icon's height, so the wordmark stays centered beside it */}
              <span className="font-display text-xl leading-8 font-semibold tracking-tight">MenuMap</span>
            </a>
            <span className="-translate-y-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#FBF6EC]/15 rounded-full px-2.5 py-1">
              Business
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline text-sm text-[#FBF6EC]/70 truncate max-w-[240px]">{user.email}</span>
            <button
              onClick={logOut}
              className="px-3.5 py-1.5 rounded-[9px] text-sm font-semibold border border-[#FBF6EC]/25 hover:bg-[#FBF6EC]/10 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar (top tabs on mobile) */}
        <nav className="md:w-60 md:shrink-0 md:border-r border-b md:border-b-0 border-border bg-[#F4F0E6] px-3 py-3 md:py-6 flex md:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2.5 shrink-0 rounded-[10px] px-3 py-2 text-[14px] font-semibold text-left transition-colors ${
                  on ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink hover:bg-card/60"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-5 md:px-10 py-8 md:py-10 max-w-5xl">
          <h1 className="font-display text-[30px] font-semibold tracking-tight">{current.label}</h1>

          {tab === "overview" && (
            <>
              <p className="mt-1 text-[15px] text-muted">Welcome back. Here's how your restaurant is doing today.</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-3">
          
                <StatTile label="Orders today" value={ordersToday} />
                <StatTile label="Open orders" value={openOrders} />
                <StatTile label="Total orders" value={orders.length} />
                
              </div>
              <SectionCard title="Recent orders">
  {ordersLoading ? (
    <p className="text-sm text-muted">Loading orders...</p>
  ) : ordersError ? (
    <p className="text-sm text-red-600">{ordersError}</p>
  ) : recentOrders.length === 0 ? (
    <EmptyState
      title="No orders yet"
      body="New dine-in and pickup orders will show up here as customers place them."
    />
  ) : (
    <div className="space-y-3">
      {recentOrders.map((order) => (
        <div
          key={order.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
        >
          <div>
            <p className="font-semibold text-[15px]">
              Order #{order.id}
            </p>
            <p className="text-sm text-muted">
              {order.method === "DINE_IN" ? "Dine-in" : "Pickup"}
              {order.tableCode ? ` · Table ${order.tableCode}` : ""}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              ${order.total.toFixed(2)}
            </p>
            <p className="text-sm text-muted">{STATUS_LABEL[order.status]}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</SectionCard>
            </>
          )}

          {tab === "orders" && (
            <>
              <p className="mt-1 text-[15px] text-muted">Track incoming orders and update their status.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[{ key: "ALL" as const, label: "All" }, ...ORDER_STATUSES].map((s) => {
                  const on = s.key === statusFilter;
                  const count = s.key === "ALL" ? orders.length : orders.filter((o) => o.status === s.key).length;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setStatusFilter(s.key)}
                      aria-pressed={on}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
                        on ? "bg-ink text-[#FBF6EC] border-ink" : "bg-card text-muted border-border-strong hover:text-ink"
                      }`}
                    >
                      {s.label} <span className={on ? "text-[#FBF6EC]/60" : "text-muted-2"}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <SectionCard title="Orders">
  {ordersLoading ? (
    <p className="text-sm text-muted">Loading orders...</p>
  ) : ordersError ? (
    <p className="text-sm text-red-600">{ordersError}</p>
  ) : orders.length === 0 ? (
    <EmptyState
      title="No orders yet"
      body="When customers order, you'll move them from Submitted to Preparing, Ready and Completed here."
    />
  ) : shownOrders.length === 0 ? (
    <EmptyState
      title={`No ${STATUS_LABEL[statusFilter as OrderStatus].toLowerCase()} orders`}
      body="Pick another status above to see the rest of your orders."
    />
  ) : (
    <div className="space-y-4">
      {shownOrders.map((order) => (
        <div
          key={order.id}
          className="border border-border rounded-xl p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[16px]">
                Order #{order.id}
              </p>

              <p className="mt-1 text-sm text-muted">
                {order.method === "DINE_IN" ? "Dine-in" : "Pickup"}
                {order.tableCode ? ` · Table ${order.tableCode}` : ""}
              </p>

              <p className="mt-1 text-sm text-muted">
                {new Date(order.submittedAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                ${order.total.toFixed(2)}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {STATUS_LABEL[order.status]}
              </p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              {order.items.map((item) => (
                <p key={item.lineNum} className="text-sm text-muted">
                  {item.quantity} × {item.name}
                </p>
              ))}
            </div>
          )}

          {order.status === "CANCELED" && order.cancellationReason && (
            <p className="mt-3 text-sm text-muted">Reason: {order.cancellationReason}</p>
          )}

          {!FINAL_STATUSES.includes(order.status) && (
            <OrderActions
              order={order}
              saving={savingId === order.id}
              busy={savingId !== null}
              canceling={cancelingId === order.id}
              reason={cancelReason}
              onReasonChange={setCancelReason}
              onAdvance={(status) => changeStatus(order, status)}
              onStartCancel={() => {
                setCancelingId(order.id);
                setCancelReason("");
              }}
              onConfirmCancel={() => changeStatus(order, "CANCELED", cancelReason.trim())}
              onBack={() => setCancelingId(null)}
            />
          )}

          {updateErrors[order.id] && <p className="mt-2 text-sm text-red-600">{updateErrors[order.id]}</p>}
        </div>
      ))}
    </div>
  )}
</SectionCard>
            </>
          )}

          {tab === "menu" && (
            <>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] text-muted">Manage your categories, items, prices and availability.</p>
                <button disabled className="h-10 px-4 rounded-[10px] bg-sage text-[#FBF6EC] text-sm font-semibold opacity-50 cursor-not-allowed">
                  + Add category
                </button>
              </div>
              <SectionCard title="Categories">
                <EmptyState title="Your menu is empty" body="Add a category like “Starters” or “Drinks”, then add items to it." />
              </SectionCard>
            </>
          )}

          {tab === "info" && (
            <>
              <p className="mt-1 text-[15px] text-muted">What customers see on your restaurant page.</p>
              <SectionCard title="Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Restaurant name" />
                  <ReadOnlyField label="Phone" />
                  <ReadOnlyField label="Street address" wide />
                  <ReadOnlyField label="Description" wide tall />
                </div>
              </SectionCard>
              <SectionCard title="Hours">
                <EmptyState title="No hours set" body="Opening hours for each day of the week will appear here." />
              </SectionCard>
            </>
          )}

          {tab === "restrictions" && (
            <>
              <p className="mt-1 text-[15px] text-muted">Pause ordering or block specific customers.</p>
              <SectionCard title="Ordering">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[15px]">Accept new orders</p>
                    <p className="text-sm text-muted">Turn this off to temporarily stop all customer orders.</p>
                  </div>
                  <span className="w-11 h-6 rounded-full bg-sage relative shrink-0 opacity-60" aria-hidden>
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
                  </span>
                </div>
              </SectionCard>
              <SectionCard title="Blocked customers">
                <EmptyState title="No blocked customers" body="Customers you block won't be able to order from your restaurant." />
              </SectionCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-4">
      <p className="text-[12.5px] font-bold uppercase tracking-wide text-muted-2">
        {label}
      </p>
      <p className="mt-2 font-display text-[32px] font-semibold leading-none">
        {value}
      </p>
    </div>
  );
}

// Buttons under an open order: its next step, or Cancel (which asks for a reason first).
function OrderActions({
  order,
  saving,
  busy,
  canceling,
  reason,
  onReasonChange,
  onAdvance,
  onStartCancel,
  onConfirmCancel,
  onBack,
}: {
  order: Order;
  saving: boolean;
  busy: boolean;
  canceling: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onAdvance: (status: OrderStatus) => void;
  onStartCancel: () => void;
  onConfirmCancel: () => void;
  onBack: () => void;
}) {
  const next = NEXT_STEP[order.status];
  const button = "h-9 px-3.5 rounded-[9px] text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

  if (canceling) {
    return (
      <form
        className="mt-4 pt-3 border-t border-border"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirmCancel();
        }}
      >
        <label htmlFor={`cancel-reason-${order.id}`} className="block text-[13px] font-semibold mb-1.5">
          Why is order #{order.id} being canceled?
        </label>
        <input
          id={`cancel-reason-${order.id}`}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          maxLength={500}
          required
          autoFocus
          placeholder="e.g. Out of salmon"
          className="w-full h-10 px-3 rounded-[10px] border-[1.5px] border-border bg-cream/60 text-sm focus:outline-none focus:border-ink"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="submit" disabled={busy || !reason.trim()} className={`${button} bg-red-600 text-white hover:bg-red-700`}>
            {saving ? "Canceling…" : "Cancel Order"}
          </button>
          <button type="button" onClick={onBack} disabled={saving} className={`${button} border border-border-strong hover:bg-cream`}>
            Keep Order
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
      {next && (
        <button onClick={() => onAdvance(next.status)} disabled={busy} className={`${button} bg-ink text-[#FBF6EC] hover:bg-black`}>
          {saving ? "Saving…" : next.label}
        </button>
      )}
      <button onClick={onStartCancel} disabled={busy} className={`${button} border border-border-strong text-red-600 hover:bg-cream`}>
        Cancel
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 bg-card border border-border rounded-2xl">
      <h2 className="px-5 pt-4 pb-3 border-b border-border text-[14px] font-semibold">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-8">
      <p className="font-semibold text-[15px]">{title}</p>
      <p className="mt-1 text-sm text-muted max-w-sm mx-auto">{body}</p>
    </div>
  );
}

function ReadOnlyField({ label, wide = false, tall = false }: { label: string; wide?: boolean; tall?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[13px] font-semibold mb-1.5">{label}</p>
      <div className={`rounded-[10px] border-[1.5px] border-border bg-cream/60 ${tall ? "h-20" : "h-11"}`} />
    </div>
  );
}
