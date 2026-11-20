import { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type {
  AddressChange,
  ApproveRejectDto,
} from "../types/addressChanges.types";
import { useGoogleMapV2 } from "../../../shared/hooks/useGoogleMap";
import { Col, Row, Spin, Descriptions } from "antd";
import { getActionBadge } from "../utils/ActionBadge";

interface ApproveRejectModalProps {
  open: boolean;
  onClose: () => void;
  record: AddressChange | null;
  onSubmit: (dto: ApproveRejectDto) => Promise<void>;
  isSubmitting: boolean;
}

const ApproveRejectModal = ({
  open,
  onClose,
  record,
  onSubmit,
  isSubmitting,
}: ApproveRejectModalProps) => {
  const { Modal, Button, Input, Radio, Space } = useUILibrary();
  const [actionType, setActionType] = useState<"A" | "R">("A");
  const [rejectionRemark, setRejectionRemark] = useState("");
  const handleSubmit = async () => {
    if (!record) return;
    await onSubmit({
      profileUpdate_Id: record.profileUpdate_Id,
      actionType,
      rejectionRemark: actionType === "R" ? rejectionRemark : null,
    });
    setActionType("A");
    setRejectionRemark("");
  };

  const { mapRef, isLoaded } = useGoogleMapV2({
    defaultLat: record?.emp_Lat ?? 28.6139,
    defaultLng: record?.emp_Lng ?? 77.209,
  });

  const normalizedStatus = record?.actionType?.toLowerCase();
  const isPending = normalizedStatus !== "a" && normalizedStatus !== "r";

  return (
    <>
      {open && (
        <Modal
          open={open}
          onCancel={onClose}
          title="Approve / Reject Address Change"
          width={960}
          // height={540}
          destroyOnClose
          // className="m-0"
          style={{ top: 60 }} // ✅ override 100px
          styles={{
            header: { borderBottom: "none" },
            mask: { background: "rgba(0, 60, 30, 0.35)" },
          }}
          footer={
            isPending ? (
              <Space>
                <Button
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{ border: "1px solid" }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={actionType === "R" && !rejectionRemark.trim()}
                  style={{
                    background: actionType === "R" ? "#d32f2f" : "#1B4332",
                    borderColor: actionType === "R" ? "#d32f2f" : "#1B4332",
                    borderRadius: 50,
                    border: "1px solid",
                    color: "#fff",
                    cursor:
                      actionType === "R" && !rejectionRemark.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {actionType === "R" ? "Reject" : "Approve"}
                </Button>
              </Space>
            ) : (
              <Button onClick={onClose} style={{ border: "1px solid" }}>
                Close
              </Button>
            )
          }
        >
          <Row gutter={[16, 16]} className="mt-5" style={{ marginTop: 20 }}>
            <Col  xs={24} md={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  padding: "8px 12px",
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "linear-gradient(135deg,#1B4332,#2d6a4f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {record?.employeeName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}
                  >
                    {record?.employeeName ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {record?.mobileNo || "No phone"}
                  </div>
                </div>
                {/* Current status badge */}
                {(() => {
                  const b = getActionBadge(record?.actionType);
                  return (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 12,
                        background: b.bg,
                        border: `1px solid ${b.border}`,
                        color: b.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>{" "}
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Location">
                  <span style={{ fontSize: 14 }}>{record?.locationName}</span>
                </Descriptions.Item>

                <Descriptions.Item label="City">
                  {record?.city}
                </Descriptions.Item>
                <Descriptions.Item label="State" className="text-md">
                  {record?.state} ({record?.pin})
                </Descriptions.Item>

                <Descriptions.Item label="Address" span={2}>
                  {record?.address}
                </Descriptions.Item>

                {/* <Descriptions.Item label="Emergency Contact">
                  {record?.emerContactNo}
                </Descriptions.Item> */}

                <Descriptions.Item label="Mobile">
                  {record?.mobileNo || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Coordinates">
                  {record?.emp_Lat} - {record?.emp_Lng}
                </Descriptions.Item>

                <Descriptions.Item label="Remarks">
                  {record?.remarks?.trim()
                    ? record.remarks
                    : "-"}
                </Descriptions.Item>

                {/* <Descriptions.Item label="Effective Date">
                  {new Date(record?.effectivedate ?? "").toLocaleDateString()}
                </Descriptions.Item> */}
              </Descriptions>
              {/* </Card> */}
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #B7E4C7",
                  marginBottom: 14,
                  position: "relative",
                  height: 280,
                  backgroundColor: "#e8f5e9",
                }}
              >
                {isLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#F0FAF4",
                      color: "#52796F",
                      fontSize: 13,
                    }}
                  >
                    <Spin /> &nbsp; Loading map…
                  </div>
                )}
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {/* <Radio.Group
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                >
                  <Radio value="A">Approve</Radio>
                  <Radio value="R">Reject</Radio>
                </Radio.Group>

                {actionType === "R" && (
                  <Input.TextArea
                    value={rejectionRemark}
                    onChange={(e) => setRejectionRemark(e.target.value)}
                    placeholder="Enter rejection remark (required)"
                    rows={2}
                    style={{
                      background: "#F0FAF4",
                      border: "1px solid #B7E4C7",
                      borderRadius: 8,
                    }}
                  />
                )} */}
                {isPending && (
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Radio.Group
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                    >
                      <Radio value="A">Approve</Radio>
                      <Radio value="R">Reject</Radio>
                    </Radio.Group>

                    {actionType === "R" && (
                      <Input.TextArea
                        value={rejectionRemark}
                        onChange={(e) => setRejectionRemark(e.target.value)}
                        placeholder="Enter rejection remark (required)"
                        rows={2}
                        style={{
                          background: "#F0FAF4",
                          border: "1px solid #B7E4C7",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </Space>
                )}
              </Space>
            </Col>
          </Row>
        </Modal>
      )}
    </>
  );
};

export default ApproveRejectModal;
