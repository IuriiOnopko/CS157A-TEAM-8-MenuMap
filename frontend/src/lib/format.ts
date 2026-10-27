import type { OpeningHours } from "../api/restaurants";

export type LatLng = { lat: number; lng: number };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(amount: number): string {
  return money.format(amount);
}

/** "Oct 1, 6:05 PM" in the viewer's time zone. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 2 -> "$$" */
export function priceLevel(level: number | null): string {
  return level ? "$".repeat(level) : "";
}

/** "13:30" -> "1:30 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatHours(hours: OpeningHours): string {
  if (hours.isClosed || !hours.opensAt || !hours.closesAt) return "Closed";
  return `${formatTime(hours.opensAt)} – ${formatTime(hours.closesAt)}`;
}

/** Straight-line distance in miles (haversine formula). */
export function milesBetween(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

export function formatMiles(miles: number): string {
  return miles < 0.1 ? "< 0.1 mi" : `${miles.toFixed(1)} mi`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
