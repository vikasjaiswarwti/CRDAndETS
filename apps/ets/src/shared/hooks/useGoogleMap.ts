import { useRef, useEffect, useState, useCallback } from "react";
import { MAP_ALLOWED_COUNTRIES } from "../constants/app.constants";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AddressComponents {
  fullAddress: string;
  city: string;
  state: string;
  stateCode: string;
  pin: string;
  lat: number;
  lng: number;
  locality?: string; // ← add
}

interface UseGoogleMapOptions {
  onAddressChange?: (components: AddressComponents) => void;
  defaultLat?: number;
  defaultLng?: number;
  /**
   * ISO 3166-1 alpha-2 country codes to restrict Places Autocomplete to
   * (Google allows up to 5). Pass an empty array to search worldwide.
   * Defaults to MAP_ALLOWED_COUNTRIES (app.constants.ts) — override only
   * when a specific screen genuinely needs a different scope.
   */
  allowedCountries?: readonly string[];
}

interface UseGoogleMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isLoaded: boolean;
  isGeocoding: boolean;
  moveMarker: (lat: number, lng: number) => void;
  geocodeLatLng: (lat: number, lng: number) => Promise<void>;
  refreshMap: () => void; // NEW: manual reload trigger
}

// ── Read-only map variant ────────────────────────────────────────────────────

interface UseGoogleMapV2Options {
  defaultLat?: number;
  defaultLng?: number;
}

interface UseGoogleMapV2Return {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isLoaded: boolean;
}

// ── Script loader — Promise singleton ────────────────────────────────────────

declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

let mapsPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<void>((resolve, reject) => {
    window.initGoogleMaps = resolve;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error("[useGoogleMap] Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}

// ── Shared address parser ────────────────────────────────────────────────────

function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string,
  lat: number,
  lng: number,
): AddressComponents {
  let city = "";
  let state = "";
  let stateCode = "";
  let pin = "";
  let locality = "";

  for (const c of components) {
    if (c.types.includes("locality")) city = c.long_name;
    if (c.types.includes("administrative_area_level_2") && !city)
      city = c.long_name;
    if (c.types.includes("administrative_area_level_1")) {
      state = c.long_name;
      stateCode = c.short_name;
    }
    if (c.types.includes("postal_code")) pin = c.long_name;

    if (c.types.includes("sublocality_level_1")) locality = c.long_name;
    else if (c.types.includes("sublocality") && !locality)
      locality = c.long_name;
    else if (c.types.includes("neighborhood") && !locality)
      locality = c.long_name;
  }

  return {
    fullAddress: formattedAddress,
    city,
    state,
    stateCode,
    pin,
    lat,
    lng,
    locality,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY HOOK — interactive map with search + drag + click + geocoding
// ─────────────────────────────────────────────────────────────────────────────

export function useGoogleMap({
  onAddressChange,
  defaultLat = 28.6139,
  defaultLng = 77.209,
  allowedCountries = MAP_ALLOWED_COUNTRIES,
}: UseGoogleMapOptions = {}): UseGoogleMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // ── FIX: refreshKey forces a full re-init without remounting the parent ──
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshMap = useCallback(() => {
    setIsLoaded(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const onAddressChangeRef = useRef(onAddressChange);
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // alongside markerRef:
  const circleRef = useRef<google.maps.Circle | null>(null);

  // ── FIX: initCalledRef is scoped INSIDE the effect so each run gets its own ─
  // (moved below — it's now a local var inside the effect, not a persistent ref)

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const geocodeLatLng = useCallback(
    async (lat: number, lng: number): Promise<void> => {
      if (!window.google) return;
      setIsGeocoding(true);
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });
        const first = result.results[0];
        if (!first) return;
        onAddressChangeRef.current?.(
          parseAddressComponents(
            first.address_components,
            first.formatted_address,
            lat,
            lng,
          ),
        );
      } catch (err) {
        console.error("[useGoogleMap] Geocoding failed:", err);
      } finally {
        setIsGeocoding(false);
      }
    },
    [],
  );

  // ── Move marker from outside ──────────────────────────────────────────────
  const moveMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const pos = { lat, lng };
    markerRef.current.setPosition(pos);
    mapInstanceRef.current.panTo(pos);
  }, []);

  // ── Core effect: load script → wait for visible container → init ──────────
  // refreshKey is included so this whole effect re-runs when refreshMap() fires
  useEffect(() => {
    // ── FIX: initCalledRef is LOCAL to this effect invocation ──────────────
    // Each time the effect runs (open/close cycle or refreshKey bump) it starts
    // fresh. No stale "already initialised" flag leaking from previous renders.
    let initCalled = false;
    let observer: ResizeObserver | null = null;
    let rafId: number;
    let cancelled = false;

    // Clean up previous map instance listeners before creating a new one
    if (markerRef.current) {
      google.maps?.event?.clearInstanceListeners(markerRef.current);
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      google.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
      mapInstanceRef.current = null;
    }

    const initMap = () => {
      if (initCalled || !mapRef.current || !window.google) return;
      initCalled = true;

      const center = { lat: defaultLat, lng: defaultLng };

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
      });
      mapInstanceRef.current = map;

      // inside initMap(), before the marker.addListener("dragend") block:
      const updateCircle = (pos: { lat: number; lng: number }) => {
        if (circleRef.current) {
          circleRef.current.setCenter(pos);
        } else {
          circleRef.current = new google.maps.Circle({
            map,
            center: pos,
            radius: 100,
            strokeColor: "#EF4444",
            strokeOpacity: 0.85,
            strokeWeight: 2,
            fillColor: "#EF4444",
            fillOpacity: 0.07,
            zIndex: 1,
          });
        }
      };

      const marker = new google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: "Drag this for changing address",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });
      markerRef.current = marker;

      // ── FIX: always trigger resize after init so tiles paint correctly ───
      // Using two rAF frames gives the modal animation time to fully settle
      // before the resize fires — single rAF is sometimes too early.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          google.maps.event.trigger(map, "resize");
          map.setCenter(center);
          setIsLoaded(true);
        });
      });

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) {
          updateCircle({ lat: pos.lat(), lng: pos.lng() }); // ← add
          geocodeLatLng(pos.lat(), pos.lng());
        }
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          marker.setPosition(e.latLng);
          updateCircle({ lat: e.latLng.lat(), lng: e.latLng.lng() }); // ← add
          geocodeLatLng(e.latLng.lat(), e.latLng.lng());
        }
      });

      if (searchInputRef.current) {
        const ac = new google.maps.places.Autocomplete(searchInputRef.current, {
          ...(allowedCountries.length
            ? { componentRestrictions: { country: [...allowedCountries] } }
            : {}),
          fields: ["address_components", "formatted_address", "geometry"],
        });

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place.geometry?.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          marker.setPosition({ lat, lng });
          map.panTo({ lat, lng });
          map.setZoom(16);
          updateCircle({ lat, lng }); // ← add

          onAddressChangeRef.current?.(
            parseAddressComponents(
              place.address_components ?? [],
              place.formatted_address ?? "",
              lat,
              lng,
            ),
          );
        });
      }
    };

    const tryInit = () => {
      if (cancelled || initCalled) return;
      const el = mapRef.current;
      if (!el) return;
      const { height, width } = el.getBoundingClientRect();
      const visible = window.getComputedStyle(el).display !== "none";
      if (height > 10 && width > 10 && visible) {
        observer?.disconnect();
        initMap();
      }
    };

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        observer = new ResizeObserver(() => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tryInit);
        });

        observer.observe(mapRef.current);
        tryInit();
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(rafId);

      if (markerRef.current) {
        google.maps?.event?.clearInstanceListeners(markerRef.current);
      }
      if (mapInstanceRef.current) {
        google.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
      }
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
    // refreshKey intentionally included — bumping it re-runs this whole effect.
    // allowedCountries is keyed by its joined value, not the array reference,
    // so callers passing a fresh array literal each render don't retrigger init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLat, defaultLng, geocodeLatLng, refreshKey, allowedCountries.join(",")]);

  return {
    mapRef,
    searchInputRef,
    isLoaded,
    isGeocoding,
    moveMarker,
    geocodeLatLng,
    refreshMap,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ-ONLY HOOK — display-only map, no interaction
// ─────────────────────────────────────────────────────────────────────────────

export function useGoogleMapV2({
  defaultLat = 28.6139,
  defaultLng = 77.209,
}: UseGoogleMapV2Options = {}): UseGoogleMapV2Return {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const center = { lat: defaultLat, lng: defaultLng };

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          draggable: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        });

        new google.maps.Marker({
          position: center,
          map,
          draggable: false,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (cancelled) return;
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
            setIsLoaded(true);
          });
        });
      })
      .catch((err) => console.error("[useGoogleMapV2]", err));

    return () => {
      cancelled = true;
    };
  }, [defaultLat, defaultLng]);

  return { mapRef, isLoaded };
}
