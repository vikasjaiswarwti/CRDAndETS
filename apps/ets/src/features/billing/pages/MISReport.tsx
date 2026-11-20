import React, { useState, useCallback } from "react";
import { Tabs, Card, Space, Table } from "antd";
import { useBillingReportMutations } from "../hooks/useBillingReportMutations";
import dayjs, { Dayjs } from "dayjs";
import { useLookups } from "../../lookups/index";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import FilterField from "../components/FilterField";
import { useReportTable } from "../hooks/useReportTable";
import { useReportExport } from "../../report-analytics/hooks/useReportExport";
import { useGetBillingCycleQuery } from "../services/billingApi"; // ← add

const C = {
  white: "#fff",
  border: "#f0f0f0",
  borderLight: "#f5f5f5",
  gray400: "#8c8c8c",
  gray700: "#262626",
};

// Tabs that use date-range filters vs billing-cycle filter
// const DATE_RANGE_TABS = ["billing-details", "billing-summary"];
const BILLING_CYCLE_TABS = ["penalty-report"];

const MISReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("billing-details");
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);
  const { Select, DatePicker, Button, Empty } = useUILibrary();
  const { exportToExcel } = useReportExport();
  const { RangePicker } = DatePicker as any;
  const { locationOptions } = useLookups({ only: ["locationOptions"] });

  // ── Date-range filter state (billing-details / billing-summary) ──────────
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── Billing-cycle filter state (penalty-report) ──────────────────────────
  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(
    null,
  );

  // Fetch billing cycles only when office is selected AND penalty tab is active
  const { data: billingCycleOptions = [], isFetching: isFetchingCycles } =
    useGetBillingCycleQuery(selectedLocCode!, {
      skip: selectedLocCode === null || !BILLING_CYCLE_TABS.includes(activeTab),
    });

  const [hasFetched, setHasFetched] = useState(false);

  const [reportData, setReportData] = useState<{ [key: string]: any[] | null }>(
    {
      "billing-details": null,
      "billing-summary": null,
      "penalty-report": null,
    },
  );

  // ── Tab change ────────────────────────────────────────────────────────────
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setHasFetched(false); // don't show stale data from previous tab's fetch
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDateRange = useCallback(
    (_: unknown, strings: [string, string]) => {
      setFromDate(strings[0]);
      setToDate(strings[1]);
      setHasFetched(false);
    },
    [],
  );

  const handleOfficeChange = (val: number) => {
    setSelectedLocCode(val);
    setSelectedBillingId(null); // reset cycle when office changes
    setHasFetched(false);
  };

  const handleBillingCycleChange = (val: number) => {
    setSelectedBillingId(val);
    setHasFetched(false);
  };

  const rangeDayjs: [Dayjs | null, Dayjs | null] | undefined =
    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : undefined;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const {
    fetchBillingDetails,
    fetchBillingSummary,
    fetchPenaltyReport, // ← new
    isFetchingBillingDetails,
    isFetchingBillingSummary,
    isFetchingPenaltyReport, // ← new
    isFetchingTechUsageDetails,
    isFetchingTechUsageSummary,
  } = useBillingReportMutations();

  const loaders: { [key: string]: boolean } = {
    "billing-details": isFetchingBillingDetails,
    "billing-summary": isFetchingBillingSummary,
    "penalty-report": isFetchingPenaltyReport, // ← new
    "tech-details": isFetchingTechUsageDetails,
    "tech-summary": isFetchingTechUsageSummary,
  };

  const isLoading = loaders[activeTab];
  const currentTabRawData = reportData[activeTab] || [];
  const { columns, scrollX } = useReportTable(currentTabRawData);

  // ── Filters-are-ready guard ───────────────────────────────────────────────
  // Each tab type has different required fields
  const filtersAreActive = (() => {
    if (selectedLocCode === null) return false;
    if (BILLING_CYCLE_TABS.includes(activeTab)) {
      return selectedBillingId !== null;
    }
    return fromDate !== "" && toDate !== "";
  })();

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const currentData = reportData[activeTab];
    if (!currentData || currentData.length === 0) return;

    const displayNames: { [key: string]: string } = {
      "billing-details": "Billing Details Report",
      "billing-summary": "Billing Summary Report",
      "penalty-report": "Penalty Report",
    };

    const officeLabel =
      selectedLocCode !== null
        ? (locationOptions?.find(
            (o: { value: number; label: string }) =>
              o.value === selectedLocCode,
          )?.label ?? null)
        : null;

    exportToExcel(currentData, {
      displayName: displayNames[activeTab] || "MIS Report",
      officeLabel,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  }, [
    activeTab,
    reportData,
    selectedLocCode,
    locationOptions,
    fromDate,
    toDate,
    exportToExcel,
  ]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const handleFetchReport = async () => {
    if (!filtersAreActive) return;

    setHasFetched(true);

    try {
      let data: any;

      if (activeTab === "billing-details") {
        data = await fetchBillingDetails({
          LocCode: selectedLocCode!,
          fromDate,
          toDate,
        });
      } else if (activeTab === "billing-summary") {
        data = await fetchBillingSummary({
          LocCode: selectedLocCode!,
          fromDate,
          toDate,
        });
      } else if (activeTab === "penalty-report") {
        data = await fetchPenaltyReport({
          LocCode: selectedLocCode!,
          BillingID: selectedBillingId!,
        });
      }

      setReportData((prev) => ({ ...prev, [activeTab]: data }));
    } catch (err) {
      console.error(`Failed to fetch report for ${activeTab}`, err);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderTabContent = (key: string) => {
    const data = reportData[key];

    if (data && data.length > 0) {
      return (
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: `1px solid ${C.borderLight}`,
            }}
          >
            <span style={{ fontSize: 13, color: C.gray400 }}>
              <strong style={{ color: C.gray700 }}>{data.length}</strong>{" "}
              {data.length !== 1 ? "records" : "record"} found
            </span>

            <button
              onClick={handleExport}
              style={{
                height: 32,
                padding: "0 14px",
                borderRadius: 999,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.gray700,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          </div>

          <Table
            columns={columns as any[]}
            dataSource={data}
            rowKey={(row: any) => String(row.id)}
            size="small"
            loading={isLoading}
            scroll={{ x: scrollX, y: 520 }}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              showTotal: (total: number) => `${total} records`,
            }}
            style={{ fontSize: 12 }}
          />
        </div>
      );
    }

    return (
      <Empty
        style={{ padding: "32px 0" }}
        description="No data loaded for this tab. Click 'Fetch Report' to load."
      />
    );
  };

  // ── Filter panel — switches between date-range and billing-cycle ──────────
  const renderFilters = () => {
    if (BILLING_CYCLE_TABS.includes(activeTab)) {
      // Penalty report: Office + Billing Cycle
      return (
        <>
          <FilterField label="Office *">
            <Select
              showSearch
              placeholder="Select office…"
              value={selectedLocCode ?? undefined}
              onChange={handleOfficeChange}
              options={locationOptions}
              filterOption={(input: string, opt: any) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ height: 36, width: 200, background: "#F3F4F6" }}
            />
          </FilterField>

          <FilterField label="Billing Cycle *">
            <Select
              showSearch
              placeholder={
                selectedLocCode === null
                  ? "Select office first…"
                  : isFetchingCycles
                    ? "Loading…"
                    : "Select billing cycle…"
              }
              value={selectedBillingId ?? undefined}
              onChange={handleBillingCycleChange}
              options={billingCycleOptions}
              disabled={selectedLocCode === null || isFetchingCycles}
              loading={isFetchingCycles}
              filterOption={(input: string, opt: any) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ height: 36, width: 220, background: "#F3F4F6" }}
            />
          </FilterField>
        </>
      );
    }

    // Default: Office + Date Range
    return (
      <>
        <FilterField label="Office *">
          <Select
            showSearch
            placeholder="Select office…"
            value={selectedLocCode ?? undefined}
            onChange={handleOfficeChange}
            options={locationOptions}
            filterOption={(input: string, opt: any) =>
              String(opt?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ height: 36, width: 200, background: "#F3F4F6" }}
          />
        </FilterField>

        <FilterField label="Period *">
          <RangePicker
            format="YYYY-MM-DD"
            value={rangeDayjs}
            onChange={handleDateRange}
            allowClear
            style={{
              height: 36,
              width: 240,
              fontSize: 12,
              background: "#F3F4F6",
              border: `1px solid #F3F4F6`,
            }}
          />
        </FilterField>
      </>
    );
  };

  const tabConfigs = [
    { key: "billing-details", label: "Billing Details" },
    { key: "billing-summary", label: "Billing Summary" },
    { key: "penalty-report", label: "Penalty Report" },
  ];

  return (
    <div
      style={{
        width: "100%",
        padding: "12px",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabConfigs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: null,
        }))}
      />

      <Card>
        <Space
          size="small"
          align="end"
          style={{ display: "flex", flexWrap: "wrap" }}
        >
          {renderFilters()}

          <Button
            type="primary"
            onClick={handleFetchReport}
            disabled={!filtersAreActive}
            loading={isLoading}
            style={{
              height: 36,
              backgroundColor: !filtersAreActive ? "#E5E7EB" : undefined,
              color: !filtersAreActive ? "#f5f5f5" : undefined,
              borderColor: !filtersAreActive ? "#E5E7EB" : undefined,
            }}
          >
            Fetch Report
          </Button>
        </Space>
      </Card>

      {hasFetched && filtersAreActive && (
        <div style={{ marginTop: 16 }}>{renderTabContent(activeTab)}</div>
      )}
    </div>
  );
};

export default MISReport;
