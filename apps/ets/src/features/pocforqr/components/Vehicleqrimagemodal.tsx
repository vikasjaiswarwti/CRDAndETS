import React, { useState, useEffect, useRef } from "react";
import { Spin, message } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import {
  useGetVehicleQrImageQuery,
  useRegenerateQrMutation,
  type VehicleQr,
} from "../services/VehicleQrApi";

interface Props {
  open: boolean;
  record: VehicleQr | null;
  onClose: () => void;
}

export const VehicleQrImageModal: React.FC<Props> = ({
  open,
  record,
  onClose,
}) => {
  const { Modal, Typography } = useUILibrary();
  const { Text } = Typography;
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  // local copy so we can reflect the regenerated qrUniqueCode immediately,
  // without waiting on the parent to re-pass a fresh `record` prop
  const [currentRecord, setCurrentRecord] = useState<VehicleQr | null>(record);

  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  const {
    data: qrImageUrl,
    isFetching,
    error,
    refetch,
  } = useGetVehicleQrImageQuery(record?.id as number, {
    skip: !open || !record,
    refetchOnMountOrArgChange: true,
  });

  const [regenerateQr, { isLoading: isRegenerating }] =
    useRegenerateQrMutation();

  const regenerateSeq = useRef(0);

  const handleRegenerate = async () => {
    if (!record) return;
    const seq = ++regenerateSeq.current;
    try {
      const updated = await regenerateQr(record.id).unwrap();
      if (seq === regenerateSeq.current) {
        setCurrentRecord(updated);
        refetch();
      }
      message.success("QR code regenerated");
    } catch {
      message.error("Failed to regenerate QR code");
    }
  };
  const handleDownload = () => {
    if (!qrImageUrl || !currentRecord) return;
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `vehicle-${currentRecord.vehicleNumber || currentRecord.id}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    if (open && record) refetch();
  }, [open, record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Vehicle QR — {currentRecord?.vehicleNumber ?? ""}
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

        {currentRecord?.qrUniqueCode && (
          <Text
            style={{
              fontSize: font.sizeSm,
              fontFamily: "monospace",
              color: "#6b7280",
            }}
          >
            {currentRecord.qrUniqueCode}
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
            {isRegenerating && <Spin size="small" />}
            {isRegenerating ? "Regenerating…" : "↻ Regenerate"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
