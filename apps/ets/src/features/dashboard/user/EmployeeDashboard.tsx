import { useState, useEffect, useMemo } from "react";
import {
  useGetGlobalUserQuery,
  useLazyGetTeamCabTrackQuery,
  useGetTripHomePageQuery,
} from "./services/employeeProfileApi";
import { useEmployeeProfileMutations } from "./hooks/useEmployeeProfileMutations";
import { UpdateMobileModal } from "./components/UpdateMobileModal";
import { AddressChangeModal } from "./components/AddressChangeModal";
import { PasswordChangeModal } from "./components/PasswordChangeModal";
import type {
  AddressChangeRequest,
  PasswordChangeRequest,
  UserInfo,
  ApiTrip,
  TripHomeEntry,
  TripHomeGroup,
  CreateComplaintRequest,
} from "./types/employeeProfile.types";
import dayjs, { type Dayjs } from "dayjs";
import { AdhocRequestsTable } from "./components/AdhocRequestsTable";
import { NoShowTripsTable } from "./components/NoShowTripsTable";
import { WeeklySchedule } from "./components/WeeklySchedule";
import { RecentFeedbackTable } from "./components/RecentFeedbackTable";
import QuickAction from "./components/QuickAction";
import { TeamCabCard } from "./components/TeamCabCard";
import SearchDatePicker from "../../../shared/components/Search/SearchDatePicker";
import { useGetCurrentUserQuery } from "../../auth/services/authApi";
import MyTeamTrip from "./components/MyTeamTripCab";
import { TopStatsBar } from "./components/TopStatsBar";
import {
  TopStatsBarSkeleton,
  MyTripsSkeleton,
  AdhocRequestsTableSkeleton,
  QuickActionSkeleton,
  NoShowTripsTableSkeleton,
  WeeklyScheduleSkeleton,
  RecentFeedbackTableSkeleton,
  TeamCabCardSkeleton,
} from "./components/SkeletonLoaders";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { EmployeeQuickActionsDrawer } from "./components/EmployeeQuickActionsDrawer";
import { CreateComplaintModal } from "./components/CreateComplaintModal";
import TripHomeCard from "./components/TripHomeCard";

interface QAButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}
const userDummyData: UserInfo = {
  IsTeamLeder: 0,
  EmployeeID: "",
  CommutrId: "",
  Name: "",
  Address: "",
  Mobileno: "",
  TeamCount: 0,
  AddressChangeRequest: 0,
  TeamTrips: 0,
  TeamNoshowCount: 0,
  TeamAdhoc: 0,
  TeamComplaintCount: 0,
  WeeklyOff: "",
};
export const dummyTrips: ApiTrip[] = [
  {
    Dsid: 0,
    Dsdate: "-",
    Triptype: "Login",
    Empid: 501,
    Empname: "-",
    Address: "-",
    ETA: "-",
    PaxOrder: 0,
    OTP: 0,
    PickShift: "-",
    TripStatus: "Created",
  },
  {
    Dsid: 0,
    Dsdate: "-",
    Triptype: "Logout",
    Empid: 502,
    Empname: "-",
    Address: "-",
    ETA: "-",
    PaxOrder: 0,
    OTP: 0,
    PickShift: "-",
    TripStatus: "Created",
  },
];

// ─── Trip Home card (GET /UserApp/GetTripHomePage) ─────────────────────────

const TRIP_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Created: { bg: "#E8F5EE", color: "#1B6B3A" },
  Started: { bg: "#E3F2FD", color: "#1565C0" },
  Ongoing: { bg: "#EDE7F6", color: "#4527A0" },
  Completed: { bg: "#F1F8E9", color: "#33691E" },
  Cancelled: { bg: "#FFEBEE", color: "#B71C1C" },
  End: { bg: "#F0F0F0", color: "#5E5E5E" },
};

export const getTripStatusStyle = (status: string) =>
  TRIP_STATUS_STYLE[status] ?? { bg: "#F5F5F5", color: "#555" };
// ── Small inline icon set (feather-style, stroke-based) ────────────────────

const TripIcon: React.FC<{ size?: number; children: React.ReactNode }> = ({
  size = 14,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {children}
  </svg>
);

export const PhoneIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.966.361 1.914.7 2.83a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.916.339 1.864.573 2.83.7A2 2 0 0 1 22 16.92z" />
  </TripIcon>
);

export const CopyIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </TripIcon>
);

export const CheckIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <polyline points="20 6 9 17 4 12" />
  </TripIcon>
);

export const HomeIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </TripIcon>
);

export const OfficeIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </TripIcon>
);

export const VehicleIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </TripIcon>
);

export const KeyIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </TripIcon>
);

export const UsersIcon: React.FC<{ size?: number }> = ({ size }) => (
  <TripIcon size={size}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </TripIcon>
);

export const QAButton: React.FC<QAButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  fullWidth,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: fullWidth ? "11px 8px" : "14px 8px",
      border: "1px solid #E8F5EE",
      borderRadius: 10,
      background: "#E6F3ED",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      flex: fullWidth ? undefined : 1,
      width: fullWidth ? "100%" : undefined,
      transition: "border-color 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!disabled)
        (e.currentTarget as HTMLElement).style.borderColor = "#1B4332";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = "#E8F5EE";
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        border: "1px solid #E8F5EE",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <span
      style={{
        fontSize: 10,
        color: "#1B4332",
        fontWeight: 500,
        textAlign: "center",
        lineHeight: 1.35,
      }}
    >
      {label}
    </span>
  </button>
);
const EmployeeDashboard: React.FC = () => {
  const { data: user } = useGetCurrentUserQuery();
  const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
  const {
    data: tripHomeData,
    isFetching: isTripHomeLoading,
    refetch: tripHomeRefetch,
  } = useGetTripHomePageQuery();
  // console.log(tripHomeData, "tripHomeData");
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetGlobalUserQuery(user?.id ?? "", { skip: !user?.id });

  const [
    fetchTeamCabTrack,
    {
      data: teamCabTrackData,
      isLoading: isTeamCabTrackLoading,
      // error: teamCabTrackError,
    },
  ] = useLazyGetTeamCabTrackQuery();

  const isMobile = useIsMobile();

  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    if (profile?.empId) {
      fetchTeamCabTrack({
        empId: profile.empId,
        date: fromDate.format("YYYY-MM-DD"),
      });
    }
  }, [profile?.empId, fromDate]);
  const teamTrips = teamCabTrackData?.trips ?? [];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);

  const nodalPickOptions: { label: string; value: string }[] = [];
  const nodalDropOptions: { label: string; value: string }[] = [];
  const geocodeOptions: { label: string; value: string }[] = [];

  const {
    updateMobile,
    mobileError,
    requestAddressChange,
    isRequestingAddress,
    addressError,
    // -------
    requestPasswordChange,
    isPasswordChanging,
    passwordError,
    // ----------------
    fetchUserDashboardReport,
    dashboardReportData,
    isFetchingDashboardReport,
    // dashboardReportError,
    // --------------------
    requestCreateComplaint,
    isCreateComplaint,
    createComplaintError,
  } = useEmployeeProfileMutations({
    onMobileSuccess: () => {
      setMobileOpen(false);
      refetchProfile();
    },
    onAddressSuccess: () => {
      setAddressOpen(false);
      refetchProfile();
    },
    onPasswordSuccess: () => {
      setPasswordOpen(false);
      refetchProfile();
    },
    onComplaintSuccess: () => {
      setComplaintOpen(false);
      refetchProfile();
    },
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserDashboardReport({ TodayDate: fromDate.format("YYYY-MM-DD") });
    }
  }, [user?.id]);

  const handleMobileSubmit = async (values: Record<string, unknown>) => {
    if (!profile?.user_Id) return;
    await updateMobile({
      userId: profile.user_Id,
      mobileNo: values.mobileNo as string,
    });
  };

  // ── Updated address submit — maps new modal fields ────────────────────────
  const handleAddressSubmit = async (values: Record<string, unknown>) => {
    const emp_Lat = (values.empLat as number | null) ?? profile?.emp_Lat ?? 0;
    const emp_Lng = (values.empLng as number | null) ?? profile?.emp_Lng ?? 0;

    const payload: AddressChangeRequest = {
      empID: profile?.empId ?? 0,
      locCode: profile?.locCode ?? null,
      city: (values.city as string) ?? "",
      pin: values.pin as string,
      state: (values.state as string) ?? "",
      stateCode: 2, // resolve from statesOptions if needed
      mobileNo: profile?.mobileNo ?? null,
      emerContactNo: profile?.emerContactNo ?? "8888888888",
      geocodeID: profile?.geocodeID ?? 1,
      emp_Lat: emp_Lat,
      emp_Lng: emp_Lng,
      remarks: (values.remarks as string) ?? null,
      address: (values.address as string) ?? null,
      actionType: "CREATE",
      // Nodal points — use submitted values or fall back to profile
      nodal_Pick: (values.nodalPick as string) ?? profile?.nodal_Pick ?? null,
      nodal_Drop: (values.nodalDrop as string) ?? profile?.nodal_Drop ?? null,
      updatE_DATE: null,
      // Effective date — use submitted value or fall back to default
      effectivedate: (values.effectiveDate as string)
        ? new Date(values.effectiveDate as string).toISOString()
        : "2026-04-05T00:00:00Z",
      rejection_Remark: null,
    };

    // console.log("payload", payload);
    await requestAddressChange(payload);
  };

  const handlePasswordSubmit = async (values: PasswordChangeRequest) => {
    const payload: PasswordChangeRequest = {
      oldPassword: values.oldPassword as string,
      newPassword: values.newPassword as string,
    };

    console.log("payload", payload);
    await requestPasswordChange(payload);
  };
  const noShowTrips = dashboardReportData?.noshowTrips ?? [];
  const userInfo = dashboardReportData?.userInfo[0] ?? userDummyData;
  const weeklyDays = dashboardReportData?.weeklySchedule ?? [];
  const complaints = dashboardReportData?.complaint ?? [];
  const teamComplaints = dashboardReportData?.teamComplaint ?? [];
  const adhocTrips = dashboardReportData?.teamAdhocTrips ?? [];
  const adhocRequest = dashboardReportData?.adhocRequest ?? [];

  const tripHomeEntries = useMemo<TripHomeEntry[]>(() => {
    const tripHomeGroups: TripHomeGroup[] = tripHomeData ?? [];

    return tripHomeGroups
      .flatMap((group) => group.data ?? [])
      .sort((a, b) => {
        const rank = (t?: unknown) =>
          String(t ?? "").toLowerCase() === "login" ? 0 : 1;

        return rank(a.Triptype) - rank(b.Triptype);
      });
  }, [tripHomeData]);

  const normalizedLocCode =
    profile?.locCode && profile.locCode !== "" ? Number(profile.locCode) : null;

  const handleFromChange = (dateString: string) => {
    setFromDate(dayjs(dateString));
    fetchUserDashboardReport({
      TodayDate: dayjs(dateString).format("YYYY-MM-DD"),
    });
  };
  const handleCreateComplaint = async (
    values: Record<string, unknown> | CreateComplaintRequest,
  ) => {
    console.log(values, "values");
    await requestCreateComplaint(values as CreateComplaintRequest);
  };
  return (
    <>
      <div className="flex flex-col gap-5" style={{ marginBottom: "16px" }}>
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#4B5563",
                marginRight: "12px",
              }}
            >
              Select Date :
            </span>
            <SearchDatePicker
              placeholder="Select Date"
              defaultValue={fromDate}
              handleChange={handleFromChange}
              labelHide={false}
            />
          </div>
        </div>

        {userInfo.IsTeamLeder == 1 &&
          (isFetchingDashboardReport ? (
            <TopStatsBarSkeleton />
          ) : (
            <TopStatsBar data={userInfo} />
          ))}
      </div>

      <div
        style={{
          display: "grid",
          // gridTemplateColumns: "1fr 320px",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 320px",
          gap: 16,
          marginBottom: 16,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8F5EE",
              borderRadius: 12,
              padding: "16px 18px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 28,
                  backgroundColor: "#22C55E",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: "#003D27",
                }}
              >
                My Trips
              </h2>
            </div>

            {isTripHomeLoading ? (
              <MyTripsSkeleton />
            ) : tripHomeEntries.length === 0 ? (
              <p style={{ fontSize: 13, color: "#8A9E99", margin: 0 }}>
                No trips found.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {tripHomeEntries.map((trip, idx) => (
                  <TripHomeCard
                    key={trip.TripID ?? idx}
                    trip={trip}
                    locCode={normalizedLocCode}
                    refresh={() => tripHomeRefetch()}
                  />
                ))}
              </div>
            )}
          </div>

          {isFetchingDashboardReport ? (
            <AdhocRequestsTableSkeleton />
          ) : (
            <AdhocRequestsTable requests={adhocRequest} />
          )}
        </div>

        {/* {isProfileLoading ? (
          <QuickActionSkeleton />
        ) : (
          <QuickAction
            isProfileLoading={isProfileLoading}
            setAddressOpen={() => setAddressOpen(true)}
            setMobileOpen={() => setMobileOpen(true)}
            setPasswordOpen={() => setPasswordOpen(true)}
          />
        )} */}

        {!isMobile &&
          (isProfileLoading ? (
            <QuickActionSkeleton />
          ) : (
            <QuickAction
              isProfileLoading={isProfileLoading}
              setAddressOpen={() => setAddressOpen(true)}
              setMobileOpen={() => setMobileOpen(true)}
              setPasswordOpen={() => setPasswordOpen(true)}
              setComplaintOpen={() => setComplaintOpen(true)}
            />
          ))}
      </div>

      <div className="flex flex-col gap-4">
        {isFetchingDashboardReport ? (
          <NoShowTripsTableSkeleton />
        ) : (
          noShowTrips && <NoShowTripsTable trips={noShowTrips} />
        )}

        {isFetchingDashboardReport ? (
          <WeeklyScheduleSkeleton />
        ) : (
          weeklyDays && <WeeklySchedule days={weeklyDays} />
        )}

        {isFetchingDashboardReport ? (
          <RecentFeedbackTableSkeleton title="Recent Feedback" />
        ) : (
          complaints && (
            <RecentFeedbackTable title="Recent Complaint" items={complaints} />
          )
        )}

        {userInfo.IsTeamLeder == 1 && (
          <>
            {isFetchingDashboardReport ? (
              <RecentFeedbackTableSkeleton title="Team Feedback" />
            ) : (
              teamComplaints && (
                <RecentFeedbackTable
                  title="Team Feedback"
                  items={teamComplaints}
                />
              )
            )}

            {isTeamCabTrackLoading ? (
              <TeamCabCardSkeleton />
            ) : (
              teamTrips && (
                <MyTeamTrip title="My Team Cab" trips={teamTrips ?? []} />
              )
            )}

            {isFetchingDashboardReport ? (
              <TeamCabCardSkeleton />
            ) : (
              adhocTrips && (
                <TeamCabCard title="Adhoc Trips" cabs={adhocTrips} />
              )
            )}
          </>
        )}
      </div>
      <UpdateMobileModal
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSubmit={handleMobileSubmit}
        serverErrors={mobileError?.fieldErrors}
        currentMobile={profile?.mobileNo}
      />

      {/* ── AddressChangeModal — now with Google Map + new fields ── */}
      {/* <AddressChangeModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSubmit={handleAddressSubmit}
        isSubmitting={isRequestingAddress}
        serverErrors={addressError?.fieldErrors}
        nodalPickOptions={nodalPickOptions}
        nodalDropOptions={nodalDropOptions}
        geocodeOptions={geocodeOptions}
      /> */}

      <AddressChangeModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSubmit={handleAddressSubmit}
        isSubmitting={isRequestingAddress}
        serverErrors={addressError?.fieldErrors}
        nodalPickOptions={nodalPickOptions}
        nodalDropOptions={nodalDropOptions}
        geocodeOptions={geocodeOptions}
        currentProfile={profile ?? null}
      />

      <PasswordChangeModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handlePasswordSubmit}
        isSubmitting={isPasswordChanging}
        serverErrors={passwordError?.fieldErrors}
      />
      <CreateComplaintModal
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        onSubmit={handleCreateComplaint}
        empId={profile?.empId ?? 0}
        isSubmitting={isCreateComplaint}
        serverErrors={createComplaintError?.fieldErrors}
      />

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
              background: "#1B4332",
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
          <EmployeeQuickActionsDrawer
            open={quickActionsOpen}
            onClose={() => setQuickActionsOpen(false)}
            isProfileLoading={isProfileLoading}
            setAddressOpen={() => setAddressOpen(true)}
            setMobileOpen={() => setMobileOpen(true)}
            setPasswordOpen={() => setPasswordOpen(true)}
            setComplaintOpen={() => setComplaintOpen(true)}
          />
        </>
      )}
    </>
  );
};

export default EmployeeDashboard;
