import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import AppHeader from "../../../shared/components/RoutingHeader/RoutingHeader";
import OngoingTripsSidebar from "../components/OngoingTripsSidebar";
import TripMapPanel from "../components/TripMapPanel";
// import { mockData } from "../constants";
import TripEmployeeModal from "../components/TripEmployeeModal";
import { useSignalRBulkTracking } from "../hooks/useSignalRBulkTracking";
import type { TripTrackingPacket } from "../types/progressTrip.types";
import type { RootState } from "../../../app/store/index"; // adjust to your store path
import { useGetPolylineMultiQuery } from "../services/progressTripApi";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { Drawer, Button } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
// import { MenuOutlined } from "@ant-design/icons";
const MultipleViewTrip: React.FC = () => {
  const isMobile = useIsMobile();
  const selectedRowKeys = useSelector(
    (state: RootState) => state.progressTrips.selectedTripIds,
  );
  const { businessFullName } = useSelector(
    (state: RootState) => state.business,
  );
  const token = useSelector(
    (state: RootState) => state.auth.accessToken ?? null,
  );
  // ✅ drawer open state (mobile only)
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: multiTrip,
    // refetch,
    isFetching,
  } = useGetPolylineMultiQuery({
    dsIds: selectedRowKeys,
  });
  // ✅ Fix 1: always initialize with empty array — populate once data loads
  const [selectedDsIds, setSelectedDsIds] = useState<number[]>([]);

  // ✅ Fix 2: when multiTrip loads, select all trips by default
  useEffect(() => {
    if (multiTrip?.trips) {
      setSelectedDsIds(multiTrip.trips.map((t: TripTrackingPacket) => t.dsId));
    }
  }, [multiTrip]);

  const [selectedTrip, setSelectedTrip] = useState<TripTrackingPacket | null>(
    null,
  );
  const { multiTrackData, isConnected } = useSignalRBulkTracking(
    token,
    selectedRowKeys,
  );
  // console.log(multiTrip, "multitrip");
  const selectedTrips = useMemo(
    () =>
      (multiTrip?.trips ?? []).filter((t) => selectedDsIds.includes(t.dsId)),
    [multiTrip?.trips, selectedDsIds],
  );

  const closeTripModal = () => setSelectedTrip(null);
  // console.log(selectedTrips, "selectedTrips");
  const latestLivePacket = multiTrackData ?? null;
  return (
    <>
      <AppHeader
        variant="ongoing"
        title="Multi Trip View"
        officeName={businessFullName ?? ""}
        onBack={() => history.back()}
        isLive={isConnected ?? false}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "90vh" : "95vh",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {!isMobile && (
            <OngoingTripsSidebar
              trips={multiTrip?.trips ?? []}
              selectedDsIds={selectedDsIds}
              onSelectionChange={setSelectedDsIds}
              onViewEmployees={setSelectedTrip}
              // refetch={refetch}
              isLoading={isFetching}
            />
          )}

          <div style={{ flex: 1, minHeight: 0, padding: isMobile ? 4 : 0, borderRadius:isMobile? 16:0 }}>
            <TripMapPanel
              // trips={multiTrip?.trips ?? []}
              selectedTrips={selectedTrips ?? []}
              liveData={latestLivePacket}
            />
          </div>
        </div>
      </div>
      {isMobile && (
        <Button
          type="primary"
          shape="circle"
          icon={<UnorderedListOutlined />}
          size="small"
          onClick={() => setDrawerOpen(true)}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            width: 42,
            height: 42,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        />
      )}

      {/* ✅ Mobile: render sidebar inside a Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Trips"
          width="85%"
          bodyStyle={{ padding: 0 }}
        >
          <OngoingTripsSidebar
            trips={multiTrip?.trips ?? []}
            selectedDsIds={selectedDsIds}
            onSelectionChange={setSelectedDsIds}
            onViewEmployees={setSelectedTrip}
            // refetch={refetch}
            isLoading={isFetching}
          />
        </Drawer>
      )}
      <TripEmployeeModal
        open={!!selectedTrip}
        onClose={closeTripModal}
        trip={selectedTrip ?? null}
      />
    </>
  );
};

export default MultipleViewTrip;
