import { useState } from "react";
import { useGetAllVehicleCheckSheetQuery } from "../services/ltrApi";
import { useCheckListModal } from "../hooks/useCheckListModal";
import { useCheckListTable } from "../hooks/useCheckListTable";
import type { VehicleCheckSheet } from "../types/checkList.types";

import VehicleCheckSheetForm from "../components/VehicleCheckSheetForm";
import VehicleCheckSheetDetailsModal from "../components/VehicleCheckSheetDetailsModal";
import PageContainer from "../../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../../shared/components/AppTable/AppTable";
const VehicleCheckSheetPage: React.FC = () => {
  const [selectedRecord, setSelectedRecord] =
    useState<VehicleCheckSheet | null>(null);
  const [editingRecord, setEditingRecord] = useState<VehicleCheckSheet | null>(
    null,
  );
  // 1. Modal state
  const { isOpen, openCreate, close } = useCheckListModal();

  const handleEdit = (record: VehicleCheckSheet) => {
    setSelectedRecord(null);
    setEditingRecord(record);
    openCreate();
  };

  const {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  } = useCheckListTable({ onEdit: handleEdit });

  // 4. RTK Query
  const { data, isLoading, error, refetch } =
    useGetAllVehicleCheckSheetQuery(queryArgs);
  const records = data?.result ?? [];
  const handleBack = () => {
    setSelectedRecord(null);
    setEditingRecord(null);
    close();
    refetch();
  };

  const handleCreate = () => {
    setEditingRecord(null);
    openCreate();
  };

  return (
    <>
      {isOpen ? (
        <div style={{ background: "#fff" }}>
          <VehicleCheckSheetForm onBack={handleBack} record={editingRecord} />
        </div>
      ) : (
        <PageContainer
          title="Vehicle CheckList"
          subtitle="Manage vehicle inspection check sheets"
          createButtonLabel="Create Check Sheet"
          onCreateClick={handleCreate}
          canCreate={true}
          pagination={
            data
              ? {
                  total: data.totalItems,
                  current: tableState.page,
                  pageSize: tableState.pageSize,
                  onChange: (page, pageSize) =>
                    setTableState({ page, pageSize }),
                }
              : undefined
          }
        >
          <DataTableWrapper
            searchPlaceholder="Search by vehicle number"
            onSearch={handleSearch}
            showSearch
            pagination={null}
          >
            <ApiStateWrapper
              isLoading={isLoading}
              error={error}
              isEmpty={!isLoading && records.length === 0}
              onRetry={refetch}
              emptyMessage={
                search
                  ? "No check sheets match your search."
                  : "No check sheets found. Create your first one."
              }
            >
              <AppTable
                loading={isLoading}
                columns={columns}
                dataSource={records}
                rowKey={(record) => String(record.id ?? record._id)}
                total={data?.totalItems ?? 0}
                scroll={{ x: 1600 }}
                tableState={tableState}
                onTableChange={setTableState}
                // onRowClick={setSelectedRecord}
              />
            </ApiStateWrapper>
          </DataTableWrapper>
        </PageContainer>
      )}
      <VehicleCheckSheetDetailsModal
        record={selectedRecord}
        onClose={handleBack}
      />
    </>
  );
};

export default VehicleCheckSheetPage;
