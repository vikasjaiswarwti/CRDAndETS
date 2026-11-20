import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import {
  useGetVehicleQrImageQuery,
  useRegenerateVehicleQrMutation,
} from "../services/VehicleComplianceApi";
import type { VehicleCompliance } from "../types/Vehiclecompliance.types";

interface VehicleQrModalProps {
  open: boolean;
  record: VehicleCompliance | null;
  onClose: () => void;
}

export const VehicleQrModal: React.FC<VehicleQrModalProps> = ({
  open,
  record,
  onClose,
}) => {
  const { Modal, Typography } = useUILibrary();
  const { Text } = Typography;
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const [currentRecord, setCurrentRecord] = useState<VehicleCompliance | null>(
    record,
  );

  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  const vehicleId = currentRecord?.vehicle_Id ?? record?.vehicle_Id ?? "";

  const {
    data: qrImageUrl,
    isFetching,
    error,
    refetch,
  } = useGetVehicleQrImageQuery(vehicleId, {
    skip: !open || !vehicleId,
    refetchOnMountOrArgChange: true,
  });

  const [regenerateQr, { isLoading: isRegenerating }] =
    useRegenerateVehicleQrMutation();

  const handleRegenerate = async () => {
    if (!vehicleId) return;

    try {
      const updated = await regenerateQr(vehicleId).unwrap();
      setCurrentRecord((prev) => ({
        ...(prev ?? record ?? ({} as VehicleCompliance)),
        ...(updated ?? {}),
      }));
      await refetch();
      message.success("QR code regenerated");
    } catch {
      message.error("Failed to regenerate QR code");
    }
  };

  const handleDownload = () => {
    if (!qrImageUrl || !currentRecord) return;

    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `vehicle-${currentRecord.vehicleNo || currentRecord.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    if (open && vehicleId) refetch();
  }, [open, vehicleId, refetch]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Vehicle QR — {currentRecord?.vehicleNo ?? ""}
        </span>
      }
      footer={null}
      centered
      width={isMobile ? "100%" : 420}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: spacing.md,
          padding: `${spacing.lg}px ${spacing.md}px`,
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: radius.lg,
            border: `1px solid ${color.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            overflow: "hidden",
          }}
        >
          {isFetching ? (
            <Spin />
          ) : error || !qrImageUrl ? (
            <Text style={{ fontSize: font.sizeSm, color: "#9ca3af" }}>
              QR code not available
            </Text>
          ) : (
            <img
              src={qrImageUrl}
              alt="Vehicle QR code"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>

        {currentRecord?.vehicleNo && (
          <Text
            style={{
              fontSize: font.sizeSm,
              fontFamily: "monospace",
              color: "#6b7280",
            }}
          >
            Vehicle: {currentRecord.vehicleNo}
          </Text>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "100%",
            gap: spacing.sm,
          }}
        >
          <button
            onClick={handleDownload}
            disabled={!qrImageUrl}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: radius.md,
              border: `1px solid ${color.primary}`,
              background: "#fff",
              color: color.primary,
              cursor: qrImageUrl ? "pointer" : "not-allowed",
              fontSize: font.sizeSm,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            ⬇ Download
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: radius.md,
              border: "none",
              background: isRegenerating ? "#9ca3af" : color.primary,
              color: "#fff",
              cursor: isRegenerating ? "not-allowed" : "pointer",
              fontSize: font.sizeSm,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {isRegenerating ? "Regenerating…" : "↻ Regenerate"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
