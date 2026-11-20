import React, { useState } from "react";
import { Modal, Select, Button, Space, Tag, message, Switch } from "antd";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import SearchInput from "../../../shared/components/Search/SearchInput";
import {
  useGetAllQuery,
  useCreateVendorSupervisorMutation,
  useUpdateVendorSupervisorMutation,
} from "../services/vendorSupervisorApi";
import { useVendorSupervisorTable } from "../hooks/useVendorSupervisorTable";
import VendorSupervisorForm from "../components/VendorSupervisorForm";
import { useLookups } from "../../lookups";
import { VENDOR_SUPERVISOR_CONFIG } from "../config";
import type {
  VendorSupervisor,
  CreateVendorSupervisorDto,
} from "../types/vendorSupervisor.types";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green: "#1B4332",
  greenMid: "#52796F",
  greenLight: "#B7E4C7",
  inputBg: "#F0FAF4",
  border: "#B7E4C7",
  borderFocus: "#4CAF82",
  error: "#e53e3e",
} as const;
const sectionHead: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: C.green,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  borderBottom: `2px solid ${C.greenLight}`,
  paddingBottom: 5,
  marginBottom: 10,
  marginTop: 14,
};

// ─── Map Vendors modal ────────────────────────────────────────────────────────
const MapVendorsModal: React.FC<{
  open: boolean;
  record: VendorSupervisor | null;
  vendorOptions: { label: string; value: number | string }[];
  onClose: () => void;
  onSave: (
    empId: number,
    transporterIds: number[],
    active: boolean,
  ) => Promise<void>;
  isSaving: boolean;
}> = ({ open, record, vendorOptions, onClose, onSave, isSaving }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [active, setActive] = useState(true);
  const [vendorError, setVendorError] = useState("");

  React.useEffect(() => {
    if (record) {
      setSelectedIds(
        record.transporterIds?.length
          ? record.transporterIds
          : record.transporterId
            ? [record.transporterId]
            : [],
      );
      setActive(record.active ?? true);
      setVendorError("");
    }
  }, [record]);

  const handleSave = async () => {
    if (!record) return;
    if (!selectedIds.length) {
      setVendorError("Select at least one vendor.");
      return;
    }
    setVendorError("");
    await onSave(record.empId, selectedIds, active);
  };

  const chips = selectedIds
    .map((id) => vendorOptions.find((o) => Number(o.value) === id))
    .filter(Boolean) as { label: string; value: number | string }[];

  const fullName =
    `${record?.firstName ?? ""} ${record?.lastName ?? ""}`.trim();
  // const initials =
  //   `${record?.firstName?.[0] ?? ""}${record?.lastName?.[0] ?? ""}`.toUpperCase();
  // const avatarBg = pickColor(fullName || "A");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      width={500}
      centered
      destroyOnClose
      footer={null}
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Supervisor identity header ── */}
      <div
        style={{
          padding: "18px 22px 14px",
          background: "linear-gradient(135deg, #f0faf4 0%, #e6f4ec 100%)",
          borderBottom: `1px solid ${C.greenLight}`,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            background: avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            boxShadow: `0 0 0 3px ${avatarBg}40`,
          }}
        >
          {initials || "?"}
        </div> */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>
            {fullName || "Supervisor"}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1px 10px",
              marginTop: 2,
            }}
          >
            {record?.emailId && (
              <span style={{ fontSize: 11, color: C.greenMid }}>
                {record.emailId}
              </span>
            )}
            {record?.mobileNo && (
              <span style={{ fontSize: 11, color: C.greenMid }}>
                {record.mobileNo}
              </span>
            )}
          </div>
        </div>
        <Tag
          color={active ? "green" : "default"}
          style={{
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 10px",
            margin: 0,
          }}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "10px 22px 18px" }}>
        {/* Vendor assignment */}
        <div style={sectionHead}>Vendor Assignment</div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <label style={{ fontSize: 11, fontWeight: 600, color: C.greenMid }}>
              Assigned Vendors <span style={{ color: C.error }}>*</span>
            </label>
            {selectedIds.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  color: C.greenMid,
                  background: C.inputBg,
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <Select
            mode="multiple"
            style={{ width: "100%", fontSize: 12 }}
            placeholder="Search and select vendors…"
            options={vendorOptions}
            value={selectedIds}
            onChange={(vals: number[]) => {
              setSelectedIds(vals.map(Number));
              setVendorError("");
            }}
            allowClear
            showSearch
            optionFilterProp="label"
            tagRender={() => <></>}
            maxTagCount={0}
            status={vendorError ? "error" : undefined}
          />
          {vendorError && (
            <div style={{ fontSize: 10, color: C.error, marginTop: 3 }}>
              {vendorError}
            </div>
          )}
          {/* Chips */}
          {chips.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 8,
                padding: "8px 10px",
                background: C.inputBg,
                border: `1px solid ${C.greenLight}`,
                borderRadius: 7,
              }}
            >
              {chips.map((chip) => (
                <span
                  key={chip.value}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: C.greenLight,
                    border: `1px solid ${C.borderFocus}`,
                    borderRadius: 20,
                    padding: "2px 9px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: C.green,
                    lineHeight: 1.5,
                  }}
                >
                  {chip.label}
                  <span
                    onClick={() =>
                      setSelectedIds((p) =>
                        p.filter((id) => id !== Number(chip.value)),
                      )
                    }
                    style={{
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                      color: C.greenMid,
                      fontWeight: 700,
                      marginLeft: 1,
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status toggle */}
        <div style={sectionHead}>Account Status</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: active ? C.inputBg : "#f9fafb",
            border: `1px solid ${active ? C.greenLight : "#e5e7eb"}`,
            borderRadius: 7,
            padding: "9px 14px",
            transition: "all 0.2s",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>
              {active ? "Active" : "Inactive"}
            </div>
            <div style={{ fontSize: 10, color: C.greenMid, marginTop: 1 }}>
              {active
                ? "Supervisor can log in and manage assignments"
                : "Access is suspended"}
            </div>
          </div>
          <Switch
            checked={active}
            onChange={setActive}
            checkedChildren="Active"
            unCheckedChildren="Off"
            style={active ? { background: C.green } : undefined}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${C.greenLight}`,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSaving}
            style={{
              borderRadius: 50,
              borderColor: C.green,
              color: C.green,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isSaving}
            onClick={handleSave}
            style={{
              borderRadius: 50,
              background: C.green,
              borderColor: C.green,
              fontWeight: 600,
              paddingInline: 24,
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const VendorSupervisorListPage: React.FC = () => {
  const {
    columns: baseColumns,
    tableState,
    setTableState,
    handleSearch,
    queryArgs,
  } = useVendorSupervisorTable();
  const { locationOptions, vendorOptions } = useLookups({
    only: ["locationOptions", "vendorOptions"],
  });

  const { data, isLoading, error, refetch } = useGetAllQuery(queryArgs);
  const [createVendorSupervisor, { isLoading: isCreating }] =
    useCreateVendorSupervisorMutation();
  const [updateVendorSupervisor, { isLoading: isUpdating }] =
    useUpdateVendorSupervisorMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [mapRecord, setMapRecord] = useState<VendorSupervisor | null>(null);

  const handleCreate = async (dto: CreateVendorSupervisorDto) => {
    try {
      await createVendorSupervisor(dto).unwrap();
      message.success("Vendor supervisor created.");
      setCreateOpen(false);
    } catch (err: any) {
      message.error(
        err?.data?.message ??
          err?.data?.title ??
          "Failed to create supervisor.",
      );
    }
  };

  const handleMapSave = async (
    empId: number,
    transporterIds: number[],
    active: boolean,
  ) => {
    try {
      await updateVendorSupervisor({
        empId,
        body: { transporterIds, active },
      }).unwrap();
      message.success("Vendor assignments updated.");
      setMapRecord(null);
    } catch (err: any) {
      message.error(
        err?.data?.message ??
          err?.data?.title ??
          "Failed to update assignments.",
      );
    }
  };

  const actionCol = {
    key: "__action__",
    title: "Action",
    width: 160,
    align: "center" as const,
    fixed: "right" as const,
    render: (_: unknown, record: VendorSupervisor) => (
      <Space size={6}>
        <Tag
          color={record.active ? "green" : "default"}
          style={{
            fontSize: 10,
            borderRadius: 12,
            cursor: "default",
            margin: 0,
          }}
        >
          {record.active ? "Active" : "Inactive"}
        </Tag>
        <Button
          size="small"
          onClick={() => setMapRecord(record)}
          style={{
            fontSize: 11,
            borderRadius: 12,
            borderColor: C.green,
            color: C.green,
            height: 24,
            padding: "0 10px",
            fontWeight: 600,
          }}
        >
          Map Vendors
        </Button>
      </Space>
    ),
  };

  const columns = [...baseColumns, actionCol];

  return (
    <>
      <VendorSupervisorForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        vendorOptions={vendorOptions ?? []}
        locationOptions={locationOptions ?? []}
        isSubmitting={isCreating}
      />

      <MapVendorsModal
        open={Boolean(mapRecord)}
        record={mapRecord}
        vendorOptions={vendorOptions ?? []}
        onClose={() => setMapRecord(null)}
        onSave={handleMapSave}
        isSaving={isUpdating}
      />

      <PageContainer
        title="Vendor Supervisor Management"
        subtitle="Manage vendor supervisors and their transporter assignments"
        createButtonLabel="Add Vendor Supervisor"
        onCreateClick={() => setCreateOpen(true)}
        canCreate={VENDOR_SUPERVISOR_CONFIG.canCreate}
        pagination={
          data?.total
            ? {
                total: data.total,
                current: tableState.page,
                pageSize: tableState.pageSize,
                onChange: (page: number, pageSize: number) =>
                  setTableState((prev: any) => ({ ...prev, page, pageSize })),
              }
            : undefined
        }
      >
        <div style={{ padding: "20px 32px" }}>
          <SearchInput
            width={300}
            placeholder="Search by name, email or mobile"
            handleSearch={handleSearch}
            isAlphaNumeric
          />
        </div>

        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No vendor supervisors found. Add your first one."
        >
          <AppTable
            columns={columns as any}
            loading={isLoading}
            dataSource={data?.items ?? []}
            rowKey="supervisorTransporterMap_Id"
            total={data?.total ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
            scroll={{ x: 900 }}
          />
        </ApiStateWrapper>
      </PageContainer>
    </>
  );
};

export default VendorSupervisorListPage;
