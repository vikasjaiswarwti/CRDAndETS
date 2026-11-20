import React, { useMemo, useState, type ReactNode } from "react";
import { Select } from "antd";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchInput from "../../../shared/components/Search/SearchInput";
import { useLocationLookup } from "../../lookups/hooks/useLocationLookup";

import { useGetAllSosEscalationsQuery } from "../services/notificationManagementApi";
import { useSosEscalationMutations } from "../hooks/useSosEscalationMutations";
import { useRecordModal } from "../hooks/useRecordModal";
import { useSosEscalationTable } from "../hooks/useSosEscalationTable";
import SosEscalationFormModal from "./SosEscalationFormModal";
import {
  PAGE_SIZE,
  STATUS_FILTER_OPTIONS,
} from "../constants/notificationManagementConstants";
import { NOTIFICATION_MANAGEMENT_CONFIG as CONFIG } from "../config";
import type {
  CreateSosEscalationDto,
  SosEscalation,
  StatusFilter,
} from "../types/notificationManagement.types";
import { T } from "../../../styles/tokens";

interface EventNotificationPanelProps {
  toggle: ReactNode;
}

const SosEscalationPanel: React.FC<EventNotificationPanelProps> = ({
  toggle,
}) => {
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useRecordModal<SosEscalation>();

  const {
    createSosEscalation,
    updateSosEscalation,
    deactivateSosEscalation,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useSosEscalationMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  const { data, isLoading, error, refetch } = useGetAllSosEscalationsQuery();
  const { rawLocations } = useLocationLookup();

  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const locationOptions = useMemo(
    () => rawLocations.map((l) => ({ label: l.locName, value: l.locCode })),
    [rawLocations],
  );

  const locNameMap = useMemo(
    () => new Map(rawLocations.map((l) => [l.locCode, l.locName])),
    [rawLocations],
  );

  // Group by office, then by call order (the order recipients are dialled).
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? [])
      .filter((r) => locFilter === undefined || r.locCode === locFilter)
      .filter(
        (r) =>
          statusFilter === "all" ||
          (statusFilter === "active" ? r.isActive : !r.isActive),
      )
      .filter(
        (r) =>
          !term ||
          r.recipientName?.toLowerCase().includes(term) ||
          r.recipientMobile?.includes(term),
      )
      .sort((a, b) => a.locCode - b.locCode || a.orderNo - b.orderNo);
  }, [data, search, locFilter, statusFilter]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const { columns } = useSosEscalationTable({
    onEdit: openEdit,
    onDeactivate: deactivateSosEscalation,
    locNameMap,
  });

  const handleSubmit = async (body: CreateSosEscalationDto) => {
    if (editingRecord) {
      await updateSosEscalation({ id: editingRecord.id, ...body });
    } else {
      await createSosEscalation(body);
    }
  };

  return (
    <PageContainer
      title="SOS Escalation"
      subtitle="Who gets called, and in what order, when an SOS alert fires by the user"
      createButtonLabel="Add Recipient"
      onCreateClick={openCreate}
      canCreate={CONFIG.canCreate}
      pagination={
        filtered.length
          ? {
              total: filtered.length,
              current: page,
              pageSize,
              onChange: (p: number, ps: number) => {
                setPage(p);
                setPageSize(ps);
              },
            }
          : undefined
      }
    >
      <DataTableWrapper showSearch={false} pagination={null}>
        <SearchFilterWrapper>
          <div className="flex flex-wrap items-center gap-2">
            {toggle}
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="All Offices"
              style={{ minWidth: 180, background: T.formcss.inputBg }}
              options={locationOptions}
              value={locFilter}
              onChange={(v) => {
                setLocFilter(v);
                setPage(1);
              }}
            />
            <Select
              style={{ minWidth: 130, background: T.formcss.inputBg }}
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            />
            <SearchInput
              placeholder="Search by name or mobile"
              handleSearch={(v: string) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!filtered.length}
          onRetry={refetch}
          emptyMessage="No escalation recipients found. Add the first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={pageRows}
            rowKey="id"
            total={filtered.length}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <SosEscalationFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        defaults={{ locCode: locFilter }}
        locationOptions={locationOptions}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        serverErrors={
          editingRecord ? updateError?.fieldErrors : createError?.fieldErrors
        }
      />
    </PageContainer>
  );
};

export default SosEscalationPanel;
