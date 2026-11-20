import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useGetApprovalDocumentsQuery } from "../services/VehicleApprovalApi";
import { DOCUMENT_TABS } from "../constants/Vehicleapprovalconstants";
import type {
  VehicleApproval,
  DocumentType,
} from "../types/Vehiclecompliance.types";

// ─── Certificate placeholder ──────────────────────────────────────────────────
const DocumentPreview: React.FC<{
  previewUrl?: string;
  docType: DocumentType;
}> = ({ previewUrl, docType }) => {
  const { color, radius } = useTokens();
  if (previewUrl) {
    return (
      <img
        src={previewUrl}
        alt={`${docType} certificate`}
        style={{
          width: "100%",
          borderRadius: radius.md,
          border: `1px solid ${color.border}`,
        }}
      />
    );
  }
  return (
    <div
      style={{
        border: `1px solid ${color.border}`,
        borderRadius: radius.md,
        padding: 20,
        minHeight: 160,
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            background: color.primaryLight,
            color: color.primary,
            padding: "4px 10px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          CERTIFICATE OF {docType.toUpperCase()}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color.primary}
          strokeWidth={2}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {[100, 80, 90, 60].map((w, i) => (
        <div
          key={i}
          style={{
            height: 10,
            background: "#e5e7eb",
            borderRadius: 4,
            width: `${w}%`,
          }}
        />
      ))}
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 40,
              background: "#e5e7eb",
              borderRadius: 4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  record: VehicleApproval;
  activeDocTab: DocumentType;
  onDocTabChange: (tab: DocumentType) => void;
  remarks: string;
  onRemarksChange: (val: string) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  isSubmitting: boolean;
}

export const ReviewDocumentPanel: React.FC<Props> = ({
  record,
  activeDocTab,
  onDocTabChange,
  remarks,
  onRemarksChange,
  onApprove,
  onRequestChanges,
  isSubmitting,
}) => {
  const { Card, Tabs, Button, Input, Typography, Spin, Tag, Space, Divider } =
    useUILibrary();
  const { TextArea } = Input as any;
  const { Text, Title } = Typography;
  const { color, spacing, radius, shadow, font } = useTokens();

  const { data: documents, isLoading } = useGetApprovalDocumentsQuery(
    record.id,
  );
  const activeDoc = documents?.[activeDocTab];

  return (
    <Card
      title={
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Review Document
          </Title>
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
              {record.vehicleNo}
            </Tag>
            <Text type="secondary" style={{ fontSize: font.sizeSm }}>
              • {record.vehicleType}
            </Text>
          </Space>
        </div>
      }
      style={{
        borderRadius: radius.xl,
        border: `1px solid ${color.border}`,
        boxShadow: shadow.panel,
      }}
      // styles={{ body: { padding: 0 } }}
    >
      {/* Document tabs */}
      <Tabs
        activeKey={activeDocTab}
        onChange={(k: string) => onDocTabChange(k as DocumentType)}
        items={DOCUMENT_TABS.map((tab) => ({ key: tab, label: tab }))}
        style={{ padding: `0 ${spacing.lg}px` }}
        tabBarStyle={{
          marginBottom: 0,
          borderBottom: `1px solid ${color.border}`,
        }}
        size="small"
      />

      <div style={{ padding: spacing.lg }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: `${spacing.xxl}px 0` }}>
            <Spin />
          </div>
        ) : (
          <>
            <DocumentPreview
              previewUrl={activeDoc?.previewUrl ?? undefined}
              docType={activeDocTab}
            />

            <Divider style={{ margin: `${spacing.lg}px 0` }} />

            <Divider style={{ margin: `${spacing.lg}px 0` }} />

            {/* Remarks */}
            <div style={{ marginBottom: spacing.lg }}>
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
                  onRemarksChange(e.target.value)
                }
                style={{ borderRadius: radius.md, resize: "none" }}
              />
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
              }}
            >
              <Button
                block
                onClick={onRequestChanges}
                loading={isSubmitting}
                style={{ borderRadius: radius.md, height: 38 }}
              >
                Request Changes
              </Button>
              <Button
                block
                type="primary"
                onClick={onApprove}
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
                Decline will update vehicle status instantly.
              </Text>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
