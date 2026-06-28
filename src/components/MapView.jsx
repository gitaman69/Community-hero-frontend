import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  OverlayViewF,
  OverlayView,
  HeatmapLayer,
} from '@react-google-maps/api';
import { DEFAULT_CENTER, DEFAULT_ZOOM, categoryMeta, issueColor } from '../lib/constants.js';
import { coordsFromIssue } from '../lib/format.js';
import { EmptyState } from './Spinner.jsx';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

// Stable reference — required by useJsApiLoader so the loader isn't re-created.
const MAP_LIBRARIES = ['visualization'];

// Heatmap gradient in the Civic Night palette (transparent → civic → urgent).
const HEATMAP_GRADIENT = [
  'rgba(59,130,246,0)',
  'rgba(59,130,246,0.6)',
  'rgba(99,102,241,0.8)',
  'rgba(251,113,133,0.9)',
  'rgba(251,113,133,1)',
];

// Civic-night cartographic styling — deep navy, blue roads.
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0b1020' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7c8db5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#05070d' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1530' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16203a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0b1224' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#22325a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0f1830' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0e2018' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#243150' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9fb1d8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  styles: MAP_STYLES,
  backgroundColor: '#05070d',
};

// Cartographic teardrop pin with a category glyph.
function Pin({ issue, isNew, active, onSelect }) {
  const color = issueColor(issue);
  const cat = categoryMeta(issue.category);
  return (
    <button
      type="button"
      onClick={() => onSelect?.(issue._id)}
      aria-label={`${cat.label} — ${issue.status}`}
      className={`group relative -translate-x-1/2 -translate-y-full cursor-pointer focus:outline-none ${
        isNew ? 'animate-pin-drop' : ''
      }`}
      style={{ filter: active ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
    >
      <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">
        <path
          d="M15 0C6.7 0 0 6.7 0 15c0 9.6 13.2 21.7 14 22.4.6.5 1.5.5 2 0C16.8 36.7 30 24.6 30 15 30 6.7 23.3 0 15 0z"
          fill={color}
          stroke="#F7F5F0"
          strokeWidth={active ? 2.5 : 1.5}
        />
        <circle cx="15" cy="14" r="9" fill="#F7F5F0" fillOpacity="0.9" />
      </svg>
      <span
        className="code pointer-events-none absolute left-1/2 top-[14px] -translate-x-1/2 -translate-y-1/2 text-[12px] font-medium leading-none"
        style={{ color }}
        aria-hidden="true"
      >
        {cat.icon}
      </span>
    </button>
  );
}

export default function MapView({
  issues = [],
  center,
  newIssueIds,
  activeId,
  onSelect,
  onBoundsChange,
  className = '',
}) {
  const mapRef = useRef(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'community-hero-gmaps',
    googleMapsApiKey: MAPS_KEY,
    libraries: MAP_LIBRARIES,
    // Only attempt to load when a key is present — keeps build & key-less dev safe.
    preventGoogleFontsLoading: true,
  });

  const resolvedCenter = center || DEFAULT_CENTER;
  const [mapReady, setMapReady] = useState(false);
  // 'pins' shows individual reports; 'heat' shows a density heatmap.
  const [mode, setMode] = useState('pins');

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;
      setMapReady(true);
    },
    []
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMapReady(false);
  }, []);

  // Re-center when the resolved center changes (e.g. geolocation resolves).
  useEffect(() => {
    if (mapReady && mapRef.current && center) {
      mapRef.current.panTo(center);
    }
  }, [mapReady, center]);

  const handleIdle = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;
    const b = mapRef.current.getBounds();
    if (b) onBoundsChange(b);
  }, [onBoundsChange]);

  const pins = useMemo(
    () =>
      issues
        .map((issue) => ({ issue, coords: coordsFromIssue(issue) }))
        .filter((p) => p.coords),
    [issues]
  );

  // Heatmap points weighted by severity — needs the Maps API for LatLng.
  const heatData = useMemo(() => {
    if (!isLoaded || !window.google?.maps) return [];
    return pins.map(({ issue, coords }) => ({
      location: new window.google.maps.LatLng(coords.lat, coords.lng),
      weight: Math.max(1, Number(issue.severity) || 3),
    }));
  }, [isLoaded, pins]);

  // Newly added OverlayViews occasionally don't paint until the map's next
  // redraw — so when the pin set changes, nudge the map to force a repaint.
  // This is what fixes "new pins only show after a manual refresh".
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google?.maps?.event) return;
    const map = mapRef.current;
    const t = setTimeout(() => {
      window.google.maps.event.trigger(map, 'resize');
      // A 0px pan reliably triggers the overlay panes to re-draw.
      map.panBy(0, 0);
    }, 0);
    return () => clearTimeout(t);
  }, [mapReady, pins.length]);

  // --- Graceful degradation: missing key ---
  if (!MAPS_KEY) {
    return (
      <div className={`map-shell flex items-center justify-center ${className}`}>
        <EmptyState icon="⌖" title="Map unavailable">
          Set <code className="code text-civic">VITE_GOOGLE_MAPS_KEY</code> in your environment to
          render the interactive map. The issue feed on the right still works.
        </EmptyState>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`map-shell flex items-center justify-center ${className}`}>
        <EmptyState icon="⚠" title="Couldn’t load Google Maps">
          Check the API key and that the Maps JavaScript API is enabled.
        </EmptyState>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`map-shell flex items-center justify-center ${className}`}>
        <span className="code animate-pulse-soft text-sm text-civic/70">Loading map…</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={resolvedCenter}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onIdle={handleIdle}
      >
        {mode === 'pins'
          ? pins.map(({ issue, coords }) => (
              <OverlayViewF
                key={issue._id}
                position={coords}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <Pin
                  issue={issue}
                  isNew={newIssueIds?.has?.(issue._id)}
                  active={activeId === issue._id}
                  onSelect={onSelect}
                />
              </OverlayViewF>
            ))
          : null}

        {mode === 'heat' && heatData.length ? (
          <HeatmapLayer
            data={heatData}
            options={{ radius: 28, opacity: 0.75, gradient: HEATMAP_GRADIENT }}
          />
        ) : null}
      </GoogleMap>

      {/* Pins / Heatmap toggle */}
      <div className="absolute right-3 top-3 z-10 flex rounded-full border border-white/10 bg-paper/85 p-0.5 text-xs shadow-xl backdrop-blur-xl">
        {[
          { key: 'pins', label: 'Pins' },
          { key: 'heat', label: 'Heatmap' },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              mode === m.key ? 'bg-civic text-white' : 'text-ink/60 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {pins.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="pointer-events-auto rounded-full border border-haze bg-paper/95 px-4 py-1.5 text-sm text-ink/70 shadow-sm backdrop-blur">
            No issues reported here yet — be the first.
          </div>
        </div>
      ) : null}
    </div>
  );
}
