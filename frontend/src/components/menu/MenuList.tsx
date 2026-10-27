import React from "react";
import type { MenuCategory, MenuItem } from "../../api/restaurants";
import type { Cart } from "../../lib/cart";
import { formatMoney } from "../../lib/format";

type Props = {
  menu: MenuCategory[];
  cart: Cart;
  /** false hides the Add buttons (restaurant closed, customer restricted, ...) */
  canOrder: boolean;
};

/**
 * A restaurant's menu with everything the proposal lists per item: name,
 * description, price, availability, nutrition and dietary classifications
 * (plus allergens, worked out from the ingredients).
 */
export default function MenuList({ menu, cart, canOrder }: Props) {
  const categories = menu.filter((c) => c.items.length > 0);
  if (categories.length === 0) {
    return <p className="m-0 text-[14px] text-muted">This restaurant hasn't posted its menu yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`menu-category-${category.id}`}>
          <h3 id={`menu-category-${category.id}`} className="m-0 font-display text-lg font-semibold">
            {category.name}
          </h3>
          {category.description && <p className="m-0 mt-0.5 text-[13px] text-muted-2">{category.description}</p>}
          <ul className="m-0 mt-3 p-0 list-none flex flex-col gap-3">
            {category.items.map((item) => (
              <MenuItemCard
                key={item.itemId}
                item={item}
                quantity={cart.quantityOf(item)}
                canOrder={canOrder}
                onAdd={() => cart.add(item)}
                onRemove={() => cart.remove(item)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function MenuItemCard({
  item,
  quantity,
  canOrder,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  quantity: number;
  canOrder: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const n = item.nutrition;
  return (
    <li
      className={`bg-card border border-border rounded-xl px-4 py-3.5 flex flex-col gap-2 ${
        item.isAvailable ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold text-[15px] text-ink">{item.name}</span>
            {!item.isAvailable && (
              <span className="text-[11px] font-bold uppercase tracking-wide text-clay">Unavailable</span>
            )}
          </div>
          {item.description && (
            <p className="m-0 mt-0.5 text-[13.5px] leading-snug text-muted">{item.description}</p>
          )}
        </div>
        <span className="font-semibold text-[15px] tabular-nums text-ink">{formatMoney(item.price)}</span>
      </div>

      {n && (
        <p className="m-0 text-[12.5px] leading-relaxed text-muted-2">
          <span className="font-semibold text-muted">{Math.round(n.calories)} kcal</span> ·{" "}
          {Math.round(n.proteinG)}g protein · {Math.round(n.carbohydratesG)}g carbs · {Math.round(n.fatG)}g fat ·{" "}
          {Math.round(n.sodiumMg)}mg sodium · per {n.servingSize}
        </p>
      )}

      {(item.dietary.length > 0 || item.allergens.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.dietary.map((diet) => (
            <span key={diet} className="px-2 py-0.5 rounded-full bg-[#EFF3EA] text-sage text-[12px] font-semibold">
              {diet}
            </span>
          ))}
          {item.allergens.length > 0 && (
            <span className="text-[12px] text-muted-2">Contains: {item.allergens.join(", ")}</span>
          )}
        </div>
      )}

      {canOrder && item.isAvailable && (
        <div className="flex justify-end">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              className="px-3.5 py-1.5 rounded-lg text-[13.5px] font-semibold border-[1.5px] border-sage text-sage hover:bg-sage hover:text-[#FBF6EC] transition-colors"
            >
              Add
            </button>
          ) : (
            <QuantityStepper name={item.name} quantity={quantity} onAdd={onAdd} onRemove={onRemove} />
          )}
        </div>
      )}
    </li>
  );
}

export function QuantityStepper({
  name,
  quantity,
  onAdd,
  onRemove,
}: {
  name: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const button =
    "w-8 h-8 rounded-lg flex items-center justify-center text-lg font-semibold text-sage hover:bg-[#EFF3EA] transition-colors";
  return (
    <div className="flex items-center gap-1 border-[1.5px] border-border-strong rounded-[10px] px-0.5">
      <button type="button" onClick={onRemove} aria-label={`One less ${name}`} className={button}>
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button type="button" onClick={onAdd} aria-label={`One more ${name}`} className={button}>
        +
      </button>
    </div>
  );
}
