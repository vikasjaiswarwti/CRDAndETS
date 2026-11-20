import { useEffect, useRef, useState } from "react";

export interface LatLng {
  lat: number;
  lng: number;
}

// In-memory cache keyed by rounded coordinates — shared across every
// card/marker that calls this hook, so incidents at the same location
// only geocode once.
const geocodeCache = new Map<string, string>();

const isGoogleMapsReady = () =>
  typeof window !== "undefined" && !!(window as any).google?.maps?.Geocoder;

export function useReverseGeocode(position: LatLng | null) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!position) {
      setAddress(null);
      return;
    }

    const key = `${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
    const cached = geocodeCache.get(key);
    if (cached) {
      setAddress(cached);
      return;
    }

    let cancelled = false;

    const runGeocode = () => {
      if (cancelled) return;
      setLoading(true);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (cancelled) return;
        setLoading(false);
        if (status === "OK" && results?.[0]) {
          geocodeCache.set(key, results[0].formatted_address);
          setAddress(results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      });
    };

    if (isGoogleMapsReady()) {
      runGeocode();
    } else {
      // The Maps script is loaded elsewhere (SecurityMapPanel's
      // <APIProvider>) and this hook may run before or outside that
      // tree — poll briefly until the script is ready.
      setLoading(true);
      pollRef.current = window.setInterval(() => {
        if (isGoogleMapsReady()) {
          if (pollRef.current) clearInterval(pollRef.current);
          runGeocode();
        }
      }, 300);
    }

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [position?.lat, position?.lng]);

  return { address, loading };
}
