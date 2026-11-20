import React, { useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import {
  useGetMappedEmployeesQuery,
  useGetUnmappedEmployeesQuery,
  useCreateMappingMutation,
  useUnmapEmployeeMutation,
} from "../services/nodalPointApi";
import { TRIP_TYPE_LABEL } from "../constants/nodalPointConstants";
import type { NodalPoint } from "../types/nodalPoint.types";
import {
  CloseOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";

interface Props {
  nodalPoint: NodalPoint | null;
  open: boolean;
  onClose: () => void;
}
const BorderStyle: React.CSSProperties = { border: "1px solid" };

function getInitials(label: string): string {
  return label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export const EmployeeMappingPanel: React.FC<Props> = ({
  nodalPoint,
  open,
  onClose,
}) => {
  const { Modal, Select, Button, Popconfirm, Empty, Tag, message } =
    useUILibrary();

  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>(
    undefined,
  );
  const [removingId, setRemovingId] = useState<number | undefined>(undefined);

  const nodalPointId = nodalPoint?.id;

  const {
    data: mappedEmployees = [],
    isLoading,
    error,
    refetch,
  } = useGetMappedEmployeesQuery(nodalPointId!, {
    skip: !open || nodalPointId == null,
  });

  const { data: unmappedEmployees = [], isLoading: isLoadingEmployees } =
    useGetUnmappedEmployeesQuery(nodalPointId!, {
      skip: !open || nodalPointId == null,
    });

  const [createMapping, { isLoading: isCreating }] = useCreateMappingMutation();
  const [unmapEmployee, { isLoading: isRemoving }] = useUnmapEmployeeMutation();

  const availableOptions = useMemo(
    () =>
      unmappedEmployees.map((e) => ({
        value: e.empId,
        label: e.mobileNumber
          ? `${e.employeeName} - ${e.mobileNumber}`
          : e.employeeName,
      })),
    [unmappedEmployees],
  );

  const handleAdd = async () => {
    if (!nodalPoint || selectedEmpId == null) return;
    const res = await createMapping({
      nodalPointId: nodalPoint.id,
      empId: selectedEmpId,
      tripType: nodalPoint.tripType,
      isActive: true,
    }).unwrap();
    message.success(res.message);
    setSelectedEmpId(undefined);
  };

  const handleRemove = async (empId: number) => {
    if (!nodalPoint) return;
    setRemovingId(empId);
    try {
      const msg = await unmapEmployee({
        nodalPointId: nodalPoint.id,
        empId,
      }).unwrap();
      message.success(msg);
    } finally {
      setRemovingId(undefined);
    }
  };

  const tripLabel = nodalPoint
    ? TRIP_TYPE_LABEL[String(nodalPoint.tripType)]
    : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        nodalPoint ? (
          <div style={{ paddingRight: 8 }}>
            {/* Main nodal point name */}
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
                lineHeight: 1.4,
                marginBottom: 8,
              }}
            >
              {nodalPoint.name}
            </div>
            {/* Badges row */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tripLabel && (
                <Tag
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 20,
                    padding: "1px 8px",
                  }}
                >
                  {tripLabel}
                </Tag>
              )}
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 20,
                  padding: "1px 8px",
                  background: "#f5f5f5",
                  borderColor: "#e0e0e0",
                  color: "#666",
                }}
              >
                Order {nodalPoint.boardingOrder}
              </Tag>
            </div>
          </div>
        ) : (
          "Employees"
        )
      }
      width={500}
      destroyOnClose
      footer={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0",
          }}
        >
          {/* Live count */}
          <span style={{ fontSize: 12, color: "#999" }}>
            {mappedEmployees.length === 0
              ? "No employees mapped"
              : `${mappedEmployees.length} employee${mappedEmployees.length !== 1 ? "s" : ""} mapped`}
          </span>
        </div>
      }
      style={{ top: 10 }}
    >
      {/* ── Add employee zone ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          padding: "12px 16px",
          background: "#fafafa",
          borderRadius: 8,
          border: "1px solid #f0f0f0",
        }}
      >
        <Select
          showSearch
          allowClear
          placeholder="Select employee to map"
          value={selectedEmpId}
          onChange={(v: number) => setSelectedEmpId(v)}
          loading={isLoadingEmployees}
          options={availableOptions}
          filterOption={(input: string, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          style={{ flex: 1 }}
        />
        <Button
          icon={<PlusOutlined />}
          type="primary"
          disabled={selectedEmpId == null}
          loading={isCreating}
          onClick={handleAdd}
          style={{ ...BorderStyle, color: selectedEmpId == null ? "#fff" : "" }}
        >
          Add
        </Button>
      </div>

      {/* ── Mapped employees list ── */}
      <ApiStateWrapper
        isLoading={isLoading}
        error={error}
        isEmpty={false}
        onRetry={refetch}
      >
        {mappedEmployees.length === 0 ? (
          <Empty
            image={<TeamOutlined style={{ fontSize: 36, color: "#d9d9d9" }} />}
            imageStyle={{ height: 48 }}
            description={
              <span style={{ color: "#bbb", fontSize: 13 }}>
                No employees mapped yet
              </span>
            }
          />
        ) : (
          <div
            className="max-h-96 overflow-y-auto"
            style={{ margin: "0 -24px", padding: "0 24px" }}
          >
            {mappedEmployees.map((m, index) => {
              const initials = getInitials(m.employeeName);

              return (
                <div
                  key={m.empId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid #f5f5f5",
                    transition: "background 0.15s",
                  }}
                  className="group"
                >
                  {/* Index */}
                  <span
                    style={{
                      fontSize: 12,
                      color: "#bbb",
                      width: 18,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#e6f4ff",
                      color: "#1677ff",
                      fontSize: 11,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      userSelect: "none",
                    }}
                  >
                    {initials || <UserOutlined style={{ fontSize: 13 }} />}
                  </div>

                  {/* Name + code */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#1a1a1a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.employeeName}
                    </div>
                    {m.mobileNumber && (
                      <div style={{ fontSize: 11, color: "#999" }}>
                        {m.mobileNumber}
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <Popconfirm
                    title="Remove this employee?"
                    description="They will be unmapped from this nodal point."
                    onConfirm={() => handleRemove(m.empId)}
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                    placement="left"
                  >
                    <Button
                      icon={<CloseOutlined style={{ fontSize: 11 }} />}
                      danger
                      size="small"
                      loading={isRemoving && removingId === m.empId}
                      type="text"
                      style={{
                        color: "#ff4d4f",
                        fontSize: 12,
                        opacity: 0.6,
                        ...BorderStyle,
                      }}
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                </div>
              );
            })}
          </div>
        )}
      </ApiStateWrapper>
    </Modal>
  );
};
