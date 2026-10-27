import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api/http";
import { lookupTable, placeOrder, TableInfo } from "../api/orders";
import { getRestaurant, RestaurantDetail } from "../api/restaurants";
import CartBar from "../components/menu/CartBar";
import MenuList from "../components/menu/MenuList";
import TestCustomerPicker from "../components/TestCustomerPicker";
import { useCart } from "../lib/cart";
import { rememberGuestOrder } from "../lib/guestOrders";
import { useSession } from "../session/SessionContext";

/**
 * /table/:token — where a table's QR code leads. The code works as the
 * authorization token: anyone at the table can order without an account.
 * If they are signed in, the order is also saved to their account's history.
 */
export default function TableOrderPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [table, setTable] = useState<TableInfo | null>(null);
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  // Waits for the session check and reloads after signing in, so a restriction on this customer shows up
  const userId = user?.id;
  useEffect(() => {
    if (sessionLoading) return;
    let cancelled = false;
    lookupTable(token)
      .then((info) => {
        if (cancelled) return;
        setTable(info);
        return getRestaurant(info.restaurantId).then((d) => !cancelled && setDetail(d));
      })
      .catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [token, userId, sessionLoading]);

  const submit = async () => {
    if (!table) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { orderId } = await placeOrder({
        restaurantId: table.restaurantId,
        method: "DINE_IN",
        token,
        items: cart.orderItems,
      });
      rememberGuestOrder({ orderId, token });
      navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
    } catch (e) {
      setSubmitError(errorMessage(e));
      setSubmitting(false);
    }
  };

  const isOpen = detail?.restaurant.isOpen ?? false;
  const canOrder = !!detail && isOpen && !detail.restriction;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            MenuMap
          </Link>
          {user ? (
            <span className="text-[13px] text-muted">Signed in as {user.name}</span>
          ) : (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="text-[13px] font-semibold text-sage hover:text-sage-dark"
            >
              Sign in to save this order
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col gap-5">
        {error && (
          <div className="bg-card border border-border rounded-2xl px-5 py-6 flex flex-col gap-2">
            <h1 className="m-0 font-display text-2xl font-semibold">Can't open this table</h1>
            <p role="alert" className="m-0 text-[15px] text-muted">
              {error}
            </p>
            <Link to="/restaurants" className="w-fit text-[14px] font-semibold text-sage hover:text-sage-dark">
              Browse restaurants instead
            </Link>
          </div>
        )}
        {!error && !detail && <p className="m-0 text-[15px] text-muted-2">Loading the menu…</p>}

        {table && detail && (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold tracking-wide uppercase text-sage">
                Dine-in · Table {table.tableCode}
              </span>
              <h1 className="m-0 font-display text-3xl font-semibold tracking-tight">{table.restaurantName}</h1>
              <p className="m-0 text-[14.5px] text-muted">
                {user
                  ? `Ordering as ${user.name}. This order will also appear in your order history.`
                  : "Ordering as a guest. You can follow the order from this device."}
              </p>
            </div>

            {detail.restriction && (
              <div className="rounded-xl px-4 py-3 bg-[#FDECEC] text-[14px] text-[#912018]">
                <strong className="font-semibold">You can't order here.</strong> {detail.restriction.reason}
              </div>
            )}
            {!isOpen && (
              <div className="rounded-xl px-4 py-3 bg-[#F3EFE4] text-[14px] text-muted">
                {table.restaurantName} isn't taking orders right now. Please ask the staff.
              </div>
            )}

            <MenuList menu={detail.menu} cart={cart} canOrder={canOrder} />
          </>
        )}
      </main>

      {canOrder && cart.count > 0 && (
        <div className="sticky bottom-0 z-40">
          <div className="max-w-2xl mx-auto sm:px-5 sm:pb-4">
            <div className="sm:rounded-2xl overflow-hidden sm:border sm:border-border shadow-[0_-8px_30px_rgba(27,33,26,0.12)]">
              <CartBar
                cart={cart}
                actionLabel="Send order to the kitchen"
                note={`Table ${table?.tableCode} · dine-in`}
                submitting={submitting}
                error={submitError}
                onSubmit={submit}
              />
            </div>
          </div>
        </div>
      )}

      {signInOpen && (
        <TestCustomerPicker
          reason="Sign in to save this order to your account. You can also order as a guest."
          onClose={() => setSignInOpen(false)}
          onSignedIn={() => setSignInOpen(false)}
        />
      )}
    </div>
  );
}
