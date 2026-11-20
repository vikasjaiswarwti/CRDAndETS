import React, { useEffect } from "react";
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
import { FeedbackCard } from "./components/FeedbackCard";
import { VehicleDeploymentCard } from "./components/VehicleDeploymentCard";
import { VehicleUtilizationCard } from "./components/VehicleUtilizationCard";
// import { NoShowCard } from "./components/NoShowCard";
import { CardSkeleton } from "./components/Skeleton";
import { useAdminDashboardMutations } from "./hooks/useAdminDashboardMutations";
// import { MOCK_DATA } from "./services/adminDashboardApi";
import "./styles/style.css";
import {
  DashboardFilterBar,
  type DashboardFilters,
} from "./components/DashboardFilter";
import { useLookups } from "../../lookups/hooks/useLookups";
import dayjs from "dayjs";
import EmployeeTripSearch from "./components/EmployeeTripSearch";
import QuickActionsSection from "./components/QuickAction";
import RecentAlerts from "./components/RecentAlerts";
import { dummyAlerts } from "./data";

export const AdminDashboard: React.FC = () => {
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  // console.log(MOCK_DATA, "MOCK_DATA")
  // const data = MOCK_DATA;
  // const isLoading = false;
  const { fetchReport, data, isLoading, isError } =
    useAdminDashboardMutations();

  const defaultFilters = {
    locCode: locationOptions[0]?.value as number,
    fromDate: dayjs().format("YYYY-MM-DD"),
    toDate: dayjs().format("YYYY-MM-DD"),
  };

  useEffect(() => {
    fetchReport(defaultFilters);
  }, []);

  // if (isError) {
  //   return (
  //     <div className="error-state">
  //       <span>Failed to load dashboard data. Please try refreshing.</span>
  //     </div>
  //   );
  // }

  const handleSearch = (filters: DashboardFilters) => {
    fetchReport({
      locCode: filters.locCode,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  };

  return (
    <div className="dashboard-layout">
      <DashboardFilterBar
        locationOptions={locationOptions}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      {/* Error overlay — filter bar stays usable */}
      {isError && (
        <div className="dashboard-error-overlay">
          <div className="dashboard-error-box">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Failed to load dashboard</h3>
            <p>Something went wrong while fetching data. Please try again.</p>
            <button
              className="filter-search-btn"
              onClick={() =>
                handleSearch({
                  locCode: locationOptions[0]?.value as number,
                  fromDate: dayjs().format("YYYY-MM-DD"),
                  toDate: dayjs().format("YYYY-MM-DD"),
                })
              }
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isError && (
        <>
          {/* Top KPI Bar */}
          {isLoading ? (
            <div className="top-stats-bar">
              {[...Array(5)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data ? (
            <TopStatsBar data={data.users} />
          ) : null}
          <div className="grid grid-cols-12 gap-5">
            {/* Main grid */}
            <div className="dashboard-grid col-span-8">
              {/* Row 1: Trip Summary (wide) */}
              <div className="col-span-2">
                {isLoading ? (
                  <CardSkeleton />
                ) : (
                  data && (
                    <TripSummaryChart
                      loginTotal={data.users.LoginTrips}
                      logoutTotal={data.users.LogoutTrips}
                    />
                  )
                )}
              </div>

              {/* Row 1-2: User Info + OTA/OTD + Adhoc + Safety (2-col grid) */}
              <div className="grid-4col">
                {isLoading
                  ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
                  : data && (
                      <>
                        <UserInfoCard data={data.users} />
                        <OtaOtdCard data={data.otaOtd} />
                        <AdhocRequestCard data={data.adhocRequest} />
                        <SafetySecurityCard data={data.safetySecurity} />
                      </>
                    )}
              </div>

              {/* Row 2: Unique Vehicle / Compliance / Vehicle Type */}
              <div className="grid-3col">
                {isLoading
                  ? [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
                  : data && (
                      <>
                        <UniqueVehicleDriverCard
                          data={data.uniqueVehicleDriver}
                        />
                        <VehicleComplianceCard data={data.compliance} />
                        <VehicleTypeCard data={data.vehicleTypes} />
                      </>
                    )}
              </div>

              {/* Row 3: Feedback + Vehicle Deployment */}
              <div className="grid-2col">
                {isLoading
                  ? [...Array(2)].map((_, i) => <CardSkeleton key={i} />)
                  : data && (
                      <>
                        <FeedbackCard data={data.feedback} />
                        <VehicleDeploymentCard data={data.vehicleDeployment} />
                      </>
                    )}
              </div>

              {/* Row 4: Vehicle Utilization + No Show */}
              <div className="grid-2col">
                {isLoading
                  ? [...Array(2)].map((_, i) => <CardSkeleton key={i} />)
                  : data && (
                      <>
                        <VehicleUtilizationCard
                          data={data.vehicleUtilization}
                        />
                        {/* <NoShowCard total={data.users.NoShowTotal} /> */}
                      </>
                    )}
              </div>
            </div>
            <div className="col-span-4 flex flex-col gap-5">
              <EmployeeTripSearch />
              <QuickActionsSection />
              <RecentAlerts alerts={dummyAlerts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminDashboard;
