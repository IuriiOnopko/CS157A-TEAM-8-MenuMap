import React, { useState } from "react";
import type { Cart } from "../../lib/cart";
import { formatMoney, plural } from "../../lib/format";
import { QuantityStepper } from "./MenuList";

type Props = {
  cart: Cart;
  /** e.g. "Place pickup order" */
  actionLabel: string;
  /** Extra line above the button, e.g. who the order is for. */
  note?: React.ReactNode;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
};

/** Order summary pinned under a menu. Hidden while the cart is empty. */
export default function CartBar({ cart, actionLabel, note, submitting, error, onSubmit }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (cart.count === 0) return null;

  return (
    <div className="border-t border-border bg-card px-4 py-3 flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex items-center justify-between gap-3 text-left"
      >
        <span className="text-[14px] font-semibold text-ink">Your order · {plural(cart.count, "item")}</span>
        <span className="flex items-center gap-1.5 text-[14px] font-semibold tabular-nums text-ink">
          {formatMoney(cart.subtotal)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={expanded ? "rotate-180" : ""}>
            <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {expanded && (
        <ul className="m-0 p-0 list-none flex flex-col gap-2 max-h-48 overflow-y-auto">
          {cart.lines.map((line) => (
            <li key={`${line.item.categoryId}:${line.item.itemId}`} className="flex items-center gap-3">
              <span className="flex-1 min-w-0 text-[13.5px] text-ink truncate">{line.item.name}</span>
              <span className="text-[13px] tabular-nums text-muted-2">
                {formatMoney(line.item.price * line.quantity)}
              </span>
              <QuantityStepper
                name={line.item.name}
                quantity={line.quantity}
                onAdd={() => cart.add(line.item)}
                onRemove={() => cart.remove(line.item)}
              />
            </li>
          ))}
        </ul>
      )}

      {note && <div className="text-[12.5px] text-muted">{note}</div>}
      {error && (
        <p role="alert" className="m-0 text-[13px] font-medium text-[#B42318]">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-[10px] text-[15px] font-semibold bg-sage text-[#FBF6EC] hover:bg-sage-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Placing order…" : actionLabel}
      </button>
      <p className="m-0 text-[12px] text-muted-2 text-center">Tax is added when the order is placed.</p>
    </div>
  );
}
