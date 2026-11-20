import { useState } from "react";
import { Modal, Select } from "antd";
import {
  useGetAvailableEscortsQuery,
  useAssignEscortMutation,
} from "../services/routeMakerApi";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

interface Props {
  dsId: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function AssignGuardModal({ dsId, onSuccess, onClose }: Props) {
  const [pickedId, setPickedId] = useState<number | null>(null);

  const { message } = useUILibrary();

  const { data: escorts = [], isLoading } = useGetAvailableEscortsQuery({
    dsId,
  });
  const [assignEscort, { isLoading: assigning }] = useAssignEscortMutation();

  async function handleAssign() {
    if (!pickedId) return;

    try {
      await assignEscort({ dsId, escortId: pickedId }).unwrap();
      message.success("Guard assigned successfully.");
      onSuccess();
      onClose();
    } catch {
      message.error("Failed to assign guard. Please try again.");
    }
  }

  const options = escorts.map((e) => ({
    value: e.escortId,
    label: e.name, // ← API returns `name`, not `escortName`
    mobileNo: e.mobileNo,
    vendorName: e.escortVendorName,
    searchText: [e.name, e.mobileNo, e.escortVendorName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  return (
    <Modal
      open
      title={
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Assign Guard
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            Trip #{dsId}
          </div>
        </div>
      }
      onCancel={onClose}
      onOk={handleAssign}
      okText={assigning ? "Assigning…" : "Assign"}
      cancelButtonProps={{ disabled: assigning }}
      width={360}
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          disabled={assigning}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #D1D5DB",
            background: "#fff",
            color: "#6B7280",
            fontSize: 12,
            fontWeight: 600,
            cursor: assigning ? "not-allowed" : "pointer",
            opacity: assigning ? 0.6 : 1,
          }}
        >
          Cancel
        </button>,
        <button
          key="assign"
          onClick={handleAssign}
          disabled={!pickedId || assigning}
          style={{
            padding: "6px 20px",
            borderRadius: 6,
            border: "none",
            background:
              pickedId && !assigning
                ? "linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)"
                : "#E5E7EB",
            color: pickedId && !assigning ? "#fff" : "#9CA3AF",
            fontSize: 12,
            fontWeight: 700,
            cursor: pickedId && !assigning ? "pointer" : "not-allowed",
          }}
        >
          {assigning ? "Assigning…" : "Assign"}
        </button>,
      ]}
    >
      <div style={{ padding: "8px 0" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#6B7280",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Select Guard
        </div>

        <Select
          showSearch
          allowClear
          placeholder="— Search guard by name or mobile —"
          style={{ width: "100%" }}
          loading={isLoading}
          value={pickedId ?? undefined}
          onChange={(val) => setPickedId(val ?? null)}
          filterOption={(input, option) =>
            (option?.searchText ?? "").includes(input.toLowerCase())
          }
          options={options}
          optionRender={(opt) => {
            const o = opt.data as (typeof options)[0];
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  padding: "2px 0",
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}
                >
                  {o.label}
                </span>
                <span style={{ fontSize: 10, color: "#6B7280" }}>
                  {o.mobileNo}
                  {o.vendorName ? `  ·  ${o.vendorName}` : ""}
                </span>
              </div>
            );
          }}
          notFoundContent={
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              No guards available
            </span>
          }
        />
      </div>
    </Modal>
  );
}
