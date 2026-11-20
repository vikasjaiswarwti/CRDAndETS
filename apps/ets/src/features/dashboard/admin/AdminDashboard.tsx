import React, { useEffect, useState } from "react";
// import { useGetDashboardSummaryQuery } from '../store/api/dashboardApi';
import { TopStatsBar } from "./components/TopStatsBar";
import { TripSummaryChart } from "./components/TripSummaryChart";
import { UserInfoCard } from "./components/UserInfoCard";
import { OtaOtdCard } from "./components/OtaOtdCard";
import { AdhocRequestCard } from "./components/AdhocRequestCard";
import { SafetySecurityCard } from "./components/SafetySecurityCard";
import { UniqueVehicleDriverCard } from "./components/UniqueVehicleDriverCard";
import { VehicleComplianceCard } from "./components/VehicleComplianceCard";
import { VehicleTypeCard } from "./components/VehicleTypeCard";
import { VehicleDeploymentCard } from "./components/VehicleDeploymentCard";
import { VehicleUtilizationCard } from "./components/VehicleUtilizationCard";
// import { NoShowCard } from "./components/NoShowCard";
import { CardSkeleton } from "./components/Skeleton";
import { useAdminDashboardMutations } from "./hooks/useAdminDashboardMutations";
import { MOCK_DATA } from "./services/adminDashboardApi";
import "./styles/style.css";
import {
  DashboardFilterBar,
  type DashboardFilters,
} from "./components/DashboardFilter";
import { useLookups } from "../../lookups/hooks/useLookups";
import dayjs from "dayjs";
import EmployeeTripSearch from "./components/EmployeeTripSearch";
import QuickActionsSection from "./components/QuickAction";
import { FeedbackCard } from "./components/FeedbackCard";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { QuickActionsDrawer } from "./components/QuickActionsDrawer";
import LoginUser from "./components/LoginUser";

export const AdminDashboard: React.FC = () => {
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  const { fetchReport, data, isLoading, isError } =
    useAdminDashboardMutations();
  const locCode = locationOptions[0]?.value as number | undefined;

  const isMobile = useIsMobile();

  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    if (locCode == null) return;
    fetchReport({
      locCode,
      fromDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
      toDate: dayjs().format("YYYY-MM-DD"),
    });
  }, [locCode]);

  const handleSearch = (filters: DashboardFilters) => {
    fetchReport({
      locCode: filters.locCode,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  };

  // Fall back to mock data on error
  const displayData = isError ? MOCK_DATA : data;
  // console.log(displayData?.tripSummary);

  // export interface ParsedDashboardData {
  //   kpi: KPI;
  //   tripSummary: TripSummary[];
  //   userInfo: UserInfo;
  //   otaOtd: OTAOTD;
  //   adhocRequest: AdhocRequest;
  //   vehicleDriver: VehicleDriver;
  //   safetySecurity: SafetyAndSecurity;
  //   uniqueVehicleDriver: VehicleDriver;
  //   compliance: VehicleDriverCompliance;
  //   vehicleDeployment: VehicleDeployment[];
  //   feedback: FeedbackReport;
  //   vehicleTypes: VehicleType[];
  //   vehicleUtilization: VehicleUtilization[];
  // }
  // console.log(isError, "isError");
  return (
    <div className="dashboard-layout">
      <DashboardFilterBar
        locationOptions={locationOptions}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      {/* Top KPI Bar */}
      {isLoading ? (
        <div className="top-stats-bar">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : displayData?.kpi ? (
        <TopStatsBar data={displayData.kpi} />
      ) : null}

      <div className="grid grid-cols-12 max-md:grid-cols-1 gap-5">
        <div className="dashboard-grid col-span-8">
          <div className="col-span-2">
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <>
                {displayData?.tripSummary && (
                  <TripSummaryChart data={displayData.tripSummary} />
                )}
              </>
            )}
          </div>

          <div className="grid-3col">
            {isLoading
              ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
              : displayData && (
                  <>
                    {displayData?.userInfo && (
                      <UserInfoCard data={displayData.userInfo} />
                    )}
                    {displayData?.otaOtd && (
                      <OtaOtdCard data={displayData.otaOtd} />
                    )}
                    {displayData.adhocRequest && (
                      <AdhocRequestCard data={displayData.adhocRequest} />
                    )}
                    {displayData.uniqueVehicleDriver && (
                      <UniqueVehicleDriverCard
                        data={displayData.uniqueVehicleDriver}
                      />
                    )}
                    {displayData.safetySecurity && (
                      <SafetySecurityCard data={displayData.safetySecurity} />
                    )}
                    {displayData.compliance && (
                      <VehicleComplianceCard data={displayData.compliance} />
                    )}
                    {displayData.vehicleTypes && (
                      <VehicleTypeCard data={displayData.vehicleTypes} />
                    )}

                    {displayData.vehicleDeployment && (
                      <VehicleDeploymentCard
                        data={displayData.vehicleDeployment}
                      />
                    )}
                    <LoginUser />
                  </>
                )}
          </div>

          <div className="grid-2col">
            {isLoading ? (
              [...Array(2)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                {displayData?.feedback && (
                  <FeedbackCard data={displayData.feedback} />
                )}
                {displayData?.vehicleUtilization && (
                  <VehicleUtilizationCard
                    data={displayData.vehicleUtilization}
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* jsonVehicleDeployment": "[{\"VehicleDeployment\":\"Dzire\",\"Total\":225},{\"VehicleDeployment\":\"Hatchback\",\"Total\":11},{\"VehicleDeployment\":\"Sedan\",\"Total\":75},{\"VehicleDeployment\":\"SUV\",\"Total\":1}]", */}
        <div className="col-span-4 flex flex-col gap-5">
          {/* <QuickActionsSection />
          <EmployeeTripSearch /> */}

          {!isMobile && (
            <div className="col-span-4 flex flex-col gap-5">
              <QuickActionsSection />
              <EmployeeTripSearch />
            </div>
          )}

          {/* <RecentAlerts alerts={dummyAlerts} /> */}
        </div>
      </div>

      {isMobile && (
        <>
          <button
            onClick={() => setQuickActionsOpen(true)}
            aria-label="Open quick actions"
            style={{
              position: "fixed",
              right: 20,
              bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--color-brand-primary, #0F6E56)",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              cursor: "pointer",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </button>
          <QuickActionsDrawer
            open={quickActionsOpen}
            onClose={() => setQuickActionsOpen(false)}
          />
        </>
      )}
    </div>
  );
};
export default AdminDashboard;
