/**
 * ApprovalReviewPanel
 *
 * Works for BOTH Vehicle and Driver reviews — driven by the `view` prop.
 *
 * Vehicle tabs  → registrationDoc | insuranceDoc | permitDoc | fitnessDoc | pucDoc
 *                 (keys match mapApproval() field names in VehicleApprovalApi)
 *
 * Driver tabs   → profileDoc | licenseDoc | policeVerificationDoc | govtIdDoc | trainingDoc
 *                 (keys match mapDriverApproval() field names in VehicleApprovalApi)
 *
 * Header:
 *   Vehicle → vehicleNo  •  vehicleType
 *   Driver  → driverName •  📞 mobileNo
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  ZoomInOutlined,
  CloseOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import type {
  VehicleApproval,
  DashboardView,
} from "../types/Vehiclecompliance.types";

// ─── Vehicle doc tabs ─────────────────────────────────────────────────────────
const VEHICLE_DOC_TABS = [
  { key: "registrationDoc", label: "Registration", icon: "📋" },
  { key: "insuranceDoc", label: "Insurance", icon: "🛡️" },
  { key: "permitDoc", label: "Permit", icon: "📜" },
  { key: "fitnessDoc", label: "Fitness", icon: "✅" },
  { key: "pucDoc", label: "PUC", icon: "💨" },
] as const;

// ─── Driver doc tabs ──────────────────────────────────────────────────────────
// Keys must match DriverApproval field names from mapDriverApproval():
//   profileDoc, licenseDoc, policeVerificationDoc, govtIdDoc, trainingDoc
const DRIVER_DOC_TABS = [
  { key: "profileDoc", label: "Profile", icon: "👤" },
  { key: "licenseDoc", label: "License", icon: "🪪" },
  { key: "policeVerificationDoc", label: "Police Verif.", icon: "👮" },
  { key: "govtIdDoc", label: "Govt ID", icon: "📋" },
  { key: "trainingDoc", label: "Training", icon: "📚" },
] as const;

type VehicleDocKey = (typeof VEHICLE_DOC_TABS)[number]["key"];
type DriverDocKey = (typeof DRIVER_DOC_TABS)[number]["key"];
type DocFieldKey = VehicleDocKey | DriverDocKey;

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];

/** First tab key for each view */
const defaultKey = (v: DashboardView): DocFieldKey =>
  v === "Driver" ? "profileDoc" : "registrationDoc";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDocValue(record: any, key: DocFieldKey): string | null {
  return (record[key] as string | null | undefined) ?? null;
}

function getExt(path: string): string {
  if (!path) return "";
  try {
    const parsed = new URL(path);
    const name = parsed.searchParams.get("fileName") ?? parsed.pathname;
    return (name.match(/\.(\w+)$/i)?.[1] ?? "").toLowerCase();
  } catch {
    return (path.match(/\.(\w+)$/i)?.[1] ?? "").toLowerCase();
  }
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{ url: string; ext: string; onClose: () => void }> = ({
  url,
  ext,
  onClose,
}) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0,0,0,0.88)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        display: "flex",
        gap: 8,
      }}
    >
      <button
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        style={lbBtn}
      >
        <ExportOutlined style={{ fontSize: 16 }} />
      </button>
      <button onClick={onClose} style={lbBtn}>
        <CloseOutlined style={{ fontSize: 16 }} />
      </button>
    </div>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: "90vw",
        maxHeight: "90vh",
      }}
    >
      {ext === "pdf" ? (
        <iframe
          src={url}
          title="Document"
          style={{
            width: "80vw",
            height: "85vh",
            border: "none",
            borderRadius: 12,
          }}
        />
      ) : (
        <img
          src={url}
          alt="Document"
          style={{
            maxWidth: "85vw",
            maxHeight: "85vh",
            objectFit: "contain",
            display: "block",
            borderRadius: 8,
          }}
        />
      )}
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.45)",
        fontSize: 11,
      }}
    >
      Click outside to close
    </div>
  </div>
);

const lbBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ─── DocumentPreview ──────────────────────────────────────────────────────────
const DocumentPreview: React.FC<{
  signedUrl: string | null;
  loading: boolean;
  rawPath: string | null;
  label: string;
  onViewLightbox: () => void;
  onOpenNew: () => void;
}> = ({ signedUrl, loading, rawPath, label, onViewLightbox, onOpenNew }) => {
  const { color, radius } = useTokens();
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [signedUrl]);

  const ext = getExt(rawPath ?? "");
  const isImage = IMAGE_EXTS.includes(ext) && !imgFailed;

  if (loading) {
    return (
      <div
        style={{
          border: `1px solid ${color.border}`,
          borderRadius: radius.md,
          minHeight: 140,
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#6b7280",
          fontSize: 12,
        }}
      >
        <span
          style={{
            animation: "spin 1s linear infinite",
            display: "inline-block",
          }}
        >
          ⏳
        </span>
        Loading document…
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div
        style={{
          border: `1px dashed ${color.border}`,
          borderRadius: radius.md,
          minHeight: 140,
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          color: "#9ca3af",
        }}
      >
        <span style={{ fontSize: 28 }}>📄</span>
        <span style={{ fontSize: 12 }}>No {label} document uploaded</span>
      </div>
    );
  }

  return (
    <div>
      {isImage && (
        <div
          onClick={onViewLightbox}
          style={{
            position: "relative",
            borderRadius: radius.md,
            overflow: "hidden",
            cursor: "zoom-in",
            border: `1px solid ${color.border}`,
          }}
        >
          <img
            src={signedUrl}
            alt={label}
            onError={() => setImgFailed(true)}
            style={{
              width: "100%",
              display: "block",
              maxHeight: 220,
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(0,0,0,0.38)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(0,0,0,0)")
            }
          >
            <ZoomInOutlined
              style={{ color: "#fff", fontSize: 24, opacity: 0.9 }}
            />
          </div>
        </div>
      )}
      {!isImage && (
        <iframe
          key={signedUrl}
          src={signedUrl}
          title={label}
          style={{
            width: "100%",
            height: 340,
            border: `1px solid ${color.border}`,
            borderRadius: radius.md,
            display: "block",
          }}
        />
      )}
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}
      >
        <button
          onClick={onOpenNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ExportOutlined style={{ fontSize: 10 }} /> Open in new tab
        </button>
      </div>
    </div>
  );
};

// ─── Tab label with status dot ────────────────────────────────────────────────
function TabLabel({
  icon,
  label,
  hasDoc,
}: {
  icon: string;
  label: string;
  hasDoc: boolean;
}) {
  return (
    <span
      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: hasDoc ? "#22c55e" : "#d1d5db",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {icon} {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  record: VehicleApproval;
  /** Controls which doc tabs and header identity fields to render */
  view: DashboardView;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
  isSubmitting: boolean;
  onClose?: () => void;
  isLoading?: boolean; // ← click-triggered loader from parent
}

// ─── ApprovalReviewPanel ──────────────────────────────────────────────────────
export const ApprovalReviewPanel: React.FC<Props> = ({
  record,
  view,
  onApprove,
  onReject,
  isSubmitting,
  onClose,
  isLoading,
}) => {
  const { Card, Tabs, Button, Input, Typography, Tag, Space, Divider, Spin } =
    useUILibrary();
  const { TextArea } = Input as any;
  const { Text, Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();
  const { getFileUrl } = useFileUpload();

  const [switchingRecord, setSwitchingRecord] = useState(false);

  // Active doc tab set and default key depend on view
  const docTabs = view === "Driver" ? DRIVER_DOC_TABS : VEHICLE_DOC_TABS;

  const [activeKey, setActiveKey] = useState<DocFieldKey>(defaultKey(view));
  const [remarks, setRemarks] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const recordId =
    (record as any).id ??
    (record as any).driver_Id ??
    (record as any).vehicle_Id ??
    (record as any).vehicleId;

  // Reset state when record OR view changes
  useEffect(() => {
    setSwitchingRecord(true);
    setActiveKey(defaultKey(view));
    setRemarks("");
    setLightboxOpen(false);
    setSignedUrl(null);
  }, [recordId, view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch signed URL via GET /api/v1/FileUploads/url?fileName={path}
  useEffect(() => {
    const rawPath = getDocValue(record, activeKey);

    if (!rawPath) {
      setSignedUrl(null);
      setLoadingUrl(false);
      setSwitchingRecord(false); // ← nothing to load, stop the overlay
      return;
    }

    let cancelled = false;
    setLoadingUrl(true);
    setSignedUrl(null);

    getFileUrl(rawPath)
      .then((url) => {
        if (cancelled) return;
        setSignedUrl(url && url !== "URL Not Found" ? url : null);
      })
      .catch(() => {
        if (!cancelled) setSignedUrl(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUrl(false);
          setSwitchingRecord(false);
        } // ← doc resolved, reveal the panel
      });

    return () => {
      cancelled = true;
    };
  }, [activeKey, recordId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rawDocPath = getDocValue(record, activeKey);
  const ext = getExt(rawDocPath ?? "");

  const handleOpenNew = useCallback(() => {
    if (signedUrl) window.open(signedUrl, "_blank", "noopener,noreferrer");
  }, [signedUrl]);

  const handleViewLightbox = useCallback(() => {
    if (signedUrl) setLightboxOpen(true);
  }, [signedUrl]);

  const tabItems = docTabs.map((t) => ({
    key: t.key,
    label: (
      <TabLabel
        icon={t.icon}
        label={t.label}
        hasDoc={!!getDocValue(record, t.key as DocFieldKey)}
      />
    ),
  }));

  // ── Header: identity row differs per view ───────────────────────────────────
  const identityRow =
    view === "Driver" ? (
      <Space size={6} style={{ marginTop: 4 }}>
        <Tag
          style={{
            borderRadius: radius.md,
            fontWeight: font.weightMedium,
            background: color.primaryLight,
            color: color.primary,
            border: "none",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {(record as any).driverName ?? "—"}
        </Tag>
        <Text type="secondary" style={{ fontSize: font.sizeSm }}>
          📞 {(record as any).mobileNo ?? "—"}
        </Text>
      </Space>
    ) : (
      <Space size={6} style={{ marginTop: 4 }}>
        <Tag
          style={{
            borderRadius: radius.md,
            fontWeight: font.weightMedium,
            background: color.primaryLight,
            color: color.primary,
            border: "none",
          }}
        >
          {(record as any).vehicleNo ?? "—"}
        </Tag>
        <Text type="secondary" style={{ fontSize: font.sizeSm }}>
          • {(record as any).vehicleType ?? ""}
        </Text>
      </Space>
    );

  return (
    <>
      {lightboxOpen && signedUrl && (
        <Lightbox
          url={signedUrl}
          ext={ext}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <Spin
        spinning={isLoading || switchingRecord}
        tip="Loading review…"
        size="large"
      >
        <Card
          title={
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Review {view === "Driver" ? "Driver" : "Vehicle"}
              </Title>
              {identityRow}
            </div>
          }
          extra={
            <Space size={6}>
              {signedUrl && (
                <button
                  onClick={handleOpenNew}
                  title="Open in new tab"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `1px solid ${color.border}`,
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color.textSecondary,
                  }}
                >
                  <ExportOutlined style={{ fontSize: 12 }} />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `1px solid ${color.border}`,
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color.textSecondary,
                  }}
                >
                  <CloseOutlined style={{ fontSize: 12 }} />
                </button>
              )}
            </Space>
          }
          style={{
            borderRadius: radius.xl,
            border: `1px solid ${color.border}`,
            boxShadow: shadow.panel,
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={(k: string) => setActiveKey(k as DocFieldKey)}
            items={tabItems}
            size="small"
            tabBarStyle={{
              marginBottom: 0,
              borderBottom: `1px solid ${color.border}`,
            }}
          />

          <div style={{ padding: `${spacing.md}px 0` }}>
            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 10,
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              {[
                { color: "#22c55e", label: "Doc uploaded" },
                { color: "#d1d5db", label: "Not uploaded" },
              ].map(({ color: c, label }) => (
                <span key={label}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: c,
                      marginRight: 3,
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>

            <DocumentPreview
              signedUrl={signedUrl}
              loading={loadingUrl}
              rawPath={rawDocPath}
              label={
                docTabs.find((t) => t.key === activeKey)?.label ?? activeKey
              }
              onViewLightbox={handleViewLightbox}
              onOpenNew={handleOpenNew}
            />

            <Divider style={{ margin: `${spacing.lg}px 0 ${spacing.md}px` }} />

            <div style={{ marginBottom: spacing.md }}>
              <Text
                style={{
                  fontSize: font.sizeSm,
                  color: color.textSecondary,
                  display: "block",
                  marginBottom: spacing.xs,
                }}
              >
                Remarks (optional)
              </Text>
              <TextArea
                rows={3}
                placeholder="Add your remarks here..."
                value={remarks}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRemarks(e.target.value)
                }
                style={{ borderRadius: radius.md, resize: "none" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
              }}
            >
              <Button
                block
                danger
                onClick={() => onReject(remarks)}
                loading={isSubmitting}
                style={{ borderRadius: radius.md, height: 38 }}
              >
                Reject
              </Button>
              <Button
                block
                type="primary"
                onClick={() => onApprove(remarks)}
                loading={isSubmitting}
                style={{
                  borderRadius: radius.md,
                  height: 38,
                  background: color.primary,
                }}
              >
                Approve
              </Button>
            </div>

            <div style={{ marginTop: spacing.sm, textAlign: "center" }}>
              <Text
                style={{ fontSize: font.sizeXs, color: color.textDisabled }}
              >
                {view === "Driver"
                  ? "Rejection updates driver status instantly."
                  : "Rejection updates vehicle status instantly."}
              </Text>
            </div>
          </div>
        </Card>
      </Spin>
    </>
  );
};
