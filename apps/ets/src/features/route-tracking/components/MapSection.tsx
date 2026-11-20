import { useState, useCallback, useRef, useEffect } from "react";
import RouteMap from "./rightside/RouteMap";
import { ActionsPanel } from "./rightside/ActionPanel";
import MapLegend from "./rightside/MapLegend";
import PlaybackBar from "./rightside/PlaybackBar";
import { useSelector } from "react-redux";
import type {
  TripPassenger,
  TripTrackingResponse,
  RouteLocationPayload,
  GPSPointRight,
  TripResponse,
  Miscellaneous,
  Stops,
} from "../types/tracking.types";
import Speedometer from "./rightside/Speedometer";
import type { RouteMapHandle } from "./rightside/RouteMap";
import GpsLossOverlay from "./rightside/GpsLossOverlay";
import { formatTime } from "../utils/commonFunction";

import { usePlaybackEvents } from "../hooks/usePlaybackEvents";
import { TRIP_STATUS } from "../constants/trackConstant";
import TrafficLegend from "./rightside/TrafficLegend";

interface MapSectionProps {
  rightData: TripTrackingResponse;
  leftData: TripResponse;
  passengers: TripPassenger[];
  currentLocation?: RouteLocationPayload | null;
  trackingMode?: string;
  stops?: Stops[];
  isShuttleTrip: boolean;
}

function MapSection({
  rightData,
  leftData,
  passengers,
  currentLocation,
  trackingMode,
  stops = [],
  isShuttleTrip = false,
}: MapSectionProps) {
  // const dispatch= useDispatch();
  const [showActualRoute, setShowActualRoute] = useState(false);
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);
  const [showSignInEmp, _setShowSignInEmp] = useState(false);
  const [showSignOutEmp, _setShowSignOutEmp] = useState(false);

  const [showNoShowEmp, _setShowNoShowEmp] = useState(false);
  const [showmeter, setShowMeter] = useState(true);

  const { isReplayPlaying, actualSignIn, actualSignOut } = useSelector(
    (state: any) => state.routeTrackingUi,
  );
  // console.log("actualSignIn, actualSignOut", actualSignIn, actualSignOut);
  const selectedEvents = useSelector(
    (state: any) => state.routeTrackingUi.selectedEvents,
  );
  const routeMapRef = useRef<RouteMapHandle>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);

  // ────────────────────────────────────────────────────────────────────────────
  // ✅ ADD: Event detection and interval generation hook
  // ────────────────────────────────────────────────────────────────────────────

  const { eventMarkers, intervalMarks, errorMessage } = usePlaybackEvents(
    rightData.gpsPoints,
    // waypointData,
    passengers,
    leftData.actualStartTime ?? leftData.scheduledStartTime,
    leftData.actualEndTime ?? leftData.scheduledEndTime,
    {
      overspeadThreshold: 80,
      stoppingThreshold: 10,
      intervalMinutes: 30,
      enableAutoDetection: true,
    },
  );

  // ✅ ADD: Optional error handling
  useEffect(() => {
    if (errorMessage) {
      console.warn("[MapSection] Event detection warning:", errorMessage);
    }
  }, [errorMessage]);

  const handleSeek = useCallback((pct: number) => {
    setProgress(pct);
    setIsPlaying(false);
    routeMapRef.current?.seekTo(pct);
  }, []);

  const handleProgress = useCallback((pct: number) => {
    setProgress(pct);
  }, []);

  const liveTrailRef = useRef<RouteLocationPayload[]>([]);
  const [_liveCoords, setLiveCoords] = useState<RouteLocationPayload[]>([]);

  useEffect(() => {
    if (!currentLocation || trackingMode !== "LIVE_SIGNALR") return;
    liveTrailRef.current = [...liveTrailRef.current, currentLocation];
    setLiveCoords([...liveTrailRef.current]);
  }, [currentLocation, trackingMode]);

  useEffect(() => {
    liveTrailRef.current = [];
    setLiveCoords([]);
  }, [rightData]);

  const officePosition = {
    lat: leftData?.officeLat ?? 0,
    lng: leftData?.officeLng ?? 0,
    officeName: leftData.officeLocName ?? "",
  };
  const trackingSource: "driverApp" | "fixedDevice" =
    rightData.latestGps?.source === "fixedDevice" ? "fixedDevice" : "driverApp";
  const actualStartTime = formatTime(leftData.actualStartTime ?? "");
  const actualEndTime = formatTime(leftData.actualEndTime ?? "");
  const isGpsLost = selectedEvents.includes("gpsLoss");
  const endTime =
    actualEndTime ??
    new Date(
      new Date(actualStartTime).getTime() + 60 * 60 * 1000,
    ).toISOString();
  const miscellaneous: Miscellaneous = currentLocation?.miscellaneous
    ? typeof currentLocation.miscellaneous === "string"
      ? JSON.parse(currentLocation.miscellaneous)
      : currentLocation.miscellaneous
    : {
        speed: 0,
        gpsLoss: false,
        networkLoss: false,
        bearing: 0,
      };

  const liveSpeed = miscellaneous.speed;
  const bearing = miscellaneous.bearing;
  const onCharging = miscellaneous.onCharging;
  // console.log("live speed ", typeof currentLocation?.miscellaneous);
  const handlePrev = useCallback(() => {
    const next = Math.max(0, progress - 5);
    setProgress(next);
    setIsPlaying(false);
    routeMapRef.current?.seekTo(next);
  }, [progress]);

  const handleNext = useCallback(() => {
    const next = Math.min(100, progress + 5);
    setProgress(next);
    setIsPlaying(false);
    routeMapRef.current?.seekTo(next);
  }, [progress]);
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <RouteMap
        leftData={leftData}
        stops={stops}
        isShuttleTrip={isShuttleTrip}
        ref={routeMapRef}
        trip={rightData}
        passengers={passengers}
        showPlannedRoute={showPlannedRoute}
        showActualRoute={showActualRoute}
        showSignInEmp={showSignInEmp || actualSignIn} //  || selectedEvents.includes("actualSignIn")}
        showNoShow={showNoShowEmp || selectedEvents.includes("noShow")}
        showSignOutEmp={showSignOutEmp || actualSignOut} // || selectedEvents.includes("actualSignOut") }
        isPlaying={isPlaying}
        officePosition={officePosition}
        trackingCoords={rightData.gpsPoints as GPSPointRight[]}
        // trackingCoords={waypointData as GPSPointRight[]}
        onSpeedUpdate={(spd) => setVehicleSpeed(spd)}
        currentPosition={
          currentLocation
            ? {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
                bearing: bearing,
              }
            : undefined
        }
        speed={speed}
        onProgress={handleProgress}
        onSeek={handleSeek}
      />

      <MapLegend
        showActual={showActualRoute}
        showPlanned={showPlannedRoute}
        hideShowPlanned={!!rightData.plannedRoutePolyline}
        hideShowActual={rightData.isCompleted}
        onTogglePlanned={() => setShowPlannedRoute((p) => !p)}
        onToggleActual={() => setShowActualRoute((p) => !p)}
      />

      <ActionsPanel
        shouldStart={leftData.transTripStatusCode < TRIP_STATUS.STARTED}
        isCompleted={leftData.isCompleted}
        isShuttleTrip={isShuttleTrip}
        isPickup={leftData.tripTypeName}
        showmeter={showmeter}
        selectedSource={trackingSource}
        onToggle={(key, val) => {
          if (key === "speed") setShowMeter(val);
        }}
      />

      {showmeter && leftData.isCompleted && (
        <Speedometer speed={vehicleSpeed} />
      )}
      {showmeter && !leftData.isCompleted && (
        <Speedometer
          speed={Number(liveSpeed ?? 0)}
          batteryPercentage={currentLocation?.batteryPercentage}
          onCharging={onCharging}
        />
      )}
      <GpsLossOverlay isLost={isGpsLost} />
      {isReplayPlaying && (
        <>
          <TrafficLegend />
          <PlaybackBar
            progress={progress}
            isPlaying={isPlaying}
            speed={speed}
            startTime={actualStartTime}
            endTime={endTime}
            currentTime="06:48 AM"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            // onPrev={() => console.log("prev stop")}
            // onNext={() => console.log("next stop")}
            // After
            onPrev={handlePrev}
            onNext={handleNext}
            onSpeedChange={setSpeed}
            onSeek={handleSeek}
            selectedEvents={selectedEvents}
            eventMarkers={eventMarkers}
            intervalMarks={intervalMarks}
            showIntervals={true}
          />
        </>
      )}
    </div>
  );
}
export default MapSection;
