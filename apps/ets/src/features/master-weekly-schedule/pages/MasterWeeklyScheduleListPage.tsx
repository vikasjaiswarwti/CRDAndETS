import React, { useEffect, useState } from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useMasterWeeklyScheduleTable } from "../hooks/useMasterWeeklyScheduleTable";
import { useMasterWeeklyScheduleModal } from "../hooks/useMasterWeeklyScheduleModal";
import { useMasterWeeklyScheduleMutations } from "../hooks/useMasterWeeklyScheduleMutations";
import {
  useGetMasterWeeklyScheduleQuery,
  useLazyGetMasterWeeklyScheduleQuery,
} from "../services/MasterWeeklyScheduleApi";
import { MasterWeeklyScheduleFormModal } from "../components/MasterWeeklyScheduleFormModal";
import { FillScheduleModal } from "../components/FillScheduleModal";
import type { MasterWeeklyScheduleItem } from "../types/masterWeeklySchedule.types";
import { useLookups } from "../../lookups";
import { T } from "../../../styles/tokens";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchInput from "../../../shared/components/Search/SearchInput";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import { downloadExcel } from "../../../shared/hooks/useExcelExport";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const EXPORT_PAGE_SIZE = 10000;

const MasterWeeklyScheduleListPage: React.FC = () => {
  const { locationOptions, isLoading: locationsLoading } = useLookups({
    only: ["locationOptions"],
  });

  const [locCode, setLocCode] = useState<number | null>(null);

  useEffect(() => {
    if (locCode === null && locationOptions.length > 0) {
      setLocCode(locationOptions[0].value);
    }
  }, [locCode, locationOptions]);

  const [isFillOpen, setIsFillOpen] = useState(false);
  const officeName =
    locationOptions.find((o) => o.value === locCode)?.label ?? "";

  const { isOpen, editingRecord, openEdit, close } =
    useMasterWeeklyScheduleModal();

  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useMasterWeeklyScheduleTable({ locCode, onEdit: openEdit });

  const { data, isLoading, error, refetch } = useGetMasterWeeklyScheduleQuery(
    queryArgs,
    { skip: !locCode },
  );

  const [fetchExportData, { isFetching: isExporting }] =
    useLazyGetMasterWeeklyScheduleQuery();

  const handleDownload = async () => {
    if (!locCode) return;
    try {
      const result = await fetchExportData({
        ...queryArgs,
        page: 1,
        pageSize: EXPORT_PAGE_SIZE,
      }).unwrap();
      if (!result.items.length) {
        message.warning("No records to download.");
        return;
      }
      downloadExcel({
        data: result.items.map((item) => ({
          "Employee ID": item.employeeid,
          "Employee Name": item.empname,
          "Mobile No": item.mobileno,
          "Login Shift": item.pickShift ?? "",
          "Logout Shift": item.dropShift ?? "",
          "Locked Days": item.lock_Days ?? "",
        })),
        fileName: `Master_Weekly_Schedule_${String(officeName).replace(/\s+/g, "_")}.xlsx`,
        sheetName: "Master Weekly Schedule",
      });
    } catch {
      message.error("Failed to download weekly schedule.");
    }
  };

  const {
    updateMasterSchedule,
    isUpdating,
    createScheduleFromMaster,
    isFilling,
  } = useMasterWeeklyScheduleMutations({
    onUpdateSuccess: close,
    onFillSuccess: () => setIsFillOpen(false),
  });

  const handleFillSubmit = async (values: {
    fromDate: string;
    toDate: string;
  }) => {
    if (!locCode) return;
    await createScheduleFromMaster({ locCode, ...values });
  };

  const handleSubmit = async (values: {
    pickShiftId: number | null;
    dropShiftId: number | null;
    lockDays: string[];
  }) => {
    if (!editingRecord) return;
    await updateMasterSchedule({
      empID: editingRecord.commutrId,
      employeeID: editingRecord.employeeid,
      days: values.lockDays.length ? values.lockDays.join(",") : null,
      pickShift: String(values.pickShiftId),
      dropShift: String(values.dropShiftId),
    });
  };

  return (
    <PageContainer
      title="Master Weekly Schedule"
      subtitle="View employee pick/drop shifts and locked roster days by office"
      headerActions={
        <Button
          icon={<DownloadOutlined />}
          disabled={!locCode}
          loading={isExporting}
          onClick={handleDownload}
          style={{ border:`1px solid ${T.border.default}`, borderRadius: 8, }} 
        >
          Export
        </Button>
      }
      mobileMenuItems={[{ label: "Export", onClick: handleDownload }]}
      bulkButtonLabel="Fill Schedule"
      onBulkClick={() => setIsFillOpen(true)}
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
      <DataTableWrapper
        searchPlaceholder="Search by employee name or mobile no"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <SearchFilterWrapper>
          <div className="flex items-center gap-5">
            <SearchSelect
              value={locCode ?? undefined}
              labelHide={true}
              isLoading={locationsLoading}
              options={locationOptions}
              labelContent="Select Office"
              handleChange={(value) => setLocCode(Number(value))}
              style={{ background: T.formcss.inputBg }}
            />
            <SearchInput
              labelHide={true}
              labelContent="Search"
              handleSearch={handleSearch}
            />
          </div>
        </SearchFilterWrapper>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No weekly schedule records found for this office."
        >
          <AppTable<MasterWeeklyScheduleItem>
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="commutrId"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <MasterWeeklyScheduleFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        locCode={locCode}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      <FillScheduleModal
        open={isFillOpen}
        onClose={() => setIsFillOpen(false)}
        officeName={String(officeName)}
        onSubmit={handleFillSubmit}
        isSubmitting={isFilling}
      />
    </PageContainer>
  );
};

export default MasterWeeklyScheduleListPage;
