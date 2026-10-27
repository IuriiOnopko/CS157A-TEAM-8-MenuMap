import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../../api/http";
import { placeOrder } from "../../api/orders";
import { getRestaurant, OpeningHours, RestaurantDetail as Detail, RestaurantSummary } from "../../api/restaurants";
import { useCart } from "../../lib/cart";
import { formatDateTime, formatHours, priceLevel } from "../../lib/format";
import { useSession } from "../../session/SessionContext";
import CartBar from "../menu/CartBar";
import MenuList from "../menu/MenuList";
import TestCustomerPicker from "../TestCustomerPicker";
import { OpenStatus } from "./RestaurantList";

type Props = {
  restaurantId: number;
  onBack: () => void;
  /** Gives the map the restaurant's location once it has loaded. */
  onLoaded: (restaurant: RestaurantSummary) => void;
};

const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

/** One restaurant in the side panel: details, hours, and its menu with pickup ordering. */
export default function RestaurantDetail({ restaurantId, onBack, onLoaded }: Props) {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  // Waits for the session check and reloads after signing in, since the response says
  // whether this customer may order here
  const userId = user?.id;
  useEffect(() => {
    if (sessionLoading) return;
    const controller = new AbortController();
    getRestaurant(restaurantId, controller.signal)
      .then((d) => {
        setDetail(d);
        setError(null);
        onLoadedRef.current(d.restaurant);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      });
    return () => controller.abort();
  }, [restaurantId, userId, sessionLoading]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { orderId } = await placeOrder({ restaurantId, method: "PICKUP", items: cart.orderItems });
      navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
    } catch (e) {
      setSubmitError(errorMessage(e));
      setSubmitting(false);
    }
  };

  const r = detail?.restaurant;
  const canOrder = !!detail && detail.restaurant.isOpen && !detail.restriction;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 -ml-1 mb-3 px-1 py-1 rounded-md text-[14px] font-semibold text-sage hover:text-sage-dark"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All restaurants
        </button>

        {error && (
          <p role="alert" className="m-0 text-[14px] text-[#B42318]">
            {error}
          </p>
        )}
        {!detail && !error && <p className="m-0 text-[14px] text-muted-2">Loading menu…</p>}

        {detail && r && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="m-0 font-display text-2xl font-semibold leading-tight tracking-tight">{r.name}</h2>
                <span className="pt-1.5">
                  <OpenStatus isOpen={r.isOpen} />
                </span>
              </div>
              <p className="m-0 text-[14px] text-muted">
                {[r.cuisines.join(", "), priceLevel(r.priceLevel)].filter(Boolean).join(" · ")}
              </p>
              {r.description && <p className="m-0 text-[14px] leading-relaxed text-muted">{r.description}</p>}
            </div>

            <div className="flex flex-col gap-1 text-[14px] text-ink">
              <span>
                {r.streetAddress}, {r.city}, {r.state} {r.postalCode}
              </span>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="w-fit font-medium text-sage hover:text-sage-dark">
                  {r.phone}
                </a>
              )}
              <HoursList hours={detail.hours} />
            </div>

            {detail.restriction && (
              <div className="rounded-xl px-3.5 py-3 bg-[#FDECEC] text-[13.5px] text-[#912018]">
                <strong className="font-semibold">You can't order from {r.name}.</strong> {detail.restriction.reason}
                {detail.restriction.endsAt && <> Ends {formatDateTime(detail.restriction.endsAt)}.</>}
              </div>
            )}
            {!r.isOpen && !detail.restriction && (
              <div className="rounded-xl px-3.5 py-3 bg-[#F3EFE4] text-[13.5px] text-muted">
                {r.name} is closed right now. You can browse the menu, but ordering is paused.
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <h3 className="m-0 font-display text-xl font-semibold">Menu</h3>
                {canOrder && (
                  <p className="m-0 text-[13px] text-muted-2">
                    Order ahead for pickup. At the restaurant, scan the QR code on your table instead.
                  </p>
                )}
              </div>
              <MenuList menu={detail.menu} cart={cart} canOrder={canOrder} />
            </div>
          </div>
        )}
      </div>

      {canOrder && (
        <CartBar
          cart={cart}
          actionLabel="Place pickup order"
          note={user ? <>Pickup order for {user.name}</> : <>You'll be asked to sign in first.</>}
          submitting={submitting}
          error={submitError}
          onSubmit={() => (user ? submit() : setSignInOpen(true))}
        />
      )}

      {signInOpen && (
        <TestCustomerPicker
          reason="Sign in to order for pickup."
          onClose={() => setSignInOpen(false)}
          onSignedIn={() => {
            setSignInOpen(false);
            submit();
          }}
        />
      )}
    </div>
  );
}

/** Collapsible weekly hours, today's open first. */
function HoursList({ hours }: { hours: OpeningHours[] }) {
  const todayName = WEEKDAYS[(new Date().getDay() + 6) % 7]; // getDay() starts the week on Sunday
  const today = hours.find((h) => h.weekday === todayName);
  return (
    <details className="group">
      <summary className="w-fit cursor-pointer list-none text-[14px] text-muted hover:text-ink">
        <span className="font-medium text-ink">Today:</span> {today ? formatHours(today) : "Hours not listed"}{" "}
        <span className="text-sage font-semibold group-open:hidden">· All hours</span>
      </summary>
      <ul className="m-0 mt-2 p-0 list-none grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[13.5px]">
        {WEEKDAYS.map((day) => {
          const row = hours.find((h) => h.weekday === day);
          return (
            <li key={day} className={`contents ${day === todayName ? "font-semibold text-ink" : "text-muted"}`}>
              <span>{day.charAt(0) + day.slice(1).toLowerCase()}</span>
              <span>{row ? formatHours(row) : "Not listed"}</span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
