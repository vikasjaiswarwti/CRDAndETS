import React, { useState } from "react";
import { message } from "antd";
import {
  UserRound,
  Car,
  // Building2,
  Phone as PhoneIcon,
  X,
  // Send,
  RefreshCcw,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";

import type { ComplaintReply } from "../types/complaint.types";

import {
  parseComplaintThread,
  useUpdateComplaintReplyMutation,
} from "../services/ComplaintApi";
import { ResolveCloseModal } from "./ResolveCloseModal";
import { SendResolveSplitButton } from "./SendResolveSplitButton";

interface Props {
  complaint: ComplaintReply | undefined;
  onClose: () => void;
  onDataChanged: () => void; // parent refetches the list (single source of truth)
}

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const InfoRow: React.FC<{
  icon?: React.ReactNode;
  label?: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}
  >
    {icon && <span style={{ color: "#059669", display: "flex" }}>{icon}</span>}
    {label && <span>{label}:</span>}
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

const GREEN = "#065f46";

const StatusBadge: React.FC<{ resolved: boolean }> = ({ resolved }) => (
  <span
    style={{
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: resolved ? "#d1fae5" : "#fee2e2",
      color: resolved ? "#059669" : "#dc2626",
    }}
  >
    {resolved ? "Resolved" : "Unresolved"}
  </span>
);

export const ComplaintDetailPanel: React.FC<Props> = ({
  complaint,
  onClose,
  onDataChanged,
}) => {
  const { Typography, Input, Button, Avatar } = useUILibrary();
  const { Text } = Typography;
  const { color, spacing, radius } = useTokens();

  const [replyText, setReplyText] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);
  const [updateComplaintReply, { isLoading: isSubmitting }] =
    useUpdateComplaintReplyMutation();

  if (!complaint) return null;

  // transportReply is `null` until a first reply/thread entry exists (see the
  // API sample — most rows have transportReply: null). Skip parsing entirely
  // instead of handing parseComplaintThread a null and having thread.map
  // below blow up with "Cannot read properties of null (reading 'map')" —
  // that crash is why clicking a row with no thread yet looked like the
  // review panel "wasn't opening."
  const thread = complaint.transportReply
    ? (parseComplaintThread(complaint.transportReply) ?? [])
    : [];

  // NOTE: `mobile` isn't on the ComplaintReply type shown earlier — add it
  // there (or swap the field name) if the API already returns it.
  const mobile = (complaint as any).mobileNo ?? "-";

  const handleSendReply = async () => {
    const msg = replyText.trim();
    if (!msg) return; // mandatory: no empty replies either
    try {
      await updateComplaintReply({
        ReferenceNo: complaint.referenceNo,
        Message: msg,
        Status: false,
      }).unwrap();
      setReplyText("");
      message.success("Reply sent");
      onDataChanged(); // refetch — never trust local state here
    } catch {
      message.error("Failed to send reply");
    }
  };

  const handleResolveConfirm = async (finalMessage: string) => {
    try {
      await updateComplaintReply({
        ReferenceNo: complaint.referenceNo,
        Message: finalMessage,
        Status: true,
      }).unwrap();
      message.success("Ticket closed");
      setResolveOpen(false);
      onClose(); // the complaint will disappear from the Unresolved list after refetch
      onDataChanged();
    } catch {
      message.error("Failed to close ticket");
    }
  };

  return (
    // Sits in a Col that no longer has a locked height (page scrolls
    // normally now, matching ApprovalDashboardPage), so height: "100%" here
    // had nothing to resolve against and would've just collapsed. Let the
    // card size to its content; only the conversation list below scrolls
    // internally, capped with maxHeight instead of a flex:1 percentage.
    <div
      style={{
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${spacing.md}px ${spacing.lg}px`,
          borderBottom: `1px solid ${color.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: 700, fontSize: 16 }}>
            Complaint #{complaint.referenceNo}{" "}
            <StatusBadge resolved={complaint.status} />
          </Text>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              color: "#6b7280",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 10,
            columnGap: spacing.lg,
            marginTop: spacing.md,
            fontSize: 13,
          }}
        >
          <InfoRow
            icon={<UserRound size={14} />}
            // label="Employee"
            value={complaint.userName}
          />
          <InfoRow icon={<PhoneIcon size={14} />} value={mobile} />
          <InfoRow
            icon={<Car size={14} />}
            label="Query"
            value={complaint.complainName}
          />
          <InfoRow label="Date" value={complaint.complainDate} />
          {/* <InfoRow
            icon={<Building2 size={14} />}
            label="Office"
            value={complaint.office}
          /> 
          <InfoRow
            label="Status"
            value={<StatusBadge resolved={complaint.status} />}
          />*/}
        </div>
      </div>

      {/* Conversation — maxHeight (not flex:1) since the panel no longer
          sits in a height-locked parent; this still keeps a long thread
          scrolling internally instead of stretching the whole page. */}
      <div style={{ maxHeight: 480, overflowY: "auto", padding: spacing.lg }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>
            Conversation
          </Text>
          {/* No live updates/polling on this thread — refresh is manual. */}
          <Button
            size="small"
            onClick={onDataChanged}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${GREEN}`,
              color: GREEN,
              background: "#fff",
              fontWeight: 600,
            }}
          >
            <RefreshCcw size={13} />
            Refresh
          </Button>
        </div>
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>
          Please refresh to see recent messages.
        </Text>

        <div style={{ marginTop: spacing.sm }}>
          {thread.map((t, i) => {
            const isAgent =
              (t.ThreadBy ?? "").toLowerCase() !==
              (complaint.userName ?? "").toLowerCase();
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isAgent ? "flex-end" : "flex-start",
                  marginBottom: spacing.sm,
                  gap: spacing.xs,
                }}
              >
                {!isAgent && (
                  <Avatar size="small">{initials(t.ThreadBy)}</Avatar>
                )}
                <div
                  style={{
                    background: isAgent ? "#e8f8ef" : "#f3f4f6",
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    maxWidth: "75%",
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{t.Message}</Text>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      marginTop: 4,
                      textAlign: isAgent ? "right" : "left",
                    }}
                  >
                    {t.ThreadOn}
                    {isAgent ? " ✓" : ""}
                  </div>
                </div>
                {isAgent && (
                  <Avatar size="small" style={{ background: "#065f46" }}>
                    {initials(t.ThreadBy) || "AD"}
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply box */}
      {!complaint.status && (
        <div
          style={{
            borderTop: `1px solid ${color.border}`,
            padding: spacing.md,
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          <Input.TextArea
            rows={3}
            placeholder="Type your reply here..."
            value={replyText}
            disabled={isSubmitting}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setReplyText(e.target.value)
            }
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SendResolveSplitButton
              onSend={handleSendReply}
              onResolve={() => setResolveOpen(true)}
              disabled={!replyText.trim()}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      <ResolveCloseModal
        open={resolveOpen}
        isSubmitting={isSubmitting}
        message={replyText}
        onCancel={() => setResolveOpen(false)}
        onConfirm={handleResolveConfirm}
      />
    </div>
  );
};
