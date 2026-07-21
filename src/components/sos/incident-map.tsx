"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@/lib/theme-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinOff } from "lucide-react";
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

  // Initialize the map once.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.on("load", () => setReady(true));
    mapRef.current = map;

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

  return <div ref={containerRef} className="h-full min-h-[320px] w-full overflow-hidden rounded-lg" />;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
