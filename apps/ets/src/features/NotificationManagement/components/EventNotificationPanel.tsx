import React, { useMemo, useState, type ReactNode } from "react";
import { Select } from "antd";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchInput from "../../../shared/components/Search/SearchInput";

import { useGetAllEventNotificationsQuery } from "../services/notificationManagementApi";
import { useEventNotificationMutations } from "../hooks/useEventNotificationMutations";
import { useRecordModal } from "../hooks/useRecordModal";
import { useEventNotificationTable } from "../hooks/useEventNotificationTable";
import EventNotificationFormModal from "./EventNotificationFormModal";
import {
  EVENT_KEY_OPTIONS,
  PAGE_SIZE,
  STATUS_FILTER_OPTIONS,
} from "../constants/notificationManagementConstants";
import { NOTIFICATION_MANAGEMENT_CONFIG as CONFIG } from "../config";
import type {
  CreateEventNotificationDto,
  EventNotification,
  StatusFilter,
} from "../types/notificationManagement.types";

interface EventNotificationPanelProps {
  toggle: ReactNode;
}

const EventNotificationPanel: React.FC<EventNotificationPanelProps> = ({
  toggle,
}) => {
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useRecordModal<EventNotification>();

  const {
    createEventNotification,
    updateEventNotification,
    deactivateEventNotification,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useEventNotificationMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  const { data, isLoading, error, refetch } =
    useGetAllEventNotificationsQuery();

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? [])
      .filter((r) => !eventFilter || r.eventKey === eventFilter)
      .filter(
        (r) =>
          statusFilter === "all" ||
          (statusFilter === "active" ? r.active : !r.active),
      )
      .filter(
        (r) =>
          !term ||
          r.email?.toLowerCase().includes(term) ||
          r.mobile?.includes(term),
      )
      .sort((a, b) => (a.eventKey ?? "").localeCompare(b.eventKey ?? ""));
  }, [data, search, eventFilter, statusFilter]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const { columns } = useEventNotificationTable({
    onEdit: openEdit,
    onDeactivate: deactivateEventNotification,
  });

  const handleSubmit = async (body: CreateEventNotificationDto) => {
    if (editingRecord) {
      await updateEventNotification({ id: editingRecord.id, ...body });
    } else {
      await createEventNotification(body);
    }
  };

  return (
    <PageContainer
      title="Event Notification"
      subtitle="Who gets notified by email, when a system event triggers"
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
              placeholder="All Events"
              style={{ minWidth: 220 }}
              options={EVENT_KEY_OPTIONS}
              value={eventFilter}
              onChange={(v) => {
                setEventFilter(v);
                setPage(1);
              }}
            />
            <Select
              style={{ minWidth: 130 }}
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            />
            <SearchInput
              placeholder="Search by email or mobile"
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
          emptyMessage="No notification recipients found. Add the first one."
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

      <EventNotificationFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        defaults={{ eventKey: eventFilter }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        serverErrors={
          editingRecord ? updateError?.fieldErrors : createError?.fieldErrors
        }
      />
    </PageContainer>
  );
};

export default EventNotificationPanel;
