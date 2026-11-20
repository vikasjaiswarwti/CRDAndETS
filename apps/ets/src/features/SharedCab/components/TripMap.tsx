import React, { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import TripDrawer from "./TripDrawer";
import {
  decodePolyline,
  fetchOsrmRoute,
} from "../../route-tracking/hooks/useRouteTrackingMap";
import type { SharedCabResponse } from "../types/sharedCab.types";
import { buildOfficeSVG, buildVehicleSVG } from "../../route-tracking/icon";
import type { RouteLocationPayload } from "../../route-tracking/types/tracking.types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const DEFAULT_CENTER = { lat: 28.4645, lng: 77.0366 };
const DROP_TRIP_TYPE = 2;

type LatLng = { lat: number; lng: number };

const EMPTY_PATH: LatLng[] = [];

function buildPassengerSVG(sequence: number): string {
  return `
<svg width="36" height="36" viewBox="0 0 50 65" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25 2C37.7026 2 48 12.2974 48 25C48 34.1211 42.6906 42.0055 34.9854 45.7256L34.416 46.001L34.1084 46.5527L25 62.8926L15.8916 46.5527L15.584 46.001L15.0146 45.7256L14.2988 45.3652C6.98214 41.512 2 33.836 2 25C2 12.2974 12.2974 2 25 2Z" fill="#fff" stroke="#6DAF90" stroke-width="4"/>
   <text
    x="25"
    y="25"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, sans-serif"
    font-size="24"
    font-weight="700"
    fill="#3F9A6B"
  >
    ${sequence}
  </text>
</svg>`;
}

interface TripMapProps {
  trip: SharedCabResponse;
  // Live vehicle location pushed over SignalR
  currentLocation?: RouteLocationPayload | null;

  zoom?: number;
}

// Draws a polyline on the map and fits the viewport to it once
const RoutePolyline: React.FC<{
  path: LatLng[];
  color: string;
  fitBounds?: boolean;
}> = ({ path, color, fitBounds = false }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length === 0) return;

    const polyline = new google.maps.Polyline({
      path,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });

    if (fitBounds) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 48);
    }

    return () => polyline.setMap(null);
  }, [map, path, color, fitBounds]);

  return null;
};

// Marker that opens an InfoWindow (with the default close button) when clicked
const MarkerWithInfo: React.FC<{
  position: LatLng;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
  info: React.ReactNode;
}> = ({ position, title, isOpen, onToggle, onClose, icon, info }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        title={title}
        onClick={onToggle}
      >
        {icon}
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow
          anchor={marker}
          headerContent={<strong style={{ fontSize: 14 }}>{title}</strong>}
          onCloseClick={onClose}
          maxWidth={260}
        >
          {info}
        </InfoWindow>
      )}
    </>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({
  label,
  value,
}) =>
  value != null && value !== "" ? (
    <div style={{ fontSize: 12, marginBottom: 4 }}>
      <span style={{ color: "#6B7280" }}>{label}: </span>
      <span style={{ color: "#111827" }}>{value}</span>
    </div>
  ) : null;

// Fetches a driving route from OSRM between two points; empty while loading or on failure
const useOsrmPath = (origin: LatLng | null, destination: LatLng | null) => {
  // Path is stored with the request key so a stale route is never shown for new points
  const [route, setRoute] = useState<{ key: string; path: LatLng[] } | null>(
    null,
  );
  const key =
    origin && destination
      ? `${origin.lat},${origin.lng};${destination.lat},${destination.lng}`
      : null;

  useEffect(() => {
    if (!key || !origin || !destination) return;
    const controller = new AbortController();
    fetchOsrmRoute(origin, destination, controller.signal)
      .then((res) => setRoute({ key, path: decodePolyline(res.geometry) }))
      .catch((err) => {
        if (err?.name !== "AbortError") setRoute({ key, path: [] });
      });
    return () => controller.abort();
    // key captures origin/destination coordinates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return route && route.key === key ? route.path : EMPTY_PATH;
};

const TripMap: React.FC<TripMapProps> = ({
  trip,
  currentLocation,
  zoom = 13,
}) => {
  // Key of the marker whose InfoWindow is open; only one open at a time
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const toggleInfo = (key: string) =>
    setOpenInfoKey((prev) => (prev === key ? null : key));
  const closeInfo = () => setOpenInfoKey(null);

  const plannedPath = useMemo(
    () => decodePolyline(trip.plannedRoutePolyline),
    [trip.plannedRoutePolyline],
  );

  // Merge the socket's live per-passenger status (boarding, no-show, times) onto the
  // API's passenger list so markers/drawer reflect the latest state, not the snapshot at load
  const passengers = useMemo(() => {
    const livePassengers = currentLocation?.passengers;
    if (!livePassengers?.length) return trip.passengers;
    return trip.passengers.map((passenger) => {
      const live = livePassengers.find((p) => p.empId === passenger.empId);
      return live
        ? {
            ...passenger,
            ...live,
            noShowReason: live.noShowReason ?? passenger.noShowReason,
          }
        : passenger;
    });
  }, [trip.passengers, currentLocation?.passengers]);

  // Travelled path: prefer the encoded actual route, fall back to raw GPS points

  // Prefer the live socket location, fall back to the last GPS point from the API
  const cabPosition: LatLng | null = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : trip.latestGps
      ? { lat: trip.latestGps.latitude, lng: trip.latestGps.longitude }
      : null;

  // Drop: office → employee, Pickup: employee → office
  const isDrop = trip.tripType === DROP_TRIP_TYPE;
  const startPoint = plannedPath[0] ?? null;
  const endPoint = plannedPath[plannedPath.length - 1] ?? null;
  const officePosition = trip.officeLat != null &&
    trip.officeLng != null && { lat: trip.officeLat, lng: trip.officeLng };
  const employeePositions = passengers
    .filter(
      (passenger) =>
        passenger.plannedLat != null && passenger.plannedLng != null,
    )
    .map((passenger) => ({
      id: passenger.empId,
      name:
        `${passenger.firstname} ${passenger.lastName}`.trim() ||
        trip.employeeName,
      position: { lat: passenger.plannedLat, lng: passenger.plannedLng },
      passenger,
    }));
  const fallbackEmployeePosition = isDrop ? endPoint : startPoint;

  // Employee this shared link belongs to
  const currentPassenger =
    passengers.find((passenger) => passenger.empId === trip.empId) ??
    passengers[0];
  const employeePosition: LatLng | null =
    currentPassenger?.plannedLat != null && currentPassenger?.plannedLng != null
      ? { lat: currentPassenger.plannedLat, lng: currentPassenger.plannedLng }
      : fallbackEmployeePosition;
  const isBoarded =
    !!currentPassenger?.empSigninTime && !currentPassenger?.noShow;

  // Full route: Pickup employee → office, Drop office → employee
  const tripRoutePath = useOsrmPath(
    isDrop ? officePosition || null : employeePosition,
    isDrop ? employeePosition : officePosition || null,
  );

  // Live leg from the cab:
  //   Pickup — not boarded: cab → employee, boarded: cab → office
  //   Drop   — not boarded: cab → office,   boarded: cab → employee
  const liveTarget =
    isDrop === isBoarded ? employeePosition : officePosition || null;
  const liveLegPath = useOsrmPath(
    trip.isCompleted ? null : cabPosition,
    liveTarget,
  );
  const officeName = trip.officeDisplayName || trip.officeLocName || "Office";
  const cabHeading =
    cabPosition && liveLegPath.length > 1
      ? getBearing(cabPosition, liveLegPath[1])
      : 0;

  return (
    <div style={{ width: "100%", height: "85vh" }}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId="commutr-trip-map"
          defaultCenter={cabPosition ?? startPoint ?? DEFAULT_CENTER}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapTypeControl={false} // removes the Map / Satellite toggle
          streetViewControl={false} // removes the pegman icon
          fullscreenControl={true} // removes the expand/fullscreen icon
          style={{ width: "100%", height: "100%" }}
          onClick={closeInfo}
        >
          <RoutePolyline path={liveLegPath} color="#3B82F6" />
          <RoutePolyline
            path={tripRoutePath.length > 0 ? tripRoutePath : plannedPath}
            color="#e6638690"
            fitBounds
          />

          {officePosition && (
            <MarkerWithInfo
              position={officePosition}
              title={officeName}
              isOpen={openInfoKey === "office"}
              onToggle={() => toggleInfo("office")}
              onClose={closeInfo}
              icon={<SvgIcon svg={buildOfficeSVG()} />}
              info={<InfoRow label="Address" value={trip.officeAddress} />}
            />
          )}
          {employeePositions.length > 0
            ? employeePositions.map(({ id, name, position, passenger }) => (
                <MarkerWithInfo
                  key={id}
                  position={position}
                  title={name}
                  isOpen={openInfoKey === `emp-${id}`}
                  onToggle={() => toggleInfo(`emp-${id}`)}
                  onClose={closeInfo}
                  icon={
                    <SvgIcon svg={buildPassengerSVG(passenger.paxOrder || 1)} />
                  }
                  info={
                    <>
                      <InfoRow
                        label="Employee ID"
                        value={passenger.employeeID}
                      />
                      <InfoRow label="Mobile" value={passenger.mobileno} />
                      <InfoRow label="Address" value={passenger.address} />
                      <InfoRow
                        label="Scheduled"
                        value={passenger.plannedScheduleTime}
                      />
                      <InfoRow
                        label="Status"
                        value={passenger.paxTrackingStatus}
                      />
                      {passenger.noShow && (
                        <InfoRow
                          label="No Show"
                          value={passenger.noShowReason || "Yes"}
                        />
                      )}
                    </>
                  }
                />
              ))
            : fallbackEmployeePosition && (
                <MarkerWithInfo
                  position={fallbackEmployeePosition}
                  title={trip.employeeName || "Employee"}
                  isOpen={openInfoKey === "emp-fallback"}
                  onToggle={() => toggleInfo("emp-fallback")}
                  onClose={closeInfo}
                  icon={<SvgIcon svg={buildPassengerSVG(1)} />}
                  info={<InfoRow label="Trip" value={trip.tripTypeName} />}
                />
              )}
          {cabPosition && (
            <AdvancedMarker
              position={cabPosition}
              title="Cab"
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
            >
              <SvgIcon svg={buildVehicleSVG(cabHeading)} />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      <TripDrawer trip={trip} passengers={passengers} />
    </div>
  );
};

// Renders a trusted SVG string from route-tracking/icon as marker content
const SvgIcon: React.FC<{ svg: string }> = ({ svg }) => (
  <div style={{ lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
);

// Compass bearing in degrees (0 = north) from one point to another
const getBearing = (from: LatLng, to: LatLng) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

export default TripMap;
