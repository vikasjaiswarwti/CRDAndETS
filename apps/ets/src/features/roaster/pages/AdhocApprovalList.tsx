import { skipToken } from "@reduxjs/toolkit/query";
import { useState } from "react";
import { useGetCurrentUserQuery } from "../../auth/services/authApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import {
  useApproveAdhocRequestsMutation,
  useGetAdhocApprovalListQuery,
} from "../services/RosterApi";
import { useAdhocApprovalTable } from "../hooks/useAdhocApprovalTable";

const AdhocApprovalList = () => {
  const { Button, Modal, message } = useUILibrary();
  const [isApprovalConfirmOpen, setIsApprovalConfirmOpen] = useState(false);
  const { data: currentUser } = useGetCurrentUserQuery();
  const {
    columns,
    tableState,
    handleTableChange,
    selectedIds,
    setSelectedIds,
  } = useAdhocApprovalTable();
  const { data, isLoading, error, refetch } = useGetAdhocApprovalListQuery(
    currentUser?.id
      ? {
          globalUserId: currentUser.id,
          recordNumber: 0,
          pageSize: tableState.pageSize,
        }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [approve, { isLoading: isApproving }] =
    useApproveAdhocRequestsMutation();

  const items = data?.items ?? [];

  const handleApprove = async () => {
    // selectedIds contains requestID values (for example, "10-117").
    const requestIds = selectedIds.map(String).filter(Boolean).join(",");
    if (!requestIds) return;

    try {
      await approve(requestIds).unwrap();
      message?.success?.("Requests approved");
      setSelectedIds([]);
      setIsApprovalConfirmOpen(false);
      refetch();
    } catch {
      message?.error?.("Failed to approve requests");
    }
  };

  return (
    <>
      <style>{`
        .adhoc-approval-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background: transparent !important;
        }
      `}</style>
      <PageContainer
        title="Adhoc Request Approval"
        subtitle="Review and approve pending adhoc requests."
        headerActions={
          <Button
            type="primary"
            disabled={!selectedIds.length}
            loading={isApproving}
            onClick={() => setIsApprovalConfirmOpen(true)}
            style={{
              color: !selectedIds.length ? "#fff" : "",
            }}
          >
            Approve Selected ({selectedIds.length})
          </Button>
        }
        pagination={
          data?.totalCount
            ? {
                total: data.totalCount,
                current: tableState.page,
                pageSize: tableState.pageSize,
                onChange: (page, pageSize) =>
                  handleTableChange({ ...tableState, page, pageSize }),
              }
            : undefined
        }
      >
        <ApiStateWrapper
          isLoading={isLoading || !currentUser?.id}
          error={error}
          isEmpty={!items.length}
          onRetry={refetch}
          emptyMessage="No pending adhoc requests."
        >
          <AppTable
            rowKey="requestID"
            className="adhoc-approval-table"
            columns={columns}
            dataSource={items}
            loading={isLoading}
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys: Array<string | number>) => setSelectedIds(keys),
            }}
          />
        </ApiStateWrapper>
      </PageContainer>
      <Modal
        open={isApprovalConfirmOpen}
        title="Approve adhoc requests"
        onCancel={() => setIsApprovalConfirmOpen(false)}
        onOk={handleApprove}
        okText="Approve"
        cancelText="Cancel"
        confirmLoading={isApproving}
      >
        Do you want to approve the {selectedIds.length} selected adhoc request
        {selectedIds.length === 1 ? "" : "s"}?
      </Modal>
    </>
  );
};

export default AdhocApprovalList;
