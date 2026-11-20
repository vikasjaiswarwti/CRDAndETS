import HeaderStats from "../components/HeaderStats";
import LeftSidebar from "../components/LeftSidebar";
import MapSection from "../components/MapSection";
import AppHeader from "../../../shared/components/RoutingHeader/RoutingHeader";
import {
  useGetGPSTrackingStatusQuery,
  useGetTrackingStatusQuery,
} from "../services/routeTrackingApi";
import { LoadingSpinner } from "../../../shared/components/ui";
import { formatDateTime } from "../utils/commonFunction";
import { useSearchParams } from "react-router-dom";
import { T } from "../../../styles/tokens";
import { useSignalRTracking } from "../hooks/useSignalRTracking";
import { useDispatch, useSelector } from "react-redux";
import { useRouteTrackingModal } from "../hooks/useRouteTrackingModal";

// import type { RouteLocationPayload } from "../types/tracking.types";
import EmployeeAttendence from "../components/EmployeeAttendence";
import NoShowComponent from "../components/NoShowComponent";
import StopReachComponent from "../components/StopReachComponent";
import TripCloseComponent from "../components/TripCloseComponent";
import {
  setTripClose,
  setNoShow,
  setStopReach,
  setBoardDeboardClose,
} from "../slice/routeTrackingSlice";
import MarkBoardDeboard from "../components/MarkBoardDeboard";
import { Result, Button, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { MenuOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { RouteLocationPayload } from "../types/tracking.types";

// ─── Inner component — hooks always run, no conditional hook calls ────────────
function RouteTrackingInner({ dsId }: { dsId: number }) {
  const { isOpen, openModal, closeModal } = useRouteTrackingModal();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const token = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();
  const { tripClose, noShow, boardDeBoard, stopReach } = useSelector(
    (state: any) => state.routeTrackingUi,
  );
  // console.log(boardDeBoard, "boardDeBoard")
  const {
    data: leftData,
    isLoading: isLoadingLeft,
    error,
  } = useGetTrackingStatusQuery({ DsId: String(dsId) });
  // console.log(error, "error");
  const { data: rightData, isLoading: isLoadingRight } =
    useGetGPSTrackingStatusQuery({ DsId: String(dsId) });
  const shouldUseSignalR = leftData?.shouldUseSignalR ?? false;

  // ── SignalR hook — always called, enabled flag controls connection ──────────
  const { currentLocation } = useSignalRTracking(
    dsId,
    token,
    leftData?.trackingMode ?? "",
    shouldUseSignalR,
  );
  console.log(currentLocation, "currentLocation");
  const isShuttleTrip = Boolean(leftData?.stops?.length);
  const passengers = shouldUseSignalR
    ? (currentLocation?.passengers ?? leftData?.passengers ?? [])
    : (leftData?.passengers ?? []);
  const stops = shouldUseSignalR
    ? (currentLocation?.shuttle?.stops ?? leftData?.stops ?? [])
    : (leftData?.stops ?? []);

  if (isLoadingLeft || isLoadingRight) {
    return <LoadingSpinner fullScreen variant="fullscreen" />;
  }
  if (leftData?.isTripFound == false || !!error) {
    return <ErrorInfoSection />;
  }
  const liveGps: RouteLocationPayload =
    leftData?.isCompleted == true
      ? null
      : currentLocation?.latitude != null
        ? currentLocation
        : rightData?.latestGps;

  const pageContent = (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* officeDisplayName */}
        <AppHeader
          variant="route-tracking"
          title="Route Tracking"
          userInitials="AM"
          notificationCount={0}
          tripId={leftData?.dsId}
          isGuard={leftData?.isGuard ?? false}
          datetime={formatDateTime(leftData?.dsDate ?? "")}
          tripType={leftData?.tripType ?? (1 as number)}
          tripTypeName={leftData?.tripType == 1 ? "Login" : "Logout"}
          officeName={leftData?.officeLocName ?? ""}
          onBack={() => history.back()}
        />
        <div
          style={{
            padding: isMobile ? "0 6px" : "0 16px",
            background: T.page.bg,
          }}
        >
          {leftData && (
            <HeaderStats
              data={leftData}
              employeeAttendenceOpen={openModal}
              isDrop={leftData.tripTypeName == "Drop"}
              passengers={passengers}
            />
          )}
          <div className="grid flex-1 overflow-hidden grid-cols-[1.1fr_10px_1.9fr] max-lg:grid-cols-1 max-md:overflow-scroll">
            {!isMobile && leftData?.isTripFound && (
              <LeftSidebar
                leftData={leftData!}
                passengers={passengers}
                stops={stops}
                isShuttleTrip={isShuttleTrip}
              />
            )}
            {!isMobile && <div />}
            {leftData && rightData?.isTripFound && (
              // ↓ Pass currentLocation so live marker updates work
              <MapSection
                rightData={rightData}
                leftData={leftData!}
                passengers={passengers}
                currentLocation={liveGps}
                trackingMode={leftData.trackingMode}
                stops={stops}
                isShuttleTrip={isShuttleTrip}
              />
            )}
            {/* ── Mobile: floating trip-details button (bottom-left) ── */}
            {isMobile && leftData?.isTripFound && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  position: "absolute",
                  bottom: 24,
                  right: 16,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "#00A76F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                }}
              >
                <MenuOutlined style={{ fontSize: 14 }} />
                Trip Details
              </button>
            )}
            {/* ── Mobile: Drawer containing LeftSidebar ── */}
            {isMobile && (
              <Drawer
                title="Trip Passenger Details"
                placement="bottom"
                height="80vh"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                styles={{
                  header: {
                    width: "100%",
                    borderBottom: "1px solid #e5e7eb",
                  },
                  body: {
                    padding: 0,
                  },
                  close: {
                    width: 0,
                    fontSize: 14,
                    height: 36,
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                }}
              >
                {leftData?.isTripFound && (
                  <LeftSidebar
                    leftData={leftData!}
                    passengers={passengers}
                    isMobile={true}
                    stops={stops}
                    isShuttleTrip={isShuttleTrip}
                  />
                )}
              </Drawer>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <EmployeeAttendence
          open={isOpen}
          onClose={closeModal}
          passengers={passengers}
        />
      )}
      {noShow && leftData && (
        <NoShowComponent
          open={noShow}
          onClose={() => dispatch(setNoShow(false))}
          passengers={passengers}
          leftData={leftData}
        />
      )}
      {stopReach && leftData && (
        <StopReachComponent
          open={stopReach}
          onClose={() => dispatch(setStopReach(false))}
          stops={stops}
          leftData={leftData}
        />
      )}
      {boardDeBoard && leftData && (
        <MarkBoardDeboard
          open={boardDeBoard}
          onClose={() => dispatch(setBoardDeboardClose(false))}
          passengers={passengers}
          leftData={leftData}
        />
      )}
      {tripClose && leftData && (
        <TripCloseComponent
          open={tripClose}
          onClose={() => dispatch(setTripClose(false))}
          leftData={leftData}
        />
      )}
    </>
  );

  return pageContent;
}

// ─── Outer shell — validates dsId before mounting inner component ─────────────
const RouteTracking = () => {
  const [searchParams] = useSearchParams();
  const dsIdParam = searchParams.get("dsId");
  const dsId = Number(dsIdParam);
  const isValidDsId =
    dsIdParam !== null &&
    !Number.isNaN(dsId) &&
    Number.isInteger(dsId) &&
    dsId > 0;

  if (!isValidDsId) {
    return <ErrorInfoSection />;
  }

  return <RouteTrackingInner dsId={dsId} />;
};

export default RouteTracking;
const ErrorInfoSection = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="warning"
      title="Invalid Trip ID"
      subTitle="Please enter the correct Trip ID."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Go Back
        </Button>
      }
    />
  );
};
