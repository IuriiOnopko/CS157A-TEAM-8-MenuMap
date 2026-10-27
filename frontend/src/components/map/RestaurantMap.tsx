import React, { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RestaurantSummary } from "../../api/restaurants";
import type { LatLng } from "../../lib/format";

type Props = {
  restaurants: RestaurantSummary[];
  /** Pin to highlight because its card in the list is hovered (or the pin itself is). */
  hoveredId: number | null;
  /** Pin last clicked; its card is highlighted in the list. */
  selectedId: number | null;
  /** Restaurant open in the panel; the map flies to it. */
  focused: RestaurantSummary | null;
  userPosition: LatLng | null;
  panelOpen: boolean;
  /** Changes whenever the map should re-frame the results (new search, location turned on). */
  fitKey: string;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
};

// Map images: the standard OpenStreetMap tiles. No API key or account is needed.
// (Stadia Maps and CARTO both answer with "Invalid Authentication" / "API key required" tiles without a key.)
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const START_CENTER: L.LatLngTuple = [37.39, -122.03]; // South Bay, where the test restaurants are

/**
 * The full-screen restaurant map. Pins grow and pulse when hovered here or in
 * the list; clicking a pin calls onSelect so the list can scroll to it.
 */
export default function RestaurantMap(props: Props) {
  const { restaurants, hoveredId, selectedId, userPosition, onHover, onSelect } = props;
  const markers = useRef(new Map<number, L.Marker>());

  // Restyle pins in place instead of swapping their icons: a new icon element under the
  // cursor would fire mouseout/mouseover again and make the hover flicker
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      const state: PinState = id === selectedId ? "selected" : id === hoveredId ? "hovered" : "idle";
      const element = marker.getElement();
      element?.querySelector(".mm-pin")?.setAttribute("class", `mm-pin mm-pin--${state}`);
      // Pins are focusable buttons (Leaflet's keyboard option), so give each one its restaurant's name
      element?.setAttribute("aria-label", restaurants.find((r) => r.id === id)?.name ?? "Restaurant");
      marker.setZIndexOffset(state === "idle" ? 0 : 1000);
    });
  }, [hoveredId, selectedId, restaurants]);

  // Hovering a card shows that pin's name label, the same as hovering the pin
  useEffect(() => {
    if (hoveredId === null) return;
    const marker = markers.current.get(hoveredId);
    marker?.openTooltip();
    return () => {
      marker?.closeTooltip();
    };
  }, [hoveredId]);

  return (
    <MapContainer center={START_CENTER} zoom={11} minZoom={3} zoomControl={false} className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomright" />
      <FrameResults {...props} />

      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={PIN_ICON}
          alt={r.name}
          ref={(marker) => {
            if (marker) markers.current.set(r.id, marker);
            else markers.current.delete(r.id);
          }}
          eventHandlers={{
            click: () => onSelect(r.id),
            mouseover: () => onHover(r.id),
            mouseout: () => onHover(null),
          }}
        >
          <Tooltip direction="top" offset={[0, -4]} className="mm-tooltip">
            {r.name}
          </Tooltip>
        </Marker>
      ))}

      {userPosition && (
        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={8}
          pathOptions={{ color: "#FFFFFF", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }}
        >
          <Tooltip direction="top">You are here</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}

/** Moves the map: frames all results after a search, or flies to the restaurant open in the panel. */
function FrameResults({ restaurants, focused, userPosition, panelOpen, fitKey }: Props) {
  const map = useMap();
  const firstFrame = useRef(true);

  // Read through a ref so the framing effect runs only when fitKey changes, not on every render
  const latest = useRef({ restaurants, focused, userPosition, panelOpen });
  latest.current = { restaurants, focused, userPosition, panelOpen };

  useEffect(() => {
    const { restaurants, focused, userPosition, panelOpen } = latest.current;
    if (focused) return; // a restaurant is open in the panel; keep the view on it
    const points: L.LatLngTuple[] = restaurants.map((r) => [r.lat, r.lng]);
    if (userPosition) points.push([userPosition.lat, userPosition.lng]);
    if (points.length === 0) return;

    const options = { ...framePadding(panelOpen), maxZoom: 15 };
    if (firstFrame.current) {
      map.fitBounds(points, options);
      firstFrame.current = false;
    } else {
      map.flyToBounds(points, { ...options, duration: 0.8 });
    }
  }, [fitKey, map]);

  const focusedId = focused?.id;
  useEffect(() => {
    const { focused, panelOpen } = latest.current;
    if (!focused) return;
    const at: L.LatLngTuple = [focused.lat, focused.lng];
    const options = { ...framePadding(panelOpen), maxZoom: 15 };
    if (firstFrame.current) {
      map.fitBounds([at, at], options);
      firstFrame.current = false;
    } else {
      map.flyToBounds([at, at], { ...options, duration: 0.8 });
    }
  }, [focusedId, map]);

  return null;
}

/** Keeps pins out from under the floating panel: on the left on wide screens, at the bottom on phones. */
function framePadding(panelOpen: boolean): L.FitBoundsOptions {
  if (window.innerWidth >= 768) {
    return { paddingTopLeft: [panelOpen ? 440 : 64, 64], paddingBottomRight: [64, 64] };
  }
  return { paddingTopLeft: [32, 32], paddingBottomRight: [32, panelOpen ? window.innerHeight * 0.55 + 24 : 96] };
}

type PinState = "idle" | "hovered" | "selected";

// Teardrop pin with a fork and knife; its color comes from CSS (see .mm-pin in index.css)
const PIN_SVG = `
<svg viewBox="0 0 36 46" width="36" height="46" aria-hidden="true">
  <path d="M18 44.5S33 31.2 33 18.5C33 10 26.3 3.5 18 3.5S3 10 3 18.5C3 31.2 18 44.5 18 44.5Z"
        fill="currentColor" stroke="#FFFFFF" stroke-width="2.5"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.5 11.5v4.2a2 2 0 0 0 4 0v-4.2M14.5 17.7v8"/>
    <path d="M23 25.7V11.5c-1.9 1-2.9 3.2-2.9 6.4H23"/>
  </g>
</svg>`;

const PIN_ICON = L.divIcon({
  className: "", // drop Leaflet's default white square behind div icons
  html: `<div class="mm-pin mm-pin--idle"><span class="mm-pin-ring"></span>${PIN_SVG}</div>`,
  iconSize: [36, 46],
  iconAnchor: [18, 45],
  tooltipAnchor: [0, -44],
});
