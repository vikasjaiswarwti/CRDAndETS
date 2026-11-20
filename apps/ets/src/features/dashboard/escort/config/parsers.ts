import type {
  EscortDashboardRawResponse,
  ParsedEscortDashboard,
  SafetyAndSecurity,
  EscortTrip,
  EscortOption,
} from "../types/escort.types";

// JSON fields can come back as strings (FOR JSON) or already-deserialized.
function safeParse<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    if (value.trim() === "") return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      if (Array.isArray(fallback)) {
        try {
          return JSON.parse(`[${value}]`) as T;
        } catch {
          return fallback;
        }
      }
      return fallback;
    }
  }
  return value as T;
}

export function parseEscortDashboardResponse(
  raw: EscortDashboardRawResponse
): ParsedEscortDashboard {
  const safety = safeParse<SafetyAndSecurity>(raw?.jsonSafetyandSecurity, {
    SingleFemaleTravelled: 0,
    FemaleTravelled: 0,
  });
  const tripsRaw = safeParse<EscortTrip | EscortTrip[]>(raw?.jsonTripList, []);
  const trips = Array.isArray(tripsRaw) ? tripsRaw : tripsRaw ? [tripsRaw] : [];

  const escorts = safeParse<EscortOption[]>(raw?.jsonEscortDropdownList, []);

  return { safety, trips, escorts };
}