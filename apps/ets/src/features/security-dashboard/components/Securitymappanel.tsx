import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { T } from "../constants/Designtokens";
import type { Alert } from "../types/Security.types";

import { useReverseGeocode } from "../../../shared/hooks/useReverseGeocode";

import { getCustomPopupClass, type PopupInstance } from "./CustomMapPopup";

// ─── Guard ────────────────────────────────────────────────────────────────────
// Returns true only when both lat and lng are finite, non-zero numbers.
// Filters out null, undefined, NaN, 0, and empty string.
const hasValidCoords = (alert: Alert): boolean => {
  return (
    alert.lat != null &&
    alert.lng != null &&
    isFinite(alert.lat) &&
    isFinite(alert.lng) &&
    !(alert.lat === 0 && alert.lng === 0) // (0,0) is the Gulf of Guinea — treat as invalid
  );
};

// ─── Occurrence-time resolver ─────────────────────────────────────────────────
// ASSUMPTION (unconfirmed): the Alert type was not shared, so we defensively
// probe a few common field names in priority order. Returns epoch ms, or
// null if no usable timestamp is found. Update this list to match the real
// Alert shape once confirmed.
const getOccurredAtMs = (alert: Alert): number | null => {
  const candidate =
    (alert as any).occurredAt ??
    (alert as any).createdAt ??
    (alert as any).alertTime ??
    (alert as any).timestamp ??
    null;

  if (candidate == null) return null;

  const ms = new Date(candidate).getTime();
  return isNaN(ms) ? null : ms;
};

// ─── Latest-alert resolver ─────────────────────────────────────────────────────
// Picks the most recently occurred alert among those with valid coordinates
// AND a resolvable timestamp. Alerts missing both are ignored — they cannot
// be focused on (no coords) or ranked (no time).
// Tie-break: if timestamps are equal, the later item in array order wins.
const getLatestAlert = (alertData: Alert[]): Alert | null => {
  let latest: Alert | null = null;
  let latestMs = -Infinity;

  for (const alert of alertData) {
    if (!hasValidCoords(alert)) continue;

    const ms = getOccurredAtMs(alert);
    if (ms === null) continue;

    if (ms >= latestMs) {
      latest = alert;
      latestMs = ms;
    }
  }

  return latest;
};

// ─── Fallback center (Bangalore) ──────────────────────────────────────────────
// Used when no incident (selected or latest) has valid coordinates.
const FALLBACK_CENTER = { lat: 12.9716, lng: 77.5946 };

interface MapInnerProps {
  alertData: Alert[];
  focusedIncident: Alert | null;
  onMarkerClick: (id: number | string) => void;
}

// const MapInner: React.FC<MapInnerProps> = ({
//   alertData,
//   focusedIncident,
//   onMarkerClick,
// }) => {
//   const map = useMap();

//   const popupRef = useRef<PopupInstance | null>(null);

//   useEffect(() => {
//     // Only pan if map is ready AND the incident to focus has valid coords
//     if (!map || !focusedIncident || !hasValidCoords(focusedIncident)) return;
//     map.panTo({ lat: focusedIncident.lat, lng: focusedIncident.lng });
//   }, [map, focusedIncident]);

//   const focusedPosition =
//     focusedIncident && hasValidCoords(focusedIncident)
//       ? { lat: focusedIncident.lat, lng: focusedIncident.lng }
//       : null;

//   const { address, loading: addressLoading } =
//     useReverseGeocode(focusedPosition);

//   const closePopup = useCallback(() => {
//     if (popupRef.current) {
//       popupRef.current.setMap(null);
//       popupRef.current = null;
//     }
//   }, []);

//   const buildPopupContent = useCallback(
//     (incident: Alert) => {
//       const badgeColor = incident.priorityCode === 1 ? "#DC2626" : "#F59E0B";
//       return `
//         <div style="display:flex;align-items:center;gap:8px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #f3f4f6">
//           <div style="width:26px;height:26px;border-radius:50%;background:${badgeColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;box-shadow:0 2px 4px ${badgeColor}55">!</div>
//           <div>
//             <div style="font-size:12px;font-weight:700;color:#111;line-height:1.3">${incident.alertTypeName}</div>
//             <div style="font-size:9px;color:#9ca3af;font-weight:500;margin-top:1px;text-transform:uppercase;letter-spacing:0.04em">${incident.priorityName} · ${incident.moduleName}</div>
//           </div>
//         </div>
//         <div style="font-size:11px;color:#374151;line-height:1.45;margin-bottom:6px">${incident.message}</div>
//         <div style="display:flex;align-items:flex-start;gap:6px">
//           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
//           <span style="font-size:10.5px;color:#1E293B;font-weight:500;line-height:1.4">
//             ${addressLoading ? "Fetching address…" : (address ?? "Address unavailable")}
//           </span>
//         </div>
//       `;
//     },
//     [address, addressLoading],
//   );

//   // Create / destroy the popup when the focused incident itself changes
//   useEffect(() => {
//     if (!map || !focusedIncident || !focusedPosition) {
//       closePopup();
//       return;
//     }

//     closePopup();
//     const PopupClass = getCustomPopupClass();
//     const position = new google.maps.LatLng(
//       focusedPosition.lat,
//       focusedPosition.lng,
//     );
//     const popup = new PopupClass(
//       position,
//       buildPopupContent(focusedIncident),
//       () => {
//         closePopup();
//         onMarkerClick(focusedIncident.alertId);
//       },
//     );
//     popup.setMap(map);
//     popupRef.current = popup;

//     return () => closePopup();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     map,
//     focusedIncident?.alertId,
//     focusedPosition?.lat,
//     focusedPosition?.lng,
//   ]);

//   // Once the address resolves (or flips to "Fetching…"), just refresh the
//   // existing popup's content instead of tearing it down and replaying the
//   // pop-in animation.
//   useEffect(() => {
//     if (!popupRef.current || !focusedIncident) return;
//     popupRef.current.updateContent(buildPopupContent(focusedIncident));
//   }, [address, addressLoading, focusedIncident, buildPopupContent]);

//   return (
//     <>
//       {alertData
//         // ✅ Skip any alert with missing or invalid coordinates
//         .filter(hasValidCoords)
//         .map((inc: Alert) => {
//           const isFocused = focusedIncident?.alertId === inc.alertId;
//           const bg =
//             inc.priorityCode === 1
//               ? T.danger
//               : inc.priorityCode === 2
//                 ? T.warning
//                 : T.blue;

//           return (
//             <AdvancedMarker
//               key={inc.alertId}
//               position={{ lat: inc.lat, lng: inc.lng }}
//               onClick={() => onMarkerClick(inc.alertId)}
//             >
//               <div
//                 style={{
//                   background: bg,
//                   color: "#fff",
//                   borderRadius: "50%",
//                   width: isFocused ? 36 : 28,
//                   height: isFocused ? 36 : 28,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: isFocused ? 12 : 10,
//                   fontWeight: 700,
//                   boxShadow: isFocused ? `0 0 0 3px ${bg}40` : T.shadow,
//                   border: isFocused ? "2px solid #fff" : "none",
//                   cursor: "pointer",
//                   transition: "all .2s",
//                 }}
//               >
//                 {inc.moduleName}
//               </div>
//             </AdvancedMarker>
//           );
//         })}

//       {/* Destination marker — only render when the focused incident has valid coords */}
//       {focusedIncident && hasValidCoords(focusedIncident) && (
//         <AdvancedMarker
//           position={{
//             lat: focusedIncident.lat + 0.03,
//             lng: focusedIncident.lng + 0.01,
//           }}
//         >
//           <div
//             style={{
//               background: T.blue,
//               color: "#fff",
//               borderRadius: 8,
//               width: 32,
//               height: 32,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 16,
//             }}
//           >
//             🏢
//           </div>
//         </AdvancedMarker>
//       )}
//     </>
//   );
// };

const MapInner: React.FC<MapInnerProps> = ({
  alertData,
  focusedIncident,
  onMarkerClick,
}) => {
  const map = useMap();
  const popupRef = useRef<PopupInstance | null>(null);

  // Remembers which incident's popup the user explicitly closed via the
  // × button, so the fallback-to-latest logic upstream doesn't silently
  // snap it back open.
  const dismissedIdRef = useRef<string | number | null>(null);

  // Bumped on every direct marker click. This exists because
  // focusedIncident?.alertId can end up identical before and after a
  // close→reopen click (the "latest alert" fallback can resolve back to
  // the exact same incident), which means the creation effect's
  // dependency array sees no change and never re-runs. Including this
  // token forces the effect to re-evaluate every time regardless.
  const [interactionToken, setInteractionToken] = useState(0);

  const handleMarkerClick = useCallback(
    (id: string | number) => {
      dismissedIdRef.current = null;
      setInteractionToken((t) => t + 1);
      onMarkerClick(id);
    },
    [onMarkerClick],
  );

  useEffect(() => {
    if (!map || !focusedIncident || !hasValidCoords(focusedIncident)) return;
    map.panTo({ lat: focusedIncident.lat, lng: focusedIncident.lng });
  }, [map, focusedIncident]);

  const focusedPosition =
    focusedIncident && hasValidCoords(focusedIncident)
      ? { lat: focusedIncident.lat, lng: focusedIncident.lng }
      : null;

  const { address, loading: addressLoading } =
    useReverseGeocode(focusedPosition);

  const closePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.setMap(null);
      popupRef.current = null;
    }
  }, []);

  const handlePopupClose = useCallback(
    (incidentId: string | number) => {
      dismissedIdRef.current = incidentId;
      closePopup();
      onMarkerClick(incidentId);
    },
    [onMarkerClick, closePopup],
  );

  const buildPopupContent = useCallback(
    (incident: Alert) => {
      const badgeColor = incident.priorityCode === 1 ? "#DC2626" : "#F59E0B";
      return `
        <div style="display:flex;align-items:center;gap:8px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #f3f4f6">
          <div style="width:26px;height:26px;border-radius:50%;background:${badgeColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;box-shadow:0 2px 4px ${badgeColor}55">!</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#111;line-height:1.3">${incident.alertTypeName}</div>
            <div style="font-size:9px;color:#9ca3af;font-weight:500;margin-top:1px;text-transform:uppercase;letter-spacing:0.04em">${incident.priorityName} · ${incident.moduleName}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#374151;line-height:1.45;margin-bottom:6px">${incident.message}</div>
        <div style="display:flex;align-items:flex-start;gap:6px">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size:10.5px;color:#1E293B;font-weight:500;line-height:1.4">
            ${addressLoading ? "Fetching address…" : (address ?? "Address unavailable")}
          </span>
        </div>
      `;
    },
    [address, addressLoading],
  );

  // Create / destroy the popup. Now also re-evaluated on every marker
  // click via interactionToken, not just when the resolved incident id
  // literally changes.
  useEffect(() => {
    if (
      !map ||
      !focusedIncident ||
      !focusedPosition ||
      dismissedIdRef.current === focusedIncident.alertId
    ) {
      closePopup();
      return;
    }

    closePopup();
    const PopupClass = getCustomPopupClass();
    const position = new google.maps.LatLng(
      focusedPosition.lat,
      focusedPosition.lng,
    );
    const popup = new PopupClass(
      position,
      buildPopupContent(focusedIncident),
      () => handlePopupClose(focusedIncident.alertId),
    );
    popup.setMap(map);
    popupRef.current = popup;

    return () => closePopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    focusedIncident?.alertId,
    focusedPosition?.lat,
    focusedPosition?.lng,
    interactionToken,
  ]);

  useEffect(() => {
    if (!popupRef.current || !focusedIncident) return;
    popupRef.current.updateContent(buildPopupContent(focusedIncident));
  }, [address, addressLoading, focusedIncident, buildPopupContent]);

  return (
    <>
      {alertData.filter(hasValidCoords).map((inc: Alert) => {
        const isFocused = focusedIncident?.alertId === inc.alertId;
        const bg =
          inc.priorityCode === 1
            ? T.danger
            : inc.priorityCode === 2
              ? T.warning
              : T.blue;

        return (
          <AdvancedMarker
            key={inc.alertId}
            position={{ lat: inc.lat, lng: inc.lng }}
            onClick={() => handleMarkerClick(inc.alertId)}
          >
            <div
              style={{
                background: bg,
                color: "#fff",
                borderRadius: "50%",
                width: isFocused ? 36 : 28,
                height: isFocused ? 36 : 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isFocused ? 12 : 10,
                fontWeight: 700,
                boxShadow: isFocused ? `0 0 0 3px ${bg}40` : T.shadow,
                border: isFocused ? "2px solid #fff" : "none",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {inc.moduleName}
            </div>
          </AdvancedMarker>
        );
      })}

      {focusedIncident && hasValidCoords(focusedIncident) && (
        <AdvancedMarker
          position={{
            lat: focusedIncident.lat + 0.03,
            lng: focusedIncident.lng + 0.01,
          }}
        >
          <div
            style={{
              background: T.blue,
              color: "#fff",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏢
          </div>
        </AdvancedMarker>
      )}
    </>
  );
};

interface Props {
  alertData: Alert[];
  selectedIncident: Alert | null;
  onMarkerClick: (id: number | string) => void;
  onCallDriver?: () => void;
  onCallEmployee?: () => void;
}

export const SecurityMapPanel: React.FC<Props> = ({
  alertData,
  selectedIncident,
  onMarkerClick,
}) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // ─── Focus resolution ───────────────────────────────────────────────────────
  // Priority: explicit user selection wins. If nothing is selected, fall back
  // to the most recently occurred alert. Recomputed only when the alert list
  // or timestamps could have changed (i.e. when alertData reference changes).
  const latestAlert = useMemo(() => getLatestAlert(alertData), [alertData]);
  const focusedIncident = selectedIncident ?? latestAlert;

  // ✅ Only use focused incident coords if they are valid, else fall back
  const defaultCenter =
    focusedIncident && hasValidCoords(focusedIncident)
      ? { lat: focusedIncident.lat, lng: focusedIncident.lng }
      : FALLBACK_CENTER;

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId="security-map"
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          defaultZoom={13}
          disableDefaultUI
          gestureHandling="greedy"
        >
          <MapInner
            alertData={alertData}
            focusedIncident={focusedIncident}
            onMarkerClick={onMarkerClick}
          />
        </Map>
      </APIProvider>
    </div>
  );
};
