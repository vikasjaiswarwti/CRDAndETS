import React, { useState, useEffect, useMemo } from "react";
import { Select, message, Spin } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

import { useGetFleetDriversQuery } from "../services/FleetDriverApi";
import {
  useAssignDriverMutation,
  type VehicleQr,
} from "../services/VehicleQrApi";

interface Props {
  open: boolean;
  record: VehicleQr | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignDriverModal: React.FC<Props> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const { Modal, Typography } = useUILibrary();
  const { Text } = Typography;
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const { data: driverData, refetch: refetchDrivers } = useGetFleetDriversQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const driverOptions = useMemo(
    () =>
      (driverData?.items ?? []).map((d) => ({
        label: `${d.driverName}-${d.driverNumber}`,
        value: d.id,
      })),
    [driverData],
  );

  const [driverId, setDriverId] = useState<any>(undefined);
  const [assignDriver, { isLoading }] = useAssignDriverMutation();

  useEffect(() => {
    if (open) {
      setDriverId(record?.driverId ?? undefined);
      refetchDrivers();
    }
  }, [open, record]);

  const handleSubmit = async () => {
    if (!record || !driverId) {
      message.error("Please select a driver");
      return;
    }
    try {
      await assignDriver({ id: record.id, driverId }).unwrap();
      message.success("Driver assigned");
      onSuccess();
    } catch {
      message.error("Failed to assign driver");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Assign Driver — {record?.vehicleNumber ?? ""}
        </span>
      }
      footer={null}
      centered
      width={isMobile ? "100%" : 420}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
    >
      <div style={{ padding: `${spacing.md}px ${spacing.xl}px` }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#374151",
            display: "block",
            marginBottom: 4,
          }}
        >
          Driver
        </Text>
        <Select
          value={driverId}
          onChange={(v: any) => setDriverId(v)}
          options={driverOptions ?? []}
          placeholder="Select driver"
          showSearch
          optionFilterProp="label"
          style={{ width: "100%", fontSize: 12 }}
        />
        {record?.driverId && (
          <Text
            style={{
              fontSize: 11,
              color: "#9ca3af",
              display: "block",
              marginTop: 6,
            }}
          >
            Currently assigned: {record.driverId}
          </Text>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          justifyContent: isMobile ? "stretch" : "flex-end",
          gap: spacing.sm,
          padding: isMobile
            ? `${spacing.sm}px ${spacing.md}px ${spacing.md}px`
            : `${spacing.sm}px ${spacing.xl}px ${spacing.md}px`,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "7px 18px",
            borderRadius: radius.md,
            border: "1px solid #d9d9d9",
            background: "#fff",
            cursor: "pointer",
            fontSize: font.sizeSm,
            fontFamily: "inherit",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            padding: "7px 22px",
            borderRadius: radius.md,
            border: "none",
            background: isLoading ? "#9ca3af" : color.primary,
            color: "#fff",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: font.sizeSm,
            fontWeight: 600,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: isMobile ? "100%" : "auto",
          }}
        >
          {isLoading && <Spin size="small" />}
          {isLoading ? "Assigning…" : "Assign Driver"}
        </button>
      </div>
    </Modal>
  );
};
