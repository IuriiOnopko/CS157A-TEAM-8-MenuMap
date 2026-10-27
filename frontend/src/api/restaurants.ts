/**
 * ============================================================================
 *  BACKEND INTEGRATION POINT
 * ============================================================================
 *
 *   Browser  --GET /api/restaurants/count-->  Tomcat (RestaurantCountServlet)
 *   Tomcat   --SELECT COUNT(*) FROM restaurant-->  MySQL
 *   Browser  <--{ "count": 42 }--  Tomcat
 *
 * The app lives under /menumap (the "homepage" in package.json and the
 * Tomcat context path), so PUBLIC_URL is "/menumap" in both dev and prod.
 * In development, `npm start` proxies the API call to Tomcat on :8080
 * (see "proxy" in package.json), so Tomcat must be running there.
 *
 * Search and menus come from RestaurantServlet and
 * DietaryClassificationServlet; anyone can call them without signing in.
 */
import { apiFetch } from "./http";

/** GET /menumap/api/restaurants/count. Throws if the server or database is unreachable. */
export async function getRestaurantCount(): Promise<number> {
  const res = await fetch(`${process.env.PUBLIC_URL}/api/restaurants/count`);
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
  const body: { count: number } = await res.json();
  return body.count;
}

export type RestaurantSummary = {
  id: number;
  name: string;
  description: string | null;
  phone: string | null;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  priceLevel: number | null;
  isOpen: boolean;
  /** Primary cuisine first. */
  cuisines: string[];
  /** Dishes that matched the search, if the search looked at dishes. */
  matchingItems: string[];
};

export type Nutrition = {
  servingSize: string;
  calories: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  sodiumMg: number;
};

export type MenuItem = {
  categoryId: number;
  itemId: number;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  nutrition: Nutrition | null;
  dietary: string[];
  allergens: string[];
};

export type MenuCategory = {
  id: number;
  name: string;
  description: string | null;
  items: MenuItem[];
};

export type OpeningHours = {
  weekday: string;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

/** Set when the signed-in customer is barred from ordering at this restaurant. */
export type Restriction = { reason: string; endsAt: string | null };

export type RestaurantDetail = {
  restaurant: RestaurantSummary;
  hours: OpeningHours[];
  menu: MenuCategory[];
  restriction: Restriction | null;
};

export type DietaryClassification = { id: number; name: string; description: string | null };

export type SearchParams = {
  query: string;
  dietId: number | null;
  maxCalories: number | null;
  openOnly: boolean;
};

/** GET /api/restaurants — every word of the query must match the restaurant, its cuisine, or a dish. */
export function searchRestaurants(params: SearchParams, signal?: AbortSignal): Promise<RestaurantSummary[]> {
  const qs = new URLSearchParams();
  if (params.query.trim()) qs.set("q", params.query.trim());
  if (params.dietId !== null) qs.set("diet", String(params.dietId));
  if (params.maxCalories !== null) qs.set("maxCalories", String(params.maxCalories));
  if (params.openOnly) qs.set("open", "1");
  return apiFetch<RestaurantSummary[]>(`/restaurants?${qs}`, { signal });
}

/** GET /api/restaurants/{id} — one restaurant with its hours and full menu. */
export function getRestaurant(id: number, signal?: AbortSignal): Promise<RestaurantDetail> {
  return apiFetch<RestaurantDetail>(`/restaurants/${id}`, { signal });
}

export function getDietaryClassifications(): Promise<DietaryClassification[]> {
  return apiFetch<DietaryClassification[]>("/dietary-classifications");
}
