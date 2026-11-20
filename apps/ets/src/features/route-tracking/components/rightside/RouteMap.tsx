// src/pages/RouteTracking/components/RouteMap.tsx
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useRouteTrackingMap } from "../../hooks/useRouteTrackingMap";
import { useSelector, useDispatch } from "react-redux";
import { addEvent, removeEvent } from "../../slice/routeTrackingSlice";
import type {
  GPSPointRight,
  // RouteLocationPayload,
  TripPassenger,
  TripResponse,
  TripTrackingResponse,
  Stops,
} from "../../types/tracking.types";
import type { RootState } from "../../../../app/store";

interface RouteMapProps {
  leftData: TripResponse;
  stops: Stops[];
  isShuttleTrip: boolean;
  trip: TripTrackingResponse;
  passengers: TripPassenger[];
  showActualRoute?: boolean;
  showPlannedRoute?: boolean;
  showSignInEmp?: boolean;
  showSignOutEmp?: boolean;
  showNoShow?: boolean;
  currentPosition?: { lat: number; lng: number; bearing?: number };
  trackingCoords?: GPSPointRight[]; // vehicle path coords
  onSpeedUpdate?: (speed: number) => void;
  isPlaying?: boolean;
  speed?: number;
  onProgress?: (pct: number) => void;
  onSeek?: (pct: number) => void;
  officePosition: { lat: number; lng: number; officeName: string };
}
// In RouteMap, expose via ref
export interface RouteMapHandle {
  seekTo: (pct: number) => void;
}

const RouteMap = React.forwardRef<RouteMapHandle, RouteMapProps>(
  (
    {
      leftData,
      stops,
      isShuttleTrip,
      trip,
      passengers,
      showActualRoute,
      showPlannedRoute,
      showSignInEmp,
      showSignOutEmp,
      showNoShow,
      currentPosition,
      officePosition,
      trackingCoords = [], // vehicle path coords
      onSpeedUpdate,
      isPlaying,
      speed,
      onProgress,
      onSeek,
    },
    ref,
  ) => {
    // console.log(showSignInEmp, "showSignInEmp");
    const dispatch = useDispatch();
    // After const dispatch = useDispatch();
    const onGpsLossChange = useCallback(
      (isLost: boolean) => {
        dispatch(isLost ? addEvent("gpsLoss") : removeEvent("gpsLoss"));
      },
      [dispatch],
    );
    const onGpsLossChangeRef = useRef(onGpsLossChange);
    useEffect(() => {
      onGpsLossChangeRef.current = onGpsLossChange;
    }, [onGpsLossChange]);
    const { isReplayPlaying, selectedEmployee } = useSelector(
      (state: RootState) => state.routeTrackingUi,
    );
    // console.log(selectedEmployee, "selectedEmployee");
    // Add this ref inside RouteMap
    const onProgressRef = useRef(onProgress);
    const onSpeedUpdateRef = useRef(onSpeedUpdate);
    useEffect(() => {
      onSpeedUpdateRef.current = onSpeedUpdate;
    }, [onSpeedUpdate]);
    // console.log(trip, "trip");
    const {
      mapRef,
      isLoaded,
      initMap,
      drawPolylines,
      drawEmployeepoints,
      drawOfficeMarker,
      toggleSigninMarkers, // ← add
      toggleSignoutMarkers, // ← add
      toggleNoShowMarkers,
      // clearWaypoints,
      // ---------- animation
      setVehicleCoords,
      startAnimation,
      pauseAnimation,
      setAnimationSpeed,
      seekTo,
      updateLiveMarker, // ← add
      clearNextPickupPolyline,
      drawStopPoints,
    } = useRouteTrackingMap({ isReplayPlaying, officePosition });
    // ({
    //   defaultLat: currentPosition.lat,
    //   defaultLng: currentPosition.lng,
    // });
    // console.log(passengers, "passengers")

    // Initialize map once
    useEffect(() => {
      initMap();
    }, [initMap]);

    useImperativeHandle(ref, () => ({
      seekTo: (pct: number) => {
        pauseAnimation();
        seekTo?.(pct);
        onSeek?.(pct);
      },
    }));

    // Re-draw polylines when map is ready or toggles change
    useEffect(() => {
      if (isLoaded) {
        drawPolylines(trip, showActualRoute, showPlannedRoute);
      }
    }, [isLoaded, trip, showActualRoute, showPlannedRoute, drawPolylines]);
    //
    useEffect(() => {
      if (!isLoaded) return;

      drawOfficeMarker();
      if (isShuttleTrip) {
        drawEmployeepoints(
          [],
          false,
          false,
          leftData.shouldUseSignalR,
          false,
          undefined,
          leftData.isCompleted,
        );
        drawStopPoints(stops);
        return;
      }

      drawStopPoints([]);
      if (passengers?.length) {
        drawEmployeepoints(
          passengers,
          false,
          false,
          leftData.shouldUseSignalR,
          false,
          selectedEmployee ?? undefined,
          leftData.isCompleted,
        );
      }
    }, [
      isLoaded,
      isShuttleTrip,
      stops,
      passengers,
      drawEmployeepoints,
      drawStopPoints,
      drawOfficeMarker,
      leftData.shouldUseSignalR,
      selectedEmployee,
    ]);
    // -----------------------
    // Keep it fresh on every render
    useEffect(() => {
      onProgressRef.current = onProgress;
    }, [onProgress]);
    // Load tracking coords once they arrive (or change)
    const coordsLoaded = useRef(false);
    // Pass a stable wrapper that reads from the ref
    useEffect(() => {
      if (isLoaded && trackingCoords.length > 1) {
        setVehicleCoords(
          trackingCoords,
          (pct) => onProgressRef.current?.(pct),
          onSpeedUpdate,
          isReplayPlaying,
          ((isLost: boolean) => onGpsLossChangeRef.current(isLost)) as any,
        );
        coordsLoaded.current = true;
      }
    }, [isLoaded, trackingCoords, setVehicleCoords]);

    // React to play / pause
    useEffect(() => {
      if (!coordsLoaded.current) return;
      if (isPlaying) {
        startAnimation(speed ?? 1, (isLost) =>
          onGpsLossChangeRef.current(isLost),
        );
      } else {
        pauseAnimation();
      }
    }, [isPlaying]);

    // Speed change while playing
    useEffect(() => {
      setAnimationSpeed(speed ?? 1);
    }, [speed]);
    // ── Toggle visibility cheaply — no redraw ────────────────────────────────────
    useEffect(() => {
      toggleSigninMarkers(showSignInEmp ?? false);
    }, [showSignInEmp, toggleSigninMarkers]);

    useEffect(() => {
      toggleSignoutMarkers(showSignOutEmp ?? false);
    }, [showSignOutEmp, toggleSignoutMarkers]);

    useEffect(() => {
      toggleNoShowMarkers(showNoShow ?? false);
    }, [showNoShow, toggleNoShowMarkers]);

    useEffect(() => {
      if (!currentPosition || !isLoaded) return;
      updateLiveMarker(
        currentPosition.lat,
        currentPosition.lng,
        passengers,
        stops,
        isShuttleTrip,
        officePosition,
        currentPosition.bearing,
        leftData.tripType as number,
      );
    }, [
      currentPosition,
      isLoaded,
      updateLiveMarker,
      passengers,
      officePosition,
      leftData.tripType,
    ]);
    useEffect(() => {
      return () => {
        clearNextPickupPolyline();
      };
    }, [clearNextPickupPolyline]);
    return (
      <div
        ref={mapRef}
        style={{ width: "100%", height: "80vh" }}
        className="rounded-xl overflow-hidden "
      />
    );
  },
);
RouteMap.displayName = "RouteMap";

export default RouteMap;
