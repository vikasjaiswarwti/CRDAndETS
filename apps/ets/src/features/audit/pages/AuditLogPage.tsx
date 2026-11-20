import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { selectRoles } from "../../navigation/slices/navigationSlice";
import { auditConstant, auditLabel } from "../constants/auditConstant";
import {
  DEFAULT_PAGE_SIZE,
  auditLogColumns,
  useAuditLogData,
} from "../components/auditLogShared";
import { useGetApprovedUsersQuery } from "../../employee";
// import { useGetCurrentUserQuery } from "../../auth/services/authApi";

const moduleOptions = Object.values(auditConstant).map((value) => ({
  label: auditLabel[value] ?? value,
  value,
}));

export default function AuditLogPage() {
  const roles = useSelector(selectRoles);
  // const { data: currentUser } = useGetCurrentUserQuery();
  const {
    data: managerData,
    isLoading: managerLoading,
    isFetching: managerFetching,
    // error: managerError,
  } = useGetApprovedUsersQuery({
    page: 1,
    pageSize: 30,
    isSystem: true,
  });
  const [userId, setUserId] = useState<string>("");
  const isAdmin = roles.includes("admin");
  const { Select, DatePicker, Switch, Alert } = useUILibrary();
  const { RangePicker } = DatePicker as any;

  const [module, setModule] = useState<string>(moduleOptions[0]?.value ?? "");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const {
    items,
    totalCount,
    loading,
    isLoading,
    error,
    refetch,
    page,
    setPage,
    range,
    handleRangeChange,
    successOnly,
    handleSuccessChange,
  } = useAuditLogData(module, pageSize, userId);
  const employeeOptions =
    managerData?.items?.map((employee) => ({
      label:
        `${employee.firstName} ${employee.middleName ?? ""} ${employee.lastName ?? ""}`
          .replace(/\s+/g, " ")
          .trim(),
      value: employee.user_Id,
    })) ?? [];

  useEffect(() => {
    if (!userId && employeeOptions.length > 0) {
      setUserId(employeeOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeOptions.length]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          message="You do not have permission to view audit logs."
          showIcon
        />
      </div>
    );
  }

  const handleModuleChange = (value: string) => {
    setModule(value);
    setPage(1);
  };

  return (
    <PageContainer
      title="Audit Log"
      subtitle="Track user actions across modules"
      pagination={{
        total: totalCount,
        current: page,
        pageSize,
        onChange: (nextPage, nextPageSize) => {
          setPage(nextPageSize === pageSize ? nextPage : 1);
          setPageSize(nextPageSize);
        },
      }}
    >
      <div style={{ padding: "8px 28px" }} className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">User</span>

          <Select
            showSearch
            allowClear
            value={userId || undefined}
            placeholder="Select employee"
            options={employeeOptions}
            style={{ width: 220 }}
            loading={managerLoading || managerFetching}
            onChange={(value) => {
              setUserId(value ?? "");
              setPage(1);
            }}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Module</span>
          <Select
            value={module}
            onChange={handleModuleChange}
            options={moduleOptions}
            showSearch
            placeholder="Select module"
            style={{ width: 220 }}
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Date range</span>
          <RangePicker
            format="YYYY-MM-DD"
            value={range}
            onChange={handleRangeChange}
            allowClear
            style={{ width: 240, fontSize: 12 }}
          />
        </label>

        <Switch
          checked={successOnly}
          onChange={handleSuccessChange}
          checkedChildren="Success"
          unCheckedChildren="Failed"
        />
      </div>
      <DataTableWrapper showSearch={false} pagination={null}>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!items.length}
          onRetry={refetch}
          emptyMessage="No audit entries found."
        >
          <style>{`
              .audit-log-table .ant-table-tbody > tr > td {
                font-size: 11px;
              }
            `}</style>
          <AppTable
            rowKey="auditId"
            columns={auditLogColumns}
            dataSource={items}
            loading={loading}
            className="audit-log-table"
            scroll={{ x: 800 }}
          />
        </ApiStateWrapper>
      </DataTableWrapper>
    </PageContainer>
  );
}
