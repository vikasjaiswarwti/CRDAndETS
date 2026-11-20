// ============================================================
import { colors } from "../../style/styles";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  IconLocationPin,
  IconFemale,
} from "../../../../assets/dashboard/index";
import InfoTooltip from "./InfoTooltip";
import type { TripPassenger, TripResponse } from "../../types/tracking.types";
import {
  formatAdjustedTime,
  // formatDateTime,
  formatDateTimeWithoutYear,
  formatTime,
  getTimeDifference,
  // formatUTCToIST,
} from "../../utils/commonFunction";
import { useGetActualDistanceQuery } from "../../services/routeTrackingApi";
// import { useDispatch } from "react-redux";
// import {
//   setSelectedEmployee,
//   // clearSelectedEmployee,
// } from "../../slice/routeTrackingSlice";
// import { ArrowRight } from "lucide-react";
// import { TRIP_STATUS } from "../../constants/trackConstant";

const paxTrackingStatusColors = {
  Pending: {
    background: "#FACC15",
    color: "#713F12",
    fontSize: 11,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "No-Show": {
    background: "#b40d1a",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "Not-Boarded": {
    background: "#F97316",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  Boarded: {
    background: "#3B82F6",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "Trip-Completed": {
    background: "#10B981",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "De-Boarded": {
    background: "#F59E0B",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "En-Route": {
    background: "#8B5CF6",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
  "Reached-Home": {
    background: "#059669",
    color: "#FFFFFF",
    // background: "#9CA3AF",
    // color: "#111827",
    fontSize: 12,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 5,
  },
} as const;

const Pipe = () => <span style={{ fontSize: 11, color: "#E8E8E8" }}>|</span>;
export const TimelineItem = ({
  // tripStatusCode,
  item,
  isLast,
  isDrop = false,
  distance,
}: {
  tripStatusCode?: number;
  item: TripPassenger;
  isLast: boolean;
  isDrop: boolean;
  distance?: {
    distanceKm: number;
    snapDistanceKm: number;
    fromEmpId: number;
    toEmpId: number;
    fromName: string;
    toName: string;
  };
}) => {
  // const dispatch = useDispatch();
  const status = item.paxTrackingStatus;

  const statusStyle =
    paxTrackingStatusColors[status as keyof typeof paxTrackingStatusColors];

  const actualETA = formatAdjustedTime(
    item.plannedScheduleTime,
    item.etaDeviationMinutes,
  );
  // console.log(data, "date");
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        position: "relative",
        paddingBottom: 4,
      }}
    >
      {/* LEFT STEP */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Circle */}
        <div
          //
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: colors.brandGreen,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {/* {index + 1} */}
          {item.paxOrder}
        </div>

        {/* Line */}
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              background: "#e5e7eb",
              minHeight: 70,
            }}
          />
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div
        style={{
          flex: 1,
          gap: 2,
          borderBottom: !isLast ? "1px solid #f1f5f9" : "none",
          paddingBottom: 14,
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {/* EMP */}
          <p
            className="flex items-center gap-1"
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            {item.gender == "F" && (
              <span>
                <IconFemale />
              </span>
            )}
            {item.empId && (
              <>
                <span>Emp ID:</span>
                <span
                  className="font-semibold"
                  style={{ color: colors.gray600 }}
                >
                  {item.empId}
                </span>
              </>
            )}
          </p>
          <Pipe />
          {/* Name */}
          <p
            className="flex items-center gap-1"
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            <span
              className="font-semibold"
              style={{
                color: colors.gray600,
                // maxWidth: "180px",
                display: "inline-block",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {item.firstname} {item.lastName ?? ""}
            </span>
            <InfoTooltip
              icon={
                <span
                  style={{
                    color: colors.blueinfo,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <InfoCircleOutlined />
                </span>
              }
              iconColor={colors.blueinfo}
              content={
                <span>
                  <strong>{item.mobileno}</strong> <br />
                  <strong>OTP -{item?.otp ?? "-"}</strong>
                </span>
              }
            />
          </p>
          <Pipe />
          {/* Status */}
          <div style={statusStyle}>
            {item.noShow ? item.noShowReason : item.paxTrackingStatus}{" "}
          </div>
        </div>
        {/* TIMES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <p style={{ textTransform: "uppercase" }}>
              <span
                style={{
                  fontSize: item.etaDeviationMinutes > 0 ? 10 : 13,
                  fontWeight: 600,
                  color: colors.gray600,
                  textDecoration:
                    item.etaDeviationMinutes > 0 ? "line-through" : "none",
                }}
              >
                {formatTime(item.plannedScheduleTime)}{" "}
              </span>

              {item.etaDeviationMinutes > 0 && actualETA && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.danger,
                  }}
                >
                  {actualETA}
                </span>
              )}
            </p>
            <span
              style={{
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Planned Sign In
            </span>
          </div>
          {/* )} */}
          {item.cabReachedTime && (
            <p className="flex flex-col gap-0.5">
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.gray600,
                  textTransform: "uppercase",
                }}
              >
                {formatDateTimeWithoutYear(item.cabReachedTime)}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Cab Reach Time
              </span>
            </p>
          )}
          {isDrop == false ? (
            <>
              {item.empSigninTime && (
                <p className="flex flex-col gap-0.5">
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.gray600,
                      textTransform: "uppercase",
                    }}
                  >
                    {formatDateTimeWithoutYear(item.empSigninTime)}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                    }}
                  >
                    Actual Sign In
                  </span>
                </p>
              )}
            </>
          ) : (
            <>
              {item.empSignOutTime && (
                <p className="flex flex-col gap-0.5">
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.gray600,
                      textTransform: "uppercase",
                    }}
                  >
                    {formatDateTimeWithoutYear(item.empSignOutTime)}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                    }}
                  >
                    Actual Sign Out
                  </span>
                </p>
              )}
            </>
          )}
        </div>
        {/* ADDRESS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          <div
            className="flex items-center justify-between gap-1 w-full"
            style={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <p className="flex items-center gap-1">
              <span>
                <IconLocationPin />
              </span>
              <span className="font-medium" style={{ color: colors.gray600 }}>
                {item.address?.length > 50
                  ? `${item.address.slice(0, 50)}...`
                  : item.address}
              </span>
              {item.address?.length > 50 && (
                <InfoTooltip
                  icon={
                    <span
                      style={{
                        color: colors.blueinfo,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <InfoCircleOutlined />
                    </span>
                  }
                  iconColor={colors.blueinfo}
                  content={<strong>{item.address}</strong>}
                />
              )}
            </p>
          </div>
        </div>{" "}
        {distance && distance?.distanceKm > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 5,
              fontSize: 12,
              color: "#64748b",
              padding: "10px",
              borderRadius: 16,
              border: "1px solid #cbd5e1",
              background: "#f5f5f5",
            }}
          >
            {distance?.distanceKm > 0 && (
              <InfoTooltip
                icon={
                  <p
                    className="flex items-center gap-1"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      color: colors.gray600,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        color: colors.gray600,
                      }}
                    >
                      Distance
                    </span>
                    <span
                      style={{
                        color: colors.blueinfo,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 11,
                      }}
                    >
                      <InfoCircleOutlined /> :
                    </span>
                    <span className="font-bold" style={{ fontSize: 12 }}>
                      {distance?.distanceKm?.toFixed(2)} km
                    </span>
                  </p>
                }
                iconColor={colors.blueinfo}
                content={
                  <span style={{ fontSize: 11 }}>
                    Distance between <strong>{distance.fromName}</strong> and{" "}
                    <strong>{distance.toName}</strong>.
                  </span>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export const TripTimeline = ({
  data,
  passengers,
}: {
  data?: TripResponse;
  passengers: TripPassenger[];
}) => {
  const shouldFetchDistance = Boolean(data?.dsId) && data?.isCompleted === true;
  const {
    data: distanceData,
    // isLoading: isDistanceLoading,
    // isError: isDistanceError,
  } = useGetActualDistanceQuery(data?.dsId as number, {
    skip: !shouldFetchDistance,
  });
  // console.log(distanceData, passengers);
  // NEW: map empId -> distanceKm, matched on fromEmpId
  // NEW: empId -> full name, so legs can be resolved to readable names
  const empNameById = passengers.reduce((acc: Record<number, string>, p) => {
    acc[p.empId] = `${p.firstname} ${p.lastName ?? ""}`.trim();
    return acc;
  }, {});
  // UPDATED: carry names + ids alongside the distance values
  const distanceByEmpId = (distanceData?.employeeDistances ?? []).reduce(
    (
      acc: Record<
        number,
        {
          distanceKm: number;
          snapDistanceKm: number;
          fromEmpId: number;
          toEmpId: number;
          fromName: string;
          toName: string;
        }
      >,
      leg,
    ) => {
      acc[leg.fromEmpId] = {
        distanceKm: leg.distanceKm,
        snapDistanceKm: leg.toEmployeeSnapDistanceKm,
        fromEmpId: leg.fromEmpId,
        toEmpId: leg.toEmpId,
        fromName: empNameById[leg.fromEmpId] ?? `Emp ${leg.fromEmpId}`,
        toName: empNameById[leg.toEmpId] ?? `Emp ${leg.toEmpId}`,
      };
      return acc;
    },
    {},
  );
  // console.log(distanceByEmpId, "distanceByEmpId");
  const totalTripTime = getTimeDifference(
    data?.actualStartTime ?? "",
    data?.actualEndTime ?? "",
  );
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: "#0f172a",
          }}
        >
          Trip Timeline
        </div>

        {data?.isCompleted && data.actualEndTime && (
          <div
            style={{
              background: "#f8fafc",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
              border: "0.5px solid #e2e8f0",
            }}
          >
            Ended @ {formatTime(data.actualEndTime)}
          </div>
        )}
      </div>

      {/* ITEMS */}
      {passengers.map((item: TripPassenger, index: number) => (
        <TimelineItem
          tripStatusCode={data?.transTripStatusCode ?? 1}
          key={item.empId}
          item={item}
          // index={index}
          isLast={index === passengers.length - 1}
          isDrop={data?.tripTypeName == "Drop"}
          distance={distanceByEmpId[item.empId]} // NEW
        />
      ))}

      {/* FOOTER */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          // marginTop: 8,
          padding: "4px 0",
          display: "flex",
          justifyContent: "space-around",
          fontSize: 13,
        }}
      >
        {data?.actualEndTime && data?.actualStartTime && totalTripTime && (
          <div style={{ color: "#64748b" }}>
            Total Trip Duration : <strong>{totalTripTime}</strong>
          </div>
        )}
        {distanceData?.actualRouteDistanceKm != 0 &&
          distanceData?.actualRouteDistanceKm != null && (
            <div style={{ color: "#64748b" }}>
              Total Distance :{" "}
              <strong>{distanceData?.actualRouteDistanceKm} km</strong>
            </div>
          )}
      </div>
    </div>
  );
};
