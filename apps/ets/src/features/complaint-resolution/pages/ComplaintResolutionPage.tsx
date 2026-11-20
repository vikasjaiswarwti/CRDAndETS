
import React from "react";
import { useTokens } from "../../../shared/constants/tokens";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useComplaintResolution } from "../hooks/useComplaintResolution";
import { ComplaintListPanel } from "../components/ComplaintListPanel";
import { ComplaintDetailPanel } from "../components/ComplaintDetailPanel";
import { OfficeFilterSelect } from "../components/Officefilterselect";
import { EmployeeFilterSelect } from "../components/EmployeeFilterSelect";

const SWITCH_ACTIVE = "#3E9B73";

const TAB_OPTIONS: { label: string; value: 0 | 1 }[] = [
  { label: "Unresolved", value: 0 },
  { label: "Resolved", value: 1 },
];

export const ComplaintResolutionPage: React.FC = () => {
  const { spacing } = useTokens();
  const { Typography, Row, Col } = useUILibrary();
  const { Title } = Typography;
  const isMobile = useIsMobile();

  const {
    activeTab,
    changeTab,
    officeCode,
    changeOffice,
    empId,
    changeEmployee,
    page,
    pageSize,
    changePage,
    items,
    total,
    isLoading,
    isFetching,
    error,
    refetch,
    selectedComplaint,
    openReview,
    closeReview,
  } = useComplaintResolution();

  const showPanel = Boolean(selectedComplaint);

  return (
    <div
      style={{
        // Same page shell as ApprovalDashboardPage — normal document flow
        // (minHeight, not a locked height:100vh + overflow:hidden flex
        // column), so this page scrolls like every other page in the app
        // instead of behaving like a standalone locked-viewport split pane.
        padding: isMobile
          ? `${spacing.md}px ${spacing.sm}px`
          : `${spacing.lg}px ${spacing.xl}px`,
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      {/* Header — same shape as ApprovalDashboardPage:
          Row(space-between) > Col(title + switcher, wraps) / Col(filters). */}
      <Row
        justify="space-between"
        align={isMobile ? "start" : "middle"}
        style={{
          marginBottom: spacing.lg,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? spacing.sm : 0,
        }}
      >
        <Col
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.md,
            flexWrap: isMobile ? undefined : "wrap",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Complaint Resolution
          </Title>

          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              borderRadius: 16,
              padding: 5,
              gap: 2,
              width: isMobile ? "100%" : "auto",
            }}
          >
            {TAB_OPTIONS.map((opt) => {
              const isActive = activeTab === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => changeTab(opt.value)}
                  style={{
                    flex: isMobile ? 1 : undefined,
                    padding: "4px 14px",
                    borderRadius: 16,
                    border: "none",
                    background: isActive ? SWITCH_ACTIVE : "transparent",
                    color: isActive ? "#fff" : "#6b7280",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Col>

        <Col
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: spacing.sm,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <OfficeFilterSelect value={officeCode} onChange={changeOffice} />
          <EmployeeFilterSelect value={empId} onChange={changeEmployee} />
        </Col>
      </Row>
      <Row gutter={spacing.lg} align="top">
        <Col xs={24} lg={showPanel ? 15 : 24}>
          <ComplaintListPanel
            items={items}
            total={total}
            page={page}
            pageSize={pageSize}
            onChangePage={changePage}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={refetch}
            selectedReference={selectedComplaint?.referenceNo ?? null}
            onReview={openReview}
            emptyMessage={
              officeCode == null
                ? "Select an office to view complaints"
                : "No complaints found"
            }
          />
        </Col>

        {showPanel && selectedComplaint && (
          <Col xs={24} lg={9}>
            <ComplaintDetailPanel
              complaint={selectedComplaint}
              onClose={closeReview}
              onDataChanged={refetch}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ComplaintResolutionPage;
