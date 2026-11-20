import React, { useState, useMemo, useEffect, useRef } from "react";
import { T } from "../constants/Designtokens";
import type {
  Alert,
  // SecurityIncident
} from "../types/Security.types";
// import { SECURITY_INCIDENTS } from "../constants/Mocksecuritydata";
// import { AppHeader } from "../components/Appheader";
// import { SecurityTabs } from "../components/Securitytabs";
import { IncidentListPanel } from "../components/Incidentlistpanel";
import { SecurityMapPanel } from "../components/Securitymappanel";
import { RightSecurityPanel } from "../components/Rightsecuritypanel";
import AppHeader from "../../../shared/components/RoutingHeader/RoutingHeader";
import {
  useGetAlertsQuery,
  useGetAlertSummaryQuery,
} from "../services/securityApi";
import { useSelector } from "react-redux";
import { useAlertHub } from "../hooks/useAlertHub";
import type { RootState } from "../../../app/store";

type MapMode = "default" | "mapOnly";

const contentColumns = (
  leftCollapsed: boolean,
  detailsVisible: boolean,
): string => {
  if (leftCollapsed && !detailsVisible) return "0px 1fr 0px";
  if (!leftCollapsed && !detailsVisible) return "400px 1fr 0px";
  return "400px 1fr 360px";
};
const SecurityDashboardPage: React.FC = () => {
  const playSoundEnabled = useSelector(
    (state: RootState) => state.securityUi.enabled,
  );

  const token = useSelector((state: any) => state.auth.accessToken);

  // --------------
  const [activeView, setActiveView] = useState<number>(4);
  const [activeMod, setActiveMod] = useState<number | null>(null);
  const [priorityType, setPriorityType] = useState<number | null>(null);

  const [showResolved, setShowResolved] = useState(false);

  // 2. Create a trigger state (a simple click counter or timestamp)
  // const [soundTrigger, setSoundTrigger] = useState<number>(0);
  // -------------

  const [selectedIncidentId, setSelectedIncidentId] = useState<
    number | string | null
  >(null);
  const [leftCollapsed] = useState(false);
  const [mapMode] = useState<MapMode>("default");
  const { latestAlert, isConnected } = useAlertHub(
    token,
    playSoundEnabled as boolean,
  );

  const { data: alertSummary, isLoading } = useGetAlertSummaryQuery();
  // ------------- Alert Response on the basis of filter
  // const { data: alertData } = useGetAlertsQuery({
  //   priorityCodes: priorityType !== null ? [priorityType] : undefined,
  //   moduleCodes: activeMod !== null ? [activeMod] : undefined,
  //   pageSize: 100,
  //   page: 1,
  //   isResolved: showResolved,
  // });

  const {
    data: alertData,
    isFetching: isAlertsFetching,
    refetch: refetchAlerts,
  } = useGetAlertsQuery(
    {
      priorityCodes: priorityType !== null ? [priorityType] : undefined,
      moduleCodes: activeMod !== null ? [activeMod] : undefined,
      pageSize: 100,
      page: 1,
      isResolved: showResolved,
    },
    {
      // Wait for the summary to load (and for its default module to be
      // applied to activeMod) before firing the alerts call at all — this
      // stops the initial unfiltered request that used to fire before
      // IncidentListPanel's default-selection effect had a chance to run.
      skip: isLoading || activeMod === null,
    },
  );

  console.log("alertData from section", alertData);

  const hasMountedFilters = useRef(false);
  useEffect(() => {
    if (!hasMountedFilters.current) {
      hasMountedFilters.current = true;
      return;
    }
    if (activeMod !== null) {
      refetchAlerts();
    }
  }, [activeMod, priorityType, showResolved]);

  const showDetails = selectedIncidentId !== null;
  const isMapOnly = mapMode === "mapOnly";
  // ----------------------
  const mergedAlerts = useMemo((): Alert[] => {
    const apiItems = alertData?.items ?? [];

    if (!latestAlert) return apiItems;

    const existingIndex = apiItems.findIndex(
      (item) => item.alertId === latestAlert.alertId,
    );

    if (existingIndex !== -1) {
      // Alert already in list — replace it with the updated version
      const updated = [...apiItems];
      updated[existingIndex] = latestAlert as Alert;
      return updated;
    }

    // New alert from server — prepend to top so it's immediately visible
    return [latestAlert as Alert, ...apiItems];
  }, [alertData?.items, latestAlert]);

  // ----------------------
  const selectedIncident = useMemo(
    () => mergedAlerts?.find((i) => i.alertId === selectedIncidentId) ?? null,
    [mergedAlerts, selectedIncidentId],
  );

  const handleSelectIncident = (id: string | number) => {
    setSelectedIncidentId((prev) => (prev === id ? null : id));
  };

  const handleCloseDetails = () => {
    setSelectedIncidentId(null);
  };

  const handleCallDriver = () => {
    if (selectedIncident) {
      alert(`Calling driver: ${selectedIncident.driverId}`);
    }
  };

  const handleCallEmployee = () => {
    alert("Calling employee...");
  };

  const gridColumns = isMapOnly
    ? "0px 1fr 0px"
    : contentColumns(leftCollapsed, showDetails);

  const handleSosClick = () => {
    setActiveMod(4);
    setActiveView(4);
    setPriorityType(null);
    // your SOS logic here — open modal, trigger alert, etc.
  };

  const handleSafeReachClick = () => {
    setActiveMod(1);
    setActiveView(1);
    setPriorityType(null);
    // your Safe Reach Home logic here
  };

  const handleModuleChange = (moduleCode: number) => {
    setActiveMod(moduleCode);
    setSelectedIncidentId(null);
    // refetchAlerts();
  };

  const handlePriorityChange = (priorityCode: number) => {
    setPriorityType(priorityCode);
    setSelectedIncidentId(null);
    // refetchAlerts();
  };

  const handleToggleResolved = () => {
    setShowResolved((prev) => !prev);
    setSelectedIncidentId(null);
    // refetchAlerts();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <AppHeader
        variant="security"
        sosLabel="SOS/Alerts"
        onSosClick={handleSosClick}
        showSos={true}
        sosActive={activeView === 4}
        secondaryActionLabel="Safe Reach Home"
        onSecondaryActionClick={handleSafeReachClick}
        showSecondaryAction={true}
        secondaryActionActive={activeView === 1}
        isLive={isConnected as boolean}
      />
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: gridColumns,
          transition: "grid-template-columns .25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            overflow: "hidden",
            transition: "opacity .2s",
            opacity: leftCollapsed || isMapOnly ? 0 : 1,
          }}
        >
          <IncidentListPanel
            selectedId={selectedIncidentId}
            onSelect={handleSelectIncident}
            onCloseDetails={handleCloseDetails}
            alertSummary={alertSummary}
            isLoading={isLoading}
            isAlertsLoading={isAlertsFetching}
            // search={search}
            // onSearchChange={setSearch}
            activeMod={activeMod}
            // onModuleChange={setActiveMod}
            onModuleChange={handleModuleChange}
            priorityType={priorityType}
            // onPriorityChange={setPriorityType}
            onPriorityChange={handlePriorityChange}
            showResolved={showResolved}
            onToggleResolved={handleToggleResolved}
            // alertData={alertData?.items ?? ([] as Alert[])}
            alertData={mergedAlerts}
          />
          {/* )} */}
        </div>

        {/* Map Panel */}
        <SecurityMapPanel
          // alertData={alertData?.items ?? ([] as Alert[])}
          alertData={mergedAlerts}
          selectedIncident={selectedIncident}
          onMarkerClick={handleSelectIncident}
          onCallDriver={handleCallDriver}
          onCallEmployee={handleCallEmployee}
        />

        {/* Right Panel */}
        <div
          style={{
            overflow: "hidden",
            transition: "opacity .2s",
            opacity: showDetails && !isMapOnly ? 1 : 0,
          }}
        >
          {/* need to uncomment this  */}
          {showDetails && (
            <RightSecurityPanel
              alert={selectedIncident}
              onClose={handleCloseDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default SecurityDashboardPage;
