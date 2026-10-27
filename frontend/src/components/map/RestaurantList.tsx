import React from "react";
import type { RestaurantSummary } from "../../api/restaurants";
import { formatMiles, priceLevel } from "../../lib/format";

export type ListedRestaurant = RestaurantSummary & { miles: number | null };

type Props = {
  restaurants: ListedRestaurant[];
  hoveredId: number | null;
  selectedId: number | null;
  onHover: (id: number | null) => void;
  onOpen: (id: number) => void;
  /** Lets the page scroll a card into view when its pin is clicked. */
  registerCard: (id: number, element: HTMLElement | null) => void;
};

/**
 * Search results in the side panel. Each result shows what the proposal asks
 * for: name, address, type of cuisine and current operating status.
 */
export default function RestaurantList({ restaurants, hoveredId, selectedId, onHover, onOpen, registerCard }: Props) {
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-1" onMouseLeave={() => onHover(null)}>
      {restaurants.map((r) => {
        const selected = r.id === selectedId;
        const hovered = r.id === hoveredId;
        return (
          <li key={r.id} ref={(el) => registerCard(r.id, el)} className="scroll-my-3">
            <button
              type="button"
              onClick={() => onOpen(r.id)}
              onMouseEnter={() => onHover(r.id)}
              onFocus={() => onHover(r.id)}
              onBlur={() => onHover(null)}
              className={`w-full text-left rounded-xl px-3.5 py-3 border transition-colors ${
                selected
                  ? "border-clay bg-[#FFF7EC]"
                  : hovered
                  ? "border-border-strong bg-card"
                  : "border-transparent hover:bg-card"
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-[15.5px] leading-snug text-ink">{r.name}</span>
                <OpenStatus isOpen={r.isOpen} />
              </span>
              <span className="block mt-0.5 text-[13px] text-muted">
                {[r.cuisines.join(", "), priceLevel(r.priceLevel)].filter(Boolean).join(" · ")}
              </span>
              <span className="block text-[13px] text-muted-2">
                {r.streetAddress}, {r.city}
                {r.miles !== null && <> · {formatMiles(r.miles)}</>}
              </span>
              {r.matchingItems.length > 0 && (
                <span className="flex flex-wrap gap-1 mt-2">
                  {r.matchingItems.map((dish) => (
                    <span key={dish} className="px-2 py-0.5 rounded-md bg-[#EFF3EA] text-[12px] font-medium text-sage">
                      {dish}
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function OpenStatus({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center gap-1.5 text-[12.5px] font-semibold ${
        isOpen ? "text-[#1E7A46]" : "text-muted-2"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-[#3BAA6A]" : "bg-[#B8BDB3]"}`} />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}
