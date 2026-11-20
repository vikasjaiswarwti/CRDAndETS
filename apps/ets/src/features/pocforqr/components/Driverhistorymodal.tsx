import React, { useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import {
  useGetDriverHistoryQuery,
  type VehicleQr,
} from "../services/VehicleQrApi";

interface Props {
  open: boolean;
  record: VehicleQr | null;
  onClose: () => void;
}

export const DriverHistoryModal: React.FC<Props> = ({
  open,
  record,
  onClose,
}) => {
  const { Modal, Typography } = useUILibrary();
  const { Text } = Typography;
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const { data, isLoading, error, refetch } = useGetDriverHistoryQuery(
    record?.id as number,
    { skip: !open || !record, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (open && record) refetch();
  }, [open, record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Driver History — {record?.vehicleNumber ?? ""}
        </span>
      }
      footer={null}
      centered
      width={isMobile ? "100%" : 520}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
    >
      <div
        style={{
          padding: `${spacing.md}px ${spacing.xl}px`,
          maxHeight: "60vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.length}
          onRetry={refetch}
          emptyMessage="No driver history for this vehicle"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
              minWidth: isMobile ? 480 : "100%",
            }}
          >
            {(data ?? []).map((entry) => {
              const isAssignment = entry.newDriverId != null;

              return (
                <div
                  key={entry.id}
                  style={{
                    border: `1px solid ${color.border}`,
                    borderRadius: radius.md,
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Text
                    style={{
                      fontSize: font.sizeSm,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {isAssignment
                      ? `Assigned: Driver #${entry.newDriverId}`
                      : "Driver unassigned"}
                  </Text>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {new Date(entry.changedOn).toLocaleString()}
                  </div>
                  {entry.oldDriverName && (
                    <div
                      style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}
                    >
                      Previous: {entry.oldDriverName}
                      {entry.oldDriverNumber
                        ? ` (${entry.oldDriverNumber})`
                        : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ApiStateWrapper>
      </div>
    </Modal>
  );
};
