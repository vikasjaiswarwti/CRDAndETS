import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../shared/components/RoutingHeader/RoutingHeader";
import type { RootState } from "../../../app/store/index"; // adjust to your store path
import EmployeeTripSearch from "../../dashboard/admin/components/EmployeeTripSearch";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import TimeRangeSlider from "../components/DateTimeRangeSlider";
import "../styles/style.css";
import { Divider, Empty, Modal, Table, Tag } from "antd";
import ShiftLifecycle from "../components/ShiftLifeCycle";
import ShiftTimeSelector from "../components/ShiftTimeSelector";
import { useTripLifeCycle } from "../hooks/useTripLifeCycle";
import { useLookups } from "../../lookups";
import {
  useGetTripLifeCycleDetailsQuery,
  useGetTripLifeCycleQuery,
} from "../services/progressTripApi";
import type {
  TripLifeCycleDetail,
  TripLifeCycleDetailsResponse,
  TripSummary,
} from "../types/progressTrip.types";
import AlertPills from "../components/AlertPills";
import { ReloadOutlined } from "@ant-design/icons";
import type { AlertItem } from "../components/AlertPills";

interface StatusStyle {
  label: string;
  color: string;
  backgroundColor: string;
}

const STATUS_STYLE_MAP: Record<number, StatusStyle> = {
  1: { label: "Route Created", color: "#4B5563", backgroundColor: "#F3F4F6" },
  2: {
    label: "Published Not Yet Started",
    color: "#1D4ED8",
    backgroundColor: "#DBEAFE",
  },
  3: { label: "Started", color: "#B45309", backgroundColor: "#FEF3C7" },
  4: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  5: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  6: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  7: { label: "Cancelled", color: "#B91C1C", backgroundColor: "#FEE2E2" },
  9: { label: "Cancelled", color: "#B91C1C", backgroundColor: "#FEE2E2" },
};

const TEXT_STATUS_MAP: Record<string, StatusStyle> = {
  Created: STATUS_STYLE_MAP[1],
  Printed: STATUS_STYLE_MAP[2],
  Started: STATUS_STYLE_MAP[3],
  Completed: STATUS_STYLE_MAP[4],
  End: STATUS_STYLE_MAP[4],
  Cancelled: STATUS_STYLE_MAP[7],
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
  label: "Unknown",
  color: "#374151",
  backgroundColor: "#F3F4F6",
};

const getKpiStatusStyle = (value: unknown): StatusStyle => {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && STATUS_STYLE_MAP[numericValue]) {
    return STATUS_STYLE_MAP[numericValue];
  }
  return TEXT_STATUS_MAP[String(value)] ?? DEFAULT_STATUS_STYLE;
};

const TripLifeCycle: React.FC = () => {
  const { businessFullName } = useSelector(
    (state: RootState) => state.business,
  );
  const { locationOptions } = useLookups({ only: ["locationOptions"] });
  const {
    locCode,
    tripType,
    pickShiftOptions,
    dropShiftOptions,
    tripTypeOptions,
    timeRange,
    requestBody,
    isShiftLoading,
    handleOfficeChange,
    handleTripTypeChange,
    handlePickShiftChange,
    handleDropShiftChange,
    handleTimeRangeChange,
  } = useTripLifeCycle();
  useEffect(() => {
    if (locationOptions.length > 0) {
      handleOfficeChange(locationOptions[0].value);
    }
  }, [locationOptions.length]);
  const {
    data: tripLifeCycleData,
    isFetching: isLoading,
    refetch,
  } = useGetTripLifeCycleQuery(requestBody!, { skip: !requestBody });
  const { data: kpis } = useGetTripLifeCycleDetailsQuery(requestBody!, {
    skip: !requestBody,
  });
  const navigate = useNavigate();
  const [selectedKpi, setSelectedKpi] = React.useState<AlertItem | null>(null);
  // console.log(isLoading, tripLifeCycleData)
  const kpiItems = useMemo(() => {
    const lifecycleKpis = kpis as TripLifeCycleDetailsResponse | undefined;
    if (!lifecycleKpis) return [];
    return [
      {
        id: "womenTravellingAlone",
        label: "Women travelling alone",
        count: lifecycleKpis.womenTravellingAlone,
        showCount: true,
      },
      {
        id: "adhocTrips",
        label: "Adhoc trips",
        count: lifecycleKpis.adhocTrips,
        showCount: true,
      },
      {
        id: "escortTrips",
        label: "Escort trips",
        count: lifecycleKpis.escortTrips,
        showCount: true,
      },
      {
        id: "delayedVehicleCompletedTrips",
        label: "Delayed Vehicles ",
        count: lifecycleKpis.delayedVehicleCompletedTrips,
        showCount: true,
      },
      {
        id: "pendingDropVerification",
        label: "Pending Drop Verification",
        count: lifecycleKpis.pendingDropVerification,
        showCount: false,
      },
    ];
  }, [kpis]);
  const selectedKpiRows = useMemo<TripLifeCycleDetail[]>(() => {
    if (!selectedKpi || !kpis) return [];

    const detailsByKpi: Record<string, TripLifeCycleDetail[]> = {
      womenTravellingAlone: kpis.womenTravellingAloneDetails,
      adhocTrips: kpis.adhocTripDetails,
      pendingDropVerification: [],
      escortTrips: kpis.escortTripDetails,
      delayedVehicleCompletedTrips: kpis.delayedVehicleCompletedTripDetails,
    };

    return detailsByKpi[selectedKpi.id] ?? [];
  }, [kpis, selectedKpi]);
  const selectedKpiColumns = useMemo(() => {
    const keys = Array.from(
      new Set(selectedKpiRows.flatMap((row) => Object.keys(row))),
    );

    return keys.map((key) => ({
      title:
        key === "TripStatusCode" ? "Trip Status" : key.replaceAll("_", " "),
      dataIndex: key,
      key,
      render: (value: unknown, row: TripLifeCycleDetail) =>
        key === "TripID" ? (
          <button
            type="button"
            onClick={() => navigate(`/routing/route-tracking?dsId=${value}`)}
            style={{
              border: 0,
              padding: 0,
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {row.TripID}
          </button>
        ) : key === "TripStatusCode" ? (
          <Tag
            color=""
            style={{
              backgroundColor: getKpiStatusStyle(value).backgroundColor,
              borderColor: getKpiStatusStyle(value).backgroundColor,
              color: getKpiStatusStyle(value).color,
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500,
              marginInlineEnd: 0,
              paddingInline: 9,
            }}
          >
            {getKpiStatusStyle(value).label}
          </Tag>
        ) : (
          (value ?? "-")
        ),
    }));
  }, [navigate, selectedKpiRows]);
  return (
    <>
      <AppHeader
        variant="ongoing"
        title="Trip Life Cycle"
        officeName={businessFullName ?? ""}
        onBack={() => history.back()}
        isLive={false}
        showLiveButton={false}
      />
      <div
        className="grid grid-cols-12 gap-5 bg-white/90"
        style={{
          padding: "12px 12px 72px",
          height: "calc(100vh - 40px)",
          overflowY: "auto",
        }}
      >
        <div className="col-span-8">
          <div className="flex items-center gap-1">
            <SearchSelect
              placeholder="Select Office"
              options={locationOptions}
              value={locCode}
              width={180}
              style={{}}
              handleChange={handleOfficeChange}
            />
            <SearchSelect
              placeholder="Select Trip Type"
              value={tripType}
              options={tripTypeOptions}
              style={{}}
              width={140}
              handleChange={handleTripTypeChange}
            />
            <Divider
              orientation="vertical"
              size="large"
              style={{
                height: "30px",
                borderColor: "#d9d9d9",
              }}
            />
            <TimeRangeSlider
              value={timeRange}
              onChange={handleTimeRangeChange}
            />
            <button
              onClick={() => refetch()}
              style={{
                fontSize: 12,
                cursor: "pointer",
                backgroundColor: "#22C55E22",
                color: "#15803D",
                width: 24,
                height: 24,
                border: "1px solid",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              <ReloadOutlined />
            </button>
          </div>
          <div>
            <ShiftTimeSelector
              pickupTimes={pickShiftOptions}
              dropTimes={dropShiftOptions}
              tripType={tripType as number}
              loading={isShiftLoading}
              onChange={(type, value, _label) => {
                if (type === "pickup") handlePickShiftChange(value);
                else handleDropShiftChange(value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <ShiftLifecycle
              stages={(tripLifeCycleData?.stages ?? []) as TripSummary[]}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <EmployeeTripSearch />
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          width: "100%",
          bottom: 4,
          zIndex: 20,
          display: "flex",
          justifyContent: "left",
          padding: "8px 12px",
          background: "rgba(255, 255, 255, 0.96)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.08)",
        }}
      >
        <AlertPills
          items={kpiItems}
          onClick={(item) => {
            if (item.id === "pendingDropVerification") {
              setSelectedKpi(null);
              navigate("/routing/security");
              return;
            }
            setSelectedKpi(item);
          }}
        />
      </div>
      <Modal
        open={!!selectedKpi}
        onCancel={() => setSelectedKpi(null)}
        footer={null}
        width={1100}
        title={
          selectedKpi
            ? `${selectedKpi.label} (${selectedKpi.count})`
            : "KPI details"
        }
        destroyOnClose
        style={{ top: 10 }}
      >
        <Table<TripLifeCycleDetail>
          className="kpi-details-table"
          columns={selectedKpiColumns}
          dataSource={selectedKpiRows}
          rowKey={(row, index) => `${row.TripID}-${row.EmpId}-${index}`}
          scroll={{ x: "max-content" }}
          pagination={undefined}
          locale={{ emptyText: <Empty description="No details found" /> }}
          size="small"
        />
      </Modal>
    </>
  );
};

export default TripLifeCycle;
