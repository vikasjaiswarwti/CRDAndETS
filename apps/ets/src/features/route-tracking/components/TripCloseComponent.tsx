// import { CarOutlined } from "@ant-design/icons";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";
// import type { TripResponse } from "../types/tracking.types";

// interface FieldError {
//   field: string;
//   message: string;
// }

// interface TripCloseModalProps {
//   open: boolean;
//   onClose: () => void;
//   leftData: TripResponse;
// }

// const FIELD_LABEL_MAP: Record<string, string> = {
//   endTimeWindowViolation: "End time window violation",
//   startTimeWindowViolation: "Start time window violation",
// };

// const TripCloseComponent = ({ open, onClose, leftData }: TripCloseModalProps) => {
//   const { Modal, Button } = useUILibrary();
//   const { endTrip, isEndTripLoading, endTripError } = useRouteTrackingMutation({
//     onEndSuccess: () => onClose(),
//   });

//   const fieldErrors: FieldError[] = endTripError?.fieldErrors ?? [];

//   const handleSubmit = async () => {
//     try {
//       await endTrip({ tripID: leftData.dsId });
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const title = leftData.isCompleted
//     ? "Trip already completed"
//     : "Close trip?";

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={null}
//       width={320}
//       destroyOnClose
//       footer={
//         <div style={{ display: "flex", gap: 10, padding: "2px 0" }}>
//           <Button
//             onClick={onClose}
//             style={{
//               flex: 1,
//               border: "1px solid #3E9B73",
//               color: "#3E9B73",
//               fontWeight: 500,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             disabled={leftData.isCompleted}
//             loading={isEndTripLoading}
//             onClick={handleSubmit}
//             style={{
//               flex: 1,
//               border: "1px solid transparent",
//               background: leftData.isCompleted ? "#a0cfb8" : "#3E9B73",
//               color: "#fff",
//               fontWeight: 500,
//             }}
//           >
//             Close trip
//           </Button>
//         </div>
//       }
//       styles={{
//         header: { borderBottom: "none", paddingBottom: 0 },
//         mask: { background: "rgba(0, 60, 30, 0.35)" },
//         body: { paddingTop: 8 },
//       }}
//       style={{ borderRadius: 16 }}
//     >
//       {/* Header area */}
//       <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
//         <div
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: "50%",
//             background: "#e8f6f0",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexShrink: 0,
//           }}
//         >
//           {/* swap to a warning icon if isCompleted */}
//           <span style={{ fontSize: 20 }}>{leftData.isCompleted ? "⚠️" : <CarOutlined />}</span>
//         </div>
//         <div>
//           <p style={{ fontWeight: 500, fontSize: 15, margin: "0 0 4px", color: "#1a1a1a" }}>
//             {title}
//           </p>
//           <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
//             {leftData.isCompleted
//               ? "This trip has already been marked as completed."
//               : "This will mark the trip as completed and notify all passengers."}
//           </p>
//         </div>
//       </div>

//       {/* Field errors */}
//       {fieldErrors.length > 0 && (
//         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//           {fieldErrors.map((err) => (
//             <div
//               key={err.field}
//               style={{
//                 padding: "10px 12px",
//                 background: "#fff5f5",
//                 border: "0.5px solid #fca5a5",
//                 borderLeft: "3px solid #E24B4A",
//                 borderRadius: 8,
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: 8,
//               }}
//             >
//               <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🕐</span>
//               <div>
//                 <p
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 600,
//                     color: "#b91c1c",
//                     margin: "0 0 2px",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.03em",
//                   }}
//                 >
//                   {FIELD_LABEL_MAP[err.field] ?? err.field}
//                 </p>
//                 <p style={{ fontSize: 13, color: "#dc2626", margin: 0, lineHeight: 1.4 }}>
//                   {err.message}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default TripCloseComponent;
import { CarOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";
import type { TripResponse } from "../types/tracking.types";
interface FieldError {
  field: string;
  message: string;
}
interface TripCloseModalProps {
  open: boolean;
  onClose: () => void;
  leftData: TripResponse;
}
type TripModalMode = "completed" | "start" | "close";
const FIELD_LABEL_MAP: Record<string, string> = {
  endTimeWindowViolation: "End time window violation",
  startTimeWindowViolation: "Start time window violation",
};
const TRIP_NOT_STARTED_THRESHOLD = 3;
const getTripModalMode = (leftData: TripResponse): TripModalMode => {
  if (leftData.isCompleted) return "completed";
  if (leftData.transTripStatusCode < TRIP_NOT_STARTED_THRESHOLD) return "start";
  return "close";
};
/**
 * Validates that all fields required to call the start-trip API are present
 * and numerically valid. Returns a human-readable error message, or null if valid.
 */
const validateStartTripPayload = (leftData: TripResponse): string | null => {
  const { driverMobileNo, passengers } = leftData;
  const { plannedLat, plannedLng } = passengers[0];
  if (plannedLat === null || plannedLng === null) {
    return "Office location is not available for this trip. Please contact support.";
  }
  if (!driverMobileNo) {
    return "Driver mobile number is missing. Please contact support.";
  }
  if (Number.isNaN(Number(driverMobileNo))) {
    return "Driver mobile number is invalid.";
  }
  return null;
};
const renderFieldErrors = (fieldErrors: FieldError[]) => {
  if (fieldErrors.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {fieldErrors.map((err) => (
        <div
          key={err.field}
          style={{
            padding: "10px 12px",
            background: "#fff5f5",
            border: "0.5px solid #fca5a5",
            borderLeft: "3px solid #E24B4A",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>🕐</span>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#b91c1c",
                margin: "0 0 2px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {FIELD_LABEL_MAP[err.field] ?? err.field}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "#dc2626",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {err.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
const renderValidationError = (message: string) => (
  <div
    style={{
      padding: "10px 12px",
      background: "#fff5f5",
      border: "0.5px solid #fca5a5",
      borderLeft: "3px solid #E24B4A",
      borderRadius: 8,
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    }}
  >
    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>⚠️</span>
    <p style={{ fontSize: 13, color: "#dc2626", margin: 0, lineHeight: 1.4 }}>
      {message}
    </p>
  </div>
);
const TripCloseComponent = ({
  open,
  onClose,
  leftData,
}: TripCloseModalProps) => {
  const { Modal, Button } = useUILibrary();
  const {
    endTrip,
    isEndTripLoading,
    endTripError,
    startTrip,
    isStartTripLoading,
    startTripError,
  } = useRouteTrackingMutation({
    onEndSuccess: () => onClose(),
    onStartSuccess: () => onClose(),
  });
  const [localValidationError, setLocalValidationError] = useState<
    string | null
  >(null);
  const mode = getTripModalMode(leftData);
  const handleEndTrip = async () => {
    try {
      await endTrip({ tripID: leftData.dsId });
    } catch (err) {
      console.error("Failed to end trip:", err);
    }
  };
  const handleStartTrip = async () => {
    const validationMessage = validateStartTripPayload(leftData);
    if (validationMessage) {
      setLocalValidationError(validationMessage);
      return;
    }
    setLocalValidationError(null);
    try {
      await startTrip({
        tripID: leftData.dsId,
        lat: leftData.passengers[0]?.plannedLat as number,
        lng: leftData.passengers[0]?.plannedLng as number,
        mobileNo: leftData.driverMobileNo as string,
      });
    } catch (err) {
      console.error("Failed to start trip:", err);
    }
  };
  const endFieldErrors: FieldError[] = endTripError?.fieldErrors ?? [];
  const startFieldErrors: FieldError[] = startTripError?.fieldErrors ?? [];
  const content = {
    completed: {
      icon: "⚠️",
      title: "Trip already completed",
      description: "This trip has already been marked as completed.",
      fieldErrors: [] as FieldError[],
    },
    start: {
      icon: <PlayCircleOutlined />,
      title: "Start trip?",
      description:
        "This will mark the trip as started and notify all passengers.",
      fieldErrors: startFieldErrors,
    },
    close: {
      icon: <CarOutlined />,
      title: "Close trip?",
      description:
        "This will mark the trip as completed and notify all passengers.",
      fieldErrors: endFieldErrors,
    },
  }[mode];
  const primaryAction =
    mode === "start"
      ? {
          label: "Start trip",
          onClick: handleStartTrip,
          loading: isStartTripLoading,
          disabled: false,
        }
      : {
          label: "Close trip",
          onClick: handleEndTrip,
          loading: isEndTripLoading,
          disabled: mode === "completed",
        };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      width={320}
      destroyOnClose
      footer={
        <div style={{ display: "flex", gap: 10, padding: "2px 0" }}>
          <Button
            onClick={onClose}
            style={{
              flex: 1,
              border: "1px solid #3E9B73",
              color: "#3E9B73",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
            onClick={primaryAction.onClick}
            style={{
              flex: 1,
              border: "1px solid transparent",
              background: primaryAction.disabled ? "#a0cfb8" : "#3E9B73",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {primaryAction.label}
          </Button>
        </div>
      }
      styles={{
        header: { borderBottom: "none", paddingBottom: 0 },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        body: { paddingTop: 8 },
      }}
      style={{ borderRadius: 16 }}
    >
      {/* Header area */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#e8f6f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>{content.icon}</span>
        </div>
        <div>
          <p
            style={{
              fontWeight: 500,
              fontSize: 15,
              margin: "0 0 4px",
              color: "#1a1a1a",
            }}
          >
            {content.title}
          </p>
          <p
            style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}
          >
            {content.description}
          </p>
        </div>
      </div>
      {/* Client-side validation error (missing office coords / mobile no) */}
      {mode === "start" &&
        localValidationError &&
        renderValidationError(localValidationError)}
      {/* Server-side field errors */}
      {renderFieldErrors(content.fieldErrors)}
    </Modal>
  );
};
export default TripCloseComponent;
