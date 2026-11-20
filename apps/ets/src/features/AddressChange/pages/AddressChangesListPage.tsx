import { useEffect, useState } from "react";
import { Button } from "antd";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useAddressChangesTable } from "../hooks/useAddressChangesTable";
import { useAddressChangesModal } from "../hooks/useAddressChangesModal";
import { useAddressChangesMutations } from "../hooks/useAddressChangesMutations";
import { useLazyGetAllQuery } from "../services/addressChangesApi";
import ApproveRejectModal from "../components/ApproveRejectModal";
import type {
  // AddressChange,
  AddressChangeListParams,
  AddressChangeStatus,
  ApproveRejectDto,
} from "../types/addressChanges.types";
import SearchInput from "../../../shared/components/Search/SearchInput";

import { ScrollableTabs } from "../../../shared/components/ScrollableTabs/ScrollableTabs";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

const TAB_CONFIG: {
  key: AddressChangeStatus;
  label: string;
  badgeColor: string;
}[] = [
  { key: "Pending", label: "Pending", badgeColor: "#e53e3e" },
  { key: "Approved", label: "Approved", badgeColor: "#005c3d" },
  { key: "Rejected", label: "Rejected", badgeColor: "#524f4f" },
];

const AddressChangesListPage = () => {
  const [activeStatus, setActiveStatus] =
    useState<AddressChangeStatus>("Pending");
  const [fetchAddressChanges, { data, isFetching, error }] =
    useLazyGetAllQuery();

  // Independent, one-shot count fetches for the tab badges.
  const [fetchPendingCount, { data: pendingCountData }] = useLazyGetAllQuery();
  const [fetchApprovedCount, { data: approvedCountData }] =
    useLazyGetAllQuery();
  const [fetchRejectedCount, { data: rejectedCountData }] =
    useLazyGetAllQuery();
  const { isOpen, editingRecord, openEdit, close } = useAddressChangesModal();
  const {
    columns,
    tableState,
    setTableState,
    handleSearch,
    queryArgs,
    selectedRowKeys,
    selectedCount,
    clearSelection,
  } = useAddressChangesTable({
    onEdit: (record) => openEdit(record),
    data: data?.items ?? [],
    isSelectable: activeStatus === "Pending",
  });
  // TODO: type useAddressChangesTable's return properly so this cast goes away.
  const { searchTerm, sortColumn, sortOrder } =
    queryArgs as AddressChangeListParams;

  // inside component:
  const isMobile = useIsMobile();

  // Main table data — manual trigger, driven only by the effect below.

  const countByStatus: Record<AddressChangeStatus, number | undefined> = {
    Pending: pendingCountData?.totalCount,
    Approved: approvedCountData?.totalCount,
    Rejected: rejectedCountData?.totalCount,
  };

  const tabItems = TAB_CONFIG.map((tab) => ({
    key: tab.key,
    label: tab.label,
    count: countByStatus[tab.key],
    badgeColor: tab.badgeColor,
  }));

  const refreshCounts = () => {
    fetchPendingCount({ status: "Pending", page: 1, pageSize: 1 });
    fetchApprovedCount({ status: "Approved", page: 1, pageSize: 1 });
    fetchRejectedCount({ status: "Rejected", page: 1, pageSize: 1 });
  };

  useEffect(() => {
    refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchForStatus = (
    status: AddressChangeStatus,
    page: number = tableState.page,
  ) => {
    fetchAddressChanges({
      searchTerm,
      sortColumn,
      sortOrder,
      status,
      page,
      pageSize: tableState.pageSize,
    });
  };

  useEffect(() => {
    fetchForStatus(activeStatus, tableState.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeStatus,
    searchTerm,
    sortColumn,
    sortOrder,
    tableState.page,
    tableState.pageSize,
  ]);

  const handleTabChange = (status: AddressChangeStatus) => {
    setActiveStatus(status);
    setTableState((prev) => ({ ...prev, page: 1 }));
    clearSelection();
    // no fetch call here — the effect above picks up the state change
  };

  const {
    approveReject,
    isApprovingRejecting,
    bulkApproveReject,
    isBulkApprovingRejecting,
  } = useAddressChangesMutations({
    onCreateSuccess: () => {
      close();
      fetchForStatus(activeStatus);
      refreshCounts();
    },
    onUpdateSuccess: () => {
      close();
      fetchForStatus(activeStatus);
      refreshCounts();
    },
    onApproveRejectSuccess: () => {
      close();
      fetchForStatus(activeStatus);
      refreshCounts();
    },
    onBulkApproveRejectSuccess: () => {
      close();
      fetchForStatus(activeStatus);
      refreshCounts();
    },
  });

  const handleApproveReject = async (dto: ApproveRejectDto) => {
    await approveReject(dto);
  };

  const handleBulkApprove = async () => {
    if (!selectedRowKeys.length) return;
    await bulkApproveReject({
      empIds: selectedRowKeys,
      actionType: "A",
      rejectionRemark: null,
    });
  };

  return (
    <PageContainer
      title="Address Change"
      subtitle="Manage employee address change requests"
      pagination={
        data?.totalCount
          ? {
              total: data.totalCount,
              current: tableState.page,
              pageSize: tableState.pageSize,
              onChange: (page: number, pageSize: number) =>
                setTableState((prev) => ({ ...prev, page, pageSize })),
            }
          : undefined
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          padding: "5px 28px",
          marginBottom: "5px",
        }}
      >
        {/* <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeStatus === tab.key;
            const count = countByStatus[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  border: "none",
                  background: "none",
                  paddingBottom: 10,
                  borderBottom: isActive
                    ? "3px solid #1B4332"
                    : "3px solid transparent",
                  color: isActive ? "#1B4332" : "#6b7c74",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {tab.label}
                {count ? (
                  <span
                    style={{
                      marginLeft: 8,
                      background: tab.badgeColor,
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 12,
                    }}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div> */}
        <ScrollableTabs
          items={tabItems}
          activeKey={activeStatus}
          onChange={(key) => handleTabChange(key as AddressChangeStatus)}
        />

        <div style={{ flexShrink: 0, width: isMobile ? "100%" : 300 }}>
          <SearchInput
            width={300}
            placeholder="Search by city, number or address"
            handleSearch={handleSearch}
            isLettersOnly
          />
        </div>
      </div>

      {activeStatus === "Pending" && selectedRowKeys.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "0 28px 12px",
          }}
        >
          <span style={{ color: "#4b5563", fontSize: 13 }}>
            {selectedCount > 0
              ? `Selected ${selectedCount} row${selectedCount > 1 ? "s" : ""}`
              : "Select one or more pending rows to bulk approve."}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={() => void handleBulkApprove()}
              disabled={!selectedCount || isBulkApprovingRejecting}
              loading={isBulkApprovingRejecting}
            >
              Bulk Approve
            </Button>
            <Button onClick={clearSelection} disabled={!selectedCount}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <DataTableWrapper
        searchPlaceholder="Search by city or employee"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isFetching}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={() => fetchForStatus(activeStatus)}
          emptyMessage="No address change requests found."
        >
          <AppTable
            columns={columns as any[]}
            loading={isFetching}
            dataSource={data?.items ?? []}
            rowKey="profileUpdate_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <ApproveRejectModal
        open={isOpen}
        onClose={close}
        record={editingRecord}
        onSubmit={handleApproveReject}
        isSubmitting={isApprovingRejecting}
      />
    </PageContainer>
  );
};

export default AddressChangesListPage;
