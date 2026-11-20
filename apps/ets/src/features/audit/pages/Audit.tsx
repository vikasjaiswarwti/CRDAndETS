import { useState } from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { selectRoles } from "../../navigation/slices/navigationSlice";
import { useSelector } from "react-redux";
import { auditLabel } from "../constants/auditConstant";
import {
  DEFAULT_PAGE_SIZE,
  auditLogColumns,
  useAuditLogData,
} from "../components/auditLogShared";
// import { useGetCurrentUserQuery } from "../../auth/services/authApi";

function AuditLogModal({
  modules,
  onClose,
  pageSize,
}: {
  modules: string[];
  onClose: () => void;
  pageSize: number;
}) {

  // const { data: currentUser } = useGetCurrentUserQuery();
  const { Modal, Pagination, Alert, DatePicker, Switch } = useUILibrary();
  const { RangePicker } = DatePicker as any;
  const [module, setModule] = useState<string>(modules[0]);
  const hasMultipleModules = modules.length > 1;
  const {
    items,
    totalCount,
    loading,
    error,
    page,
    setPage,
    range,
    handleRangeChange,
    successOnly,
    handleSuccessChange,
  } = useAuditLogData(module, pageSize);

  return (
    <Modal
      open
      centered
      width="min(1200px, 96vw)"
      styles={{
        body: { maxHeight: "calc(90vh - 150px)", overflowY: "auto" },
      }}
      title={
        <div className="flex flex-wrap items-center gap-3 pr-8">
          <span>{`Audit log`}</span>
          {hasMultipleModules && (
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: 2,
                gap: 2,
              }}
            >
              {modules.map((moduleKey) => {
                const isActive = module === moduleKey;
                return (
                  <button
                    key={moduleKey}
                    type="button"
                    onClick={() => {
                      setModule(moduleKey);
                      setPage(1);
                    }}
                    style={{
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      background: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#fff" : "#475569",
                    }}
                  >
                    {auditLabel[moduleKey] ?? moduleKey}
                  </button>
                );
              })}
            </div>
          )}
          <RangePicker
            format="YYYY-MM-DD"
            value={range}
            onChange={handleRangeChange}
            allowClear
            size="small"
            style={{ width: 240, fontSize: 12, fontWeight: 400 }}
          />
          <Switch
            checked={successOnly}
            onChange={handleSuccessChange}
            checkedChildren="Success"
            unCheckedChildren="Failed"
          />
        </div>
      }
      onCancel={onClose}
      maskClosable
      destroyOnClose
      footer={
        <Pagination
          current={page}
          pageSize={pageSize}
          total={totalCount}
          onChange={(nextPage) => setPage(nextPage)}
          showSizeChanger={false}
          showTotal={(total) => `${total.toLocaleString()} total entries`}
        />
      }
    >
      {error ? (
        <Alert
          type="error"
          message="Failed to load audit logs. Please try again."
          showIcon
        />
      ) : (
        <>
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
            emptyText="No audit entries found"
            className="audit-log-table"
            scroll={{ x: 800 }}
          />
        </>
      )}
    </Modal>
  );
}

export default function AuditLogButton({
  module,
  modules,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  module: string;
  modules?: string[];
  pageSize?: number;
}) {
  const roles = useSelector(selectRoles);
  const isAdmin = roles.includes("admin");
  const [open, setOpen] = useState(false);
  const { Tooltip } = useUILibrary();

  if (!isAdmin) return null;

  return (
    <>
      <Tooltip title="View audit logs" placement="left">
        <button
          onClick={() => setOpen(true)}
          aria-label="View audit logs"
          className=" shadow-sm transition hover:bg-slate-50 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h16v4H4V4zm0 6h16v10H4V10zm4 3h8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Tooltip>

      {open && (
        <AuditLogModal
          modules={modules && modules.length > 0 ? modules : [module]}
          onClose={() => setOpen(false)}
          pageSize={pageSize}
        />
      )}
    </>
  );
}
