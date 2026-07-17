"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@/lib/theme-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinOff, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SosEvent } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MARKER_COLOR: Record<SosEvent["status"], string> = {
  PENDING: "#f59e0b",
  ACTIVE: "#dc2626",
  RESOLVED: "#16a34a",
  FALSE_ALARM: "#747878",
};

// Johannesburg \u2014 sensible default center until the first incident sets the bounds.
const DEFAULT_CENTER: [number, number] = [28.0473, -26.2041];

export function IncidentMap({
  events,
  selectedId,
  onSelect,
}: {
  events: SosEvent[];
  selectedId?: string | null;
  onSelect?: (event: SosEvent) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoDetails, setGeoDetails] = useState<any>(null);

  // Initialize the map once.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: 11,
      pitch: 45, // 3D angle
      bearing: -17.6,
      antialias: true,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on("load", () => {
      setReady(true);
      // Add terrain for 3D
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // Add 3D buildings
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout && (layer.layout as any)["text-field"]
      )?.id;

      map.addLayer(
        {
          id: "add-3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
            "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the base style when the dashboard theme toggles.
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11");
  }, [theme]);

  // Sync markers with the incident list every time it changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const seen = new Set<string>();

    for (const event of events) {
      seen.add(event.id);
      const existing = markersRef.current.get(event.id);
      const color = MARKER_COLOR[event.status];

      if (existing) {
        existing.setLngLat([event.longitude, event.latitude]);
        const el = existing.getElement();
        el.style.backgroundColor = color;
        el.classList.toggle("ring-4", event.id === selectedId);
        continue;
      }

      const el = document.createElement("button");
      el.setAttribute("aria-label", `${event.reference}: ${event.title}`);
      el.className = "h-4 w-4 rounded-full border-2 border-white shadow-md ring-secondary transition-transform hover:scale-125";
      el.style.backgroundColor = color;
      if (event.status === "ACTIVE") el.style.animation = "pulse 1.6s ease-in-out infinite";
      el.onclick = () => onSelect?.(event);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([event.longitude, event.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(
            `<div style="font:13px Inter,sans-serif;padding:2px 4px;">
               <strong>${escapeHtml(event.reference)}</strong><br/>${escapeHtml(event.title)}
             </div>`
          )
        )
        .addTo(map);

      markersRef.current.set(event.id, marker);
    }

    // Remove markers for incidents no longer in the list.
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    if (events.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      events.forEach((e) => bounds.extend([e.longitude, e.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    }
  }, [events, ready, selectedId, onSelect]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setSearching(true);
    try {
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await resp.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        setGeoDetails({
          address: feature.place_name,
          coords: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          type: feature.place_type[0],
        });
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          pitch: 60,
          essential: true,
        });
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setSearching(false);
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg bg-surface-container-low">
        <EmptyState
          icon={MapPinOff}
          title="Map unavailable"
          description="Set NEXT_PUBLIC_MAPBOX_TOKEN (a public pk.\u2026 token) in the dashboard's environment to enable the live incident map."
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-lg">
      <div ref={containerRef} className="h-full w-full" />

      {/* Search Overlay */}
      <div className="absolute left-4 top-4 z-10 w-full max-w-sm space-y-2">
        <form onSubmit={handleSearch} className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="bg-surface-container-highest/90 pr-10 backdrop-blur-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            disabled={searching}
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </form>

        {geoDetails && (
          <div className="rounded border border-outline-variant bg-surface-container-highest/90 p-3 text-body-sm shadow-lg backdrop-blur-sm">
            <p className="font-bold text-on-surface">{geoDetails.address}</p>
            <p className="text-on-surface-variant">Coordinates: {geoDetails.coords}</p>
            <p className="text-on-surface-variant capitalize">Type: {geoDetails.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
