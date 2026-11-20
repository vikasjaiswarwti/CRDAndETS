// ============================================================
// useLocationLookup — dedicated hook for LkpLocation/locations
//
// DO NOT add to useLookups(). This hook is imported directly
// wherever location options are needed for mapping.
//
// API: GET /api/v1/LkpLocation/locations
// Response: [{ locCode: number; locName: string }]
// ============================================================

import { useGetAllLkpLocationsQuery } from "../services/lookupsApi";

export interface LkpLocation {
  locCode: number;
  locName: string;
}

export interface LocationOption {
  label: string;
  value: string; // String(locCode) — matches what the PATCH body expects
  locCode: number;
}

export const useLocationLookup = () => {
  const { data, isLoading, error, refetch } = useGetAllLkpLocationsQuery();

  const locationOptions: LocationOption[] = (data ?? []).map((loc) => ({
    label: loc.locName,
    value: String(loc.locCode),
    locCode: loc.locCode,
  }));

  return {
    locationOptions,
    rawLocations: data ?? ([] as LkpLocation[]),
    isLoading,
    error,
    refetch,
  };
};
