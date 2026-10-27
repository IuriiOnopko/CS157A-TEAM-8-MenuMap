import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api/http";
import {
  DietaryClassification,
  getDietaryClassifications,
  RestaurantSummary,
  searchRestaurants,
} from "../api/restaurants";
import RestaurantDetail from "../components/map/RestaurantDetail";
import RestaurantList, { ListedRestaurant } from "../components/map/RestaurantList";
import RestaurantMap from "../components/map/RestaurantMap";
import SearchControls, { Filters, NO_FILTERS } from "../components/map/SearchControls";
import { LatLng, milesBetween, plural } from "../lib/format";

/**
 * /restaurants and /restaurants/:restaurantId — the full-screen map with a
 * floating side panel (search and results, or one restaurant's menu).
 * No sign-in needed to browse.
 *
 * Hovering a result highlights its pin; clicking a pin scrolls the list to
 * that restaurant.
 */
export default function MapPage() {
  const { restaurantId } = useParams();
  const openId = restaurantId && /^\d+$/.test(restaurantId) ? Number(restaurantId) : null;
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [diets, setDiets] = useState<DietaryClassification[]>([]);
  const [results, setResults] = useState<RestaurantSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [scrollRequest, setScrollRequest] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [loadedDetail, setLoadedDetail] = useState<RestaurantSummary | null>(null);
  const nearMe = useNearMe();
  const cards = useRef(new Map<number, HTMLElement>());

  useEffect(() => {
    getDietaryClassifications()
      .then(setDiets)
      .catch(() => setDiets([])); // the diet filter just stays empty
  }, []);

  // Search as the user types (after a short pause) and whenever a filter changes
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        searchRestaurants({ query, ...filters }, controller.signal)
          .then((found) => {
            setResults(found);
            setStatus("ready");
          })
          .catch((e) => {
            if (controller.signal.aborted) return;
            setError(errorMessage(e));
            setStatus("error");
          });
      },
      query ? 250 : 0
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, filters, retries]);

  // Nearest first once the user shares their location
  const listed: ListedRestaurant[] = useMemo(() => {
    const here = nearMe.position;
    const withMiles = results.map((r) => ({ ...r, miles: here ? milesBetween(here, r) : null }));
    return here ? withMiles.sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0)) : withMiles;
  }, [results, nearMe.position]);

  // The restaurant open in the panel, for the map to fly to (it may be filtered out of the results)
  const focused =
    openId === null ? null : results.find((r) => r.id === openId) ?? (loadedDetail?.id === openId ? loadedDetail : null);
  const pins = focused && !results.some((r) => r.id === focused.id) ? [...results, focused] : results;
  const fitKey = `${results.map((r) => r.id).join(",")}|${nearMe.position ? "near" : ""}`;

  // Clicking a pin scrolls its card into view (back on the list if a menu was open)
  useEffect(() => {
    if (openId !== null || selectedId === null) return;
    cards.current.get(selectedId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollRequest, openId, selectedId]);

  const selectFromMap = (id: number) => {
    setSelectedId(id);
    setPanelOpen(true);
    setScrollRequest((n) => n + 1);
    if (openId !== null) navigate("/restaurants");
  };

  const openRestaurant = (id: number) => {
    setSelectedId(id);
    setHoveredId(null);
    navigate(`/restaurants/${id}`);
  };

  const backToList = () => {
    navigate("/restaurants");
    setScrollRequest((n) => n + 1);
  };

  const changeQuery = (q: string) => {
    setQuery(q);
    setSelectedId(null);
  };

  const changeFilters = (f: Filters) => {
    setFilters(f);
    setSelectedId(null);
  };

  const filtered = query.trim() !== "" || filters.dietId !== null || filters.maxCalories !== null || filters.openOnly;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F2EFE9] font-body text-ink">
      <div className={`absolute inset-0 ${panelOpen ? "mm-panel-open" : "mm-panel-closed"}`}>
        <RestaurantMap
          restaurants={pins}
          hoveredId={hoveredId}
          selectedId={selectedId}
          focused={focused}
          userPosition={nearMe.position}
          panelOpen={panelOpen}
          fitKey={fitKey}
          onHover={setHoveredId}
          onSelect={selectFromMap}
        />
      </div>

      <aside
        aria-label="Restaurants"
        className={`absolute z-[1100] flex flex-col rounded-2xl border border-border bg-cream/95 backdrop-blur-md shadow-[0_12px_40px_rgba(27,33,26,0.18)] transition-transform duration-300 ease-out inset-x-2 bottom-2 h-[55vh] md:inset-x-auto md:left-4 md:top-4 md:bottom-4 md:h-auto md:w-96 ${
          panelOpen ? "" : "translate-y-[calc(100%_-_4.25rem)] md:translate-y-0 md:translate-x-[calc(-100%_-_1.5rem)]"
        }`}
      >
        {/* Slide the panel away to see more of the map */}
        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          aria-label={panelOpen ? "Hide the list" : "Show the list"}
          aria-expanded={panelOpen}
          className="hidden md:flex absolute top-5 -right-9 w-9 h-12 items-center justify-center rounded-r-xl border border-l-0 border-border bg-cream/95 text-muted shadow-md hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={panelOpen ? "" : "rotate-180"}>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          aria-label={panelOpen ? "Hide the list" : "Show the list"}
          className="md:hidden mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-border-strong"
        />

        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 md:pt-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-[8px] bg-sage flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z"
                  stroke="#FBF6EC"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.6" fill="#FBF6EC" />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">MenuMap</span>
          </Link>
          <Link to="/orders" className="text-[13.5px] font-semibold text-sage hover:text-sage-dark">
            Your orders
          </Link>
        </div>

        {openId !== null ? (
          <RestaurantDetail key={openId} restaurantId={openId} onBack={backToList} onLoaded={setLoadedDetail} />
        ) : (
          <>
            <div className="px-4 pb-3">
              <SearchControls
                query={query}
                onQueryChange={changeQuery}
                filters={filters}
                onFiltersChange={changeFilters}
                diets={diets}
                nearMe={{
                  on: nearMe.position !== null,
                  locating: nearMe.locating,
                  error: nearMe.error,
                  toggle: nearMe.toggle,
                }}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3 border-t border-border">
              {status === "loading" && <p className="m-0 px-2 py-3 text-[14px] text-muted-2">Loading restaurants…</p>}
              {status === "error" && (
                <div className="px-2 py-3 flex flex-col gap-2">
                  <p role="alert" className="m-0 text-[14px] text-[#B42318]">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetries((n) => n + 1)}
                    className="w-fit text-[14px] font-semibold text-sage hover:text-sage-dark"
                  >
                    Try again
                  </button>
                </div>
              )}
              {status === "ready" && (
                <>
                  <div className="flex items-center justify-between px-2 pt-3 pb-1.5">
                    <span className="text-[12.5px] font-bold uppercase tracking-wide text-muted-2">
                      {listed.length === 0 ? "No matches" : plural(listed.length, "restaurant")}
                      {nearMe.position && listed.length > 0 && " · nearest first"}
                    </span>
                    {filtered && (
                      <button
                        type="button"
                        onClick={() => {
                          changeQuery("");
                          changeFilters(NO_FILTERS);
                        }}
                        className="text-[13px] font-semibold text-sage hover:text-sage-dark"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                  {listed.length === 0 ? (
                    <p className="m-0 px-2 py-2 text-[14px] leading-relaxed text-muted">
                      Nothing matches every word and filter. Try fewer words, or search for a dish or cuisine, like
                      “ramen” or “vegan”.
                    </p>
                  ) : (
                    <RestaurantList
                      restaurants={listed}
                      hoveredId={hoveredId}
                      selectedId={selectedId}
                      onHover={setHoveredId}
                      onOpen={openRestaurant}
                      registerCard={(id, el) => {
                        if (el) cards.current.set(id, el);
                        else cards.current.delete(id);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/** "Near me": asks the browser for the user's location (only when the chip is pressed). */
function useNearMe() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    if (position) {
      setPosition(null);
      return;
    }
    if (!navigator.geolocation) {
      setError("This browser can't share your location.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Location is blocked. Allow it in the browser to sort by distance.");
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return { position, locating, error, toggle };
}
