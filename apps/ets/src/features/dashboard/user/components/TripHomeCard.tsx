import { useEffect, useRef, useState } from "react";
import type {
  BoardingType,
  TripConfirmationPopup,
  TripHomeEntry,
} from "../types/employeeProfile.types";
import {
  getTripStatusStyle,
  OfficeIcon,
  VehicleIcon,
  HomeIcon,
  UsersIcon,
  KeyIcon,
  CheckIcon,
  CopyIcon,
  PhoneIcon,
} from "../EmployeeDashboard";
import TripTypeBadge from "../../../../shared/components/ui/LoginBadge";
import {
  useUserTripCancelConfirmationMutation,
  useUserCancelTripMutation,
  useGetUserAppConfigurationByLocCodeQuery,
  useGetAppControlSettingsByLocCodeQuery,
  useUserBoardDeboardMutation,
  useSafeReachedHomeMutation,
  useCreateUserFeedbackMutation,
} from "../services/employeeProfileApi";
import { Button, Input, Modal, Rate, Space, Tag, message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getCurrentLocation } from "../config/parsers";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";
import { redirectToRouteTracking } from "../../../../shared/customHooks/useRedirectToTrack";

dayjs.extend(customParseFormat);

const tripLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#52796F",
  margin: "0 0 3px",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  fontWeight: 500,
};

const tripValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#1B4332",
  margin: 0,
  lineHeight: 1,
};

const ButtonBgColorStyle = {
  NO_SHOW: {
    color: "#fff",
    bg: "#B42318",
    border: "#FECACA",
  },
  CANCEL: {
    color: "#fff",
    bg: "#B42318",
    border: "#FECACA",
  },
  BOARDED: {
    color: "#fff",
    bg: "#1B6B3A",
    border: "#A7D7B8",
  },
  DEBOARDED: {
    color: "#fff",
    bg: "#1565C0",
    border: "#90CAF9",
  },
  SAFEREACHED_HOME: {
    color: "#fff",
    bg: "#7B3F00",
    border: "#FFCC80",
  },
  FEEDBACK: {
    color: "#fff",
    bg: "#7C3AED",
    border: "#DDD6FE",
  },
};

const TripAddressRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  accent?: string;
  accentBg?: string;
}> = ({ icon, label, value, accent = "#1B4332", accentBg = "#fff" }) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      background: accentBg,
      border: "1px solid #EDF4EF",
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 8,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: accentBg,
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          fontSize: 10,
          color: accent,
          margin: "0 0 3px",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "#22312B",
          margin: 0,
          fontWeight: 500,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </p>
    </div>
  </div>
);
const TripStatChip: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
  accentBg?: string;
}> = ({ icon, label, value, accent = "#1B4332", accentBg = "#fff" }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: accentBg,
      border: `1px solid ${accent}33`,
      borderRadius: 10,
      padding: "8px",
      flex: "1 1 140px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "#fff",
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          fontSize: 9,
          color: accent,
          margin: "0 0 2px",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#1B2B24",
          margin: 0,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

const TripHomeCard: React.FC<{
  trip: TripHomeEntry;
  locCode: number | null;
  refresh: () => void;
}> = ({ trip, locCode, refresh = () => {} }) => {
  const isMobile = useIsMobile();
  const tripType = String(trip.Triptype ?? "-");
  const isLogin = tripType.toLowerCase() === "login";
  const tripStatus = String(trip.TripStatusName ?? "-");
  const statusStyle = getTripStatusStyle(tripStatus);

  const rawIvr = trip.UserAppIVRNumber
    ? String(trip.UserAppIVRNumber).trim()
    : "";
  const sanitizedIvr = rawIvr.replace(/[^\d+]/g, "");
  const hasIvr = sanitizedIvr.length > 0;

  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyIvr = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasIvr) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sanitizedIvr);
      } else {
        // Fallback for contexts without the Clipboard API (e.g. non-HTTPS webviews)
        const textarea = document.createElement("textarea");
        textarea.value = sanitizedIvr;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write failed (e.g. permission denied) — number is still visible & callable
    }
  };
  // const handleRefresh = useCallback(() => {
  //   refresh();
  // }, []);
  const isEmployeeNoShow: boolean =
    trip.CancelorNoshow == null || trip.CancelorNoshow == "";
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E8F5EE",
        borderRadius: 12,
        padding: isMobile ? "6px" : "16px 18px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 14,
        }}
      >
        <TripTypeBadge type={isLogin ? "Login" : "Logout"} size={60} />

        <span
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 99,
            letterSpacing: 0.5,
          }}
        >
          {tripStatus.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={tripLabelStyle}>Employee</p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1B4332",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {trip.UserName ?? "-"}{" "}
            {trip.CancelorNoshow && (
              <Tag
                style={{
                  color: "#dc2626",
                  backgroundColor: "#fee2e2",
                  borderColor: "#fecaca",
                  fontSize: 12,
                }}
              >
                {trip.CancelorNoshow}
              </Tag>
            )}
          </p>
        </div>

        {(trip.Paxorder !== undefined || trip.PaxCount !== undefined) && (
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <p style={tripLabelStyle}>Pax</p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1B4332",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "flex-end",
              }}
            >
              <UsersIcon size={13} />
              {trip.Paxorder ?? "-"} / {trip.PaxCount ?? "-"}
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div>
          <p style={tripLabelStyle}>
            {trip.TripTypeCode == 2 ? "Drop " : "Pick "} Shift
          </p>
          <p style={tripValueStyle}>
            {trip.TripTypeCode == 2 ? trip.DropShift : trip.PickShift}
          </p>
        </div>

        <div>
          <p style={tripLabelStyle}>Pick Time</p>
          <p style={tripValueStyle}>{trip.PickTime ?? "-"}</p>
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <TripAddressRow
          icon={<HomeIcon />}
          label="Home Address"
          value={trip.UserAddress}
          // accent="#1B6B3A"
          // accentBg="#E8F5EE"
          accent="#1B6B3A"
          accentBg="#fff"
        />
        <TripAddressRow
          icon={<OfficeIcon />}
          label="Office Address"
          value={trip.OfficeAddress}
          // accent="#1565C0"
          // accentBg="#E3F2FD"
          accent="#1565C0"
          accentBg="#fff"
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {trip.VehicleInfo && (
          <TripStatChip
            icon={<VehicleIcon size={14} />}
            label="Vehicle Number"
            value={String(trip.VehicleInfo)}
            // accent="#B45309"
            // accentBg="#FEF3C7"
            accent="#B45309"
            accentBg="#fff"
          />
        )}
      </div>

      {isEmployeeNoShow && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {trip.OTP !== undefined && trip.OTP !== null && (
            <TripStatChip
              icon={<KeyIcon size={14} />}
              label="Boarding OTP"
              value={String(trip.OTP)}
              accent="#1B6B3A"
              accentBg="#E8F5EE"
            />
          )}
          {trip.DeBoardOTP !== undefined && trip.DeBoardOTP !== null && (
            <TripStatChip
              icon={<KeyIcon size={14} />}
              label="Deboarding OTP"
              value={String(trip.DeBoardOTP)}
              accent="#1565C0"
              accentBg="#E3F2FD"
            />
          )}
        </div>
      )}

      {hasIvr && isEmployeeNoShow && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 10,
            paddingTop: 10,
            borderTop: "1px dashed #E8F5EE",
          }}
        >
          <a
            href={`tel:${sanitizedIvr}`}
            aria-label={`Call ${rawIvr}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#1B4332",
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#E8F5EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PhoneIcon size={14} />
            </span>
            <span style={{ wordBreak: "break-all" }}>{rawIvr}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyIvr}
            aria-label="Copy phone number"
            title={copied ? "Copied!" : "Copy number"}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid #E8F5EE",
              background: copied ? "#E8F5EE" : "#fff",
              color: "#1B4332",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </button>
        </div>
      )}
      <BoardingStatusSection
        trip={trip}
        locCode={locCode}
        refresh={() => refresh()}
      />
    </div>
  );
};
export default TripHomeCard;

// ── Action button ────────────────────────────────────────────────────────
const ActionButton: React.FC<{
  label: string;
  color: string;
  bg: string;
  border: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({
  label,
  color,
  bg,
  border,
  onClick,
  loading = false,
  disabled = false,
}) => {
  const isDisabled = loading || disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minWidth: 80,
        height: 32,
        padding: "0 12px",
        fontSize: 12,
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 6, // normal button, not chip
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s ease",
        opacity: isDisabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = "0.85";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = "1";
        }
      }}
    >
      {loading && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            animation: "ab-spin 0.7s linear infinite",
            flexShrink: 0,
          }}
        >
          <circle
            cx="6"
            cy="6"
            r="5"
            stroke={color}
            strokeWidth="2"
            strokeOpacity="0.3"
          />
          <path
            d="M6 1a5 5 0 0 1 5 5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {label}

      <style>
        {`
          @keyframes ab-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </button>
  );
};
const ICON_MAP: Record<
  "warning" | "error" | "info" | "success",
  React.ReactNode
> = {
  warning: <WarningOutlined style={{ color: "#faad14", fontSize: 22 }} />,
  error: <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />,
  info: <InfoCircleOutlined style={{ color: "#1677ff", fontSize: 22 }} />,
  success: <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 22 }} />,
};

// ─── Dynamic Modal ─────────────────────────────────────────────────────────────
const DynamicModal: React.FC<{
  config: TripConfirmationPopup | null;
  open: boolean;
  onAction: (action: string) => void;
  actionLoading?: boolean;
}> = ({ config, open, onAction, actionLoading = false }) => {
  if (!config) return null;

  const iconKey = (config.icon ?? "warning") as keyof typeof ICON_MAP;
  const sortedButtons = [...config.buttons].sort((a, b) => a.order - b.order);

  return (
    <Modal
      open={open}
      title={
        <Space>
          {ICON_MAP[iconKey]}
          <span>{config.title}</span>
        </Space>
      }
      footer={null}
      closable={false}
      centered
      width={400}
    >
      <p style={{ marginBottom: 24, color: "#595959", whiteSpace: "pre-line" }}>
        {config.message}
      </p>

      <Space style={{ width: "100%" }}>
        {sortedButtons.map((btn, idx) => {
          const isPrimary = idx === 0;
          const isDanger =
            isPrimary && (config.icon === "warning" || config.icon === "error");
          // Primary action buttons — anything that isn't dismiss
          const isActionBtn = btn.action !== "dismiss";

          return (
            <Button
              key={btn.id}
              block
              type={isPrimary ? "primary" : "default"}
              danger={isDanger}
              loading={isActionBtn && actionLoading}
              disabled={actionLoading}
              onClick={() => onAction(btn.action)}
            >
              {btn.text}
            </Button>
          );
        })}
      </Space>
    </Modal>
  );
};

// ─── BoardingStatusSection ─────────────────────────────────────────────────────
const BoardingStatusSection: React.FC<{
  trip: TripHomeEntry;
  locCode: number | null;
  refresh: () => void;
}> = ({ trip, locCode, refresh = () => {} }) => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const isBoarded = trip.IsBoarded === true;
  const isDeboarded = trip.IsDeBoarded === true;
  const isReached = trip.IsReached == 1;

  // ── Modal state ───────────────────────────────────────────────────────────
  const [activePopup, setActivePopup] = useState<TripConfirmationPopup | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [remarks, setRemarks] = useState("");
  const { data: userConfig } = useGetUserAppConfigurationByLocCodeQuery(
    locCode!,
    { skip: !locCode && isDeboarded },
  );
  const { data: appConfig } = useGetAppControlSettingsByLocCodeQuery(locCode!, {
    skip: !locCode,
  });

  // ── RTK Query hooks ───────────────────────────────────────────────────────
  const [getCancelConfirmation, { isLoading: confirmLoading }] =
    useUserTripCancelConfirmationMutation();

  const [cancelTrip, { isLoading: cancelLoading }] =
    useUserCancelTripMutation();
  const [boardDeboardEmployee] = useUserBoardDeboardMutation();
  const [safeReachEmployee] = useSafeReachedHomeMutation();
  const [createUserFeedback, { isLoading: feedbackLoading }] =
    useCreateUserFeedbackMutation();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closePopup = () => {
    setModalOpen(false);
    setActivePopup(null);
  };

  const tripCancelPayload = {
    RequestedBy: Number(trip?.EMPID),
    RequestFor: Number(trip?.EMPID),
    TripDate: dayjs(trip.TripDate, "DD-MMM-YYYY").format("YYYY-MM-DD"),
    TripType: Number(trip?.TripTypeCode),
    TripID: trip.TripID,
  };

  const handleNoShowClick = async () => {
    try {
      const response = await getCancelConfirmation({
        RequestFor: Number(trip?.EMPID),
        TripType: Number(trip?.TripTypeCode),
        TripID: trip.TripID,
      }).unwrap();

      setActivePopup(response?.result as any);
      setModalOpen(true);
      refresh();
    } catch (err) {
      console.error("Confirmation fetch failed:", err);
    }
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case "markNoShow":
      case "cancelTrip":
        try {
          const result = await cancelTrip(tripCancelPayload).unwrap();
          // console.log(result.message, "result756");
          message.success(result.message);
          refresh();
          closePopup();
        } catch (err) {
          console.error("Cancel trip failed:", err);
        }
        break;

      case "dismiss":
        closePopup();
        break;

      default:
        console.warn("Unknown action:", action);
        closePopup();
    }
  };
  const handleBoardDeboard = async (type: BoardingType) => {
    setButtonLoading(true);
    try {
      const position = await getCurrentLocation();
      const result = await boardDeboardEmployee({
        EmpId: Number(trip?.EMPID),
        TripID: Number(trip?.TripID),
        TripType: Number(trip?.TripTypeCode),
        EmpLat: String(position.latitude),
        EmpLng: String(position.longitude),
        BoardingType: type,
      });
      console.log(result, "result");
      message.success(result?.data?.message);
      refresh();
    } catch (error) {
      console.error("Safe reach update failed:", error);
      message.error(
        "Unable to mark the trip as reached home. Please try again.",
      );
    } finally {
      setButtonLoading(false);
    }
  };
  const handleSafeReach = async () => {
    setButtonLoading(true);
    try {
      const position = await getCurrentLocation();
      const result = await safeReachEmployee({
        empId: Number(trip?.EMPID),
        tripID: Number(trip?.TripID),
        empLat: position.latitude,
        empLng: position.longitude,
      }).unwrap();

      message.success(result.message ?? "Marked as reached home");
      refresh();
      setFeedbackOpen(true);
    } catch (error) {
      console.error("Safe reach update failed:", error);
      message.error(
        "Unable to mark the trip as reached home. Please try again.",
      );
    } finally {
      setButtonLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!rating) {
      message.error("Please provide a star rating.");
      return;
    }

    try {
      const response = await createUserFeedback({
        empID: Number(trip?.EMPID),
        tripId: Number(trip?.TripID),
        rating,
        remarks: remarks.trim(),
      }).unwrap();

      message.success(response.message ?? "Feedback submitted successfully.");
      setFeedbackOpen(false);
      setRating(0);
      setRemarks("");
      refresh();
    } catch (error) {
      console.error("Feedback submission failed:", error);
      message.error("Unable to submit feedback. Please try again.");
    }
  };
  const isEmployeeNoShow: boolean =
    trip.CancelorNoshow == null || trip.CancelorNoshow == "";
  const isSafeReachButtonAllowed =
    userConfig?.AppTripUiConfig.isTripSafeHomeReach || false;
  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px dashed #E8F5EE",
        display: "flex",
        gap: 8,
      }}
    >
      {isEmployeeNoShow &&
        trip.tripButtonUiConfig.isTripNoShowButtonShow &&
        appConfig?.isCancelTripByUserAfterTAT && (
          <ActionButton
            label="No Show"
            {...ButtonBgColorStyle.NO_SHOW}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={handleNoShowClick}
          />
        )}
      {isEmployeeNoShow &&
        trip.tripButtonUiConfig.isTripCancellationButtonShow &&
        !appConfig?.isCancelTripByUserAfterTAT && (
          <ActionButton
            label="Cancel"
            {...ButtonBgColorStyle.NO_SHOW}
            loading={confirmLoading}
            disabled={confirmLoading}
            onClick={handleNoShowClick}
          />
        )}

      {!isBoarded && isEmployeeNoShow && trip.TripStatusCode == 3 && (
        <ActionButton
          label="Boarded"
          {...ButtonBgColorStyle.BOARDED}
          loading={buttonLoading}
          disabled={buttonLoading}
          onClick={() => handleBoardDeboard("B")}
        />
      )}

      {isBoarded && !isDeboarded && (
        <ActionButton
          label="De-Boarded"
          {...ButtonBgColorStyle.DEBOARDED}
          loading={buttonLoading}
          disabled={buttonLoading}
          onClick={() => handleBoardDeboard("D")}
        />
      )}
      {isDeboarded &&
        trip.TripTypeCode == 2 &&
        isSafeReachButtonAllowed &&
        !isReached && (
          <ActionButton
            label="Reached Home"
            {...ButtonBgColorStyle.SAFEREACHED_HOME}
            loading={buttonLoading}
            disabled={buttonLoading}
            onClick={handleSafeReach}
          />
        )}

      {isDeboarded &&
        trip.TripTypeCode == 2 &&
        isSafeReachButtonAllowed &&
        isReached && (
          <ActionButton
            label="Give Feedback"
            {...ButtonBgColorStyle.FEEDBACK}
            onClick={() => setFeedbackOpen(true)}
          />
        )}

      {isDeboarded && trip.TripTypeCode == 2 && !isSafeReachButtonAllowed && (
        <ActionButton
          label="Give Feedback"
          {...ButtonBgColorStyle.FEEDBACK}
          onClick={() => setFeedbackOpen(true)}
        />
      )}
      {isDeboarded && trip.TripTypeCode == 1 && (
        <ActionButton
          label="Give Feedback"
          {...ButtonBgColorStyle.FEEDBACK}
          onClick={() => setFeedbackOpen(true)}
        />
      )}
      <ActionButton
        label="Track Trip"
        color="#fff"
        bg="#1565C0"
        border="#90CAF9"
        onClick={() => redirectToRouteTracking(trip.TripID)}
      />
      <DynamicModal
        config={activePopup}
        open={modalOpen}
        onAction={handleAction}
        actionLoading={cancelLoading}
      />
      <Modal
        title="Rate your trip"
        open={feedbackOpen}
        onCancel={() => setFeedbackOpen(false)}
        onOk={handleFeedbackSubmit}
        okText="Submit Feedback"
        confirmLoading={feedbackLoading}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <div className="mb-2 text-sm font-medium">Star rating</div>
            <Rate value={rating} onChange={setRating} />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Message</div>
            <Input.TextArea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Share your feedback (optional)"
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
