import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "antd";
import dayjs from "dayjs";
import { Tag, Space } from "antd";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
import SearchDatePicker from "../../../shared/components/Search/SearchDatePicker";
import { UserOutlined } from "@ant-design/icons";
import { useLookups } from "../../lookups";
import { TRIP_TYPE_OPTIONS } from "./constants/escortConstant";
import { useEscortMutations } from "./hooks/useEscortMutations";
import { useEscortDashboardTable } from "./hooks/useEscortDashboardTable";
import type { EscortDashboardRequest } from "./types/escort.types";
import { useGetMyOfficeShiftQuery } from "./services/escortDashboardApi";

const EscortDashboard: React.FC = () => {
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  const [lastParams, setLastParams] = useState<EscortDashboardRequest | null>(
    null,
  );

  // Bundled lazy query + assign mutation; re-fetch after a successful assign
  const {
    fetchEscortDashboardReport,
    escortDashboardData,
    isFetchingEscortDashboard,
    escortDashboardError,
    updateEscortInTrip,
    isUpdatingEscort,
  } = useEscortMutations({
    onEscortUpdateSuccess: () => {
      if (lastParams) fetchEscortDashboardReport(lastParams);
    },
  });
  const escorts = escortDashboardData?.escorts ?? [];
  const trips = escortDashboardData?.trips ?? [];
  const safety = escortDashboardData?.safety;
  const {
    columns,
    queryArgs,
    tableState,
    setTableState,
    handleLocCodeChange,
    handleTripTypeChange,
    handleShiftIdChange,
    handleTripDateChange,
  } = useEscortDashboardTable({
    escorts,
    locationOptions,
    isAssigning: isUpdatingEscort,
    onAssignEscort: (TripId, EscortId) =>
      updateEscortInTrip({ TripId, EscortId }),
  });
  // Shifts filtered by selected location + trip type (same source as vendor page)
  const { data: shiftOptions } = useGetMyOfficeShiftQuery(
    {
      locCode: queryArgs.locCode ?? 0,
      tripType: queryArgs.tripType ?? 0,
      tripdate: queryArgs.tripDate ?? "",
      //  locCode, tripType, tripdate
    },
    {
      skip:
        queryArgs.locCode == null ||
        queryArgs.tripType == null ||
        queryArgs.tripDate == null,
    },
  );

  const shiftDropdownOptions = useMemo(() => {
    return shiftOptions?.map((shift: any) => ({
      label: shift.ShiftTime,
      value: shift.ShiftId,
    }));
  }, [shiftOptions]);
  useEffect(() => {
    if (!shiftOptions?.length) return;

    handleShiftIdChange(shiftOptions[0].ShiftId);
  }, [shiftOptions]);

  // All four are required before the report can fire
  // const canSearch =
  //   !!queryArgs.locCode &&
  //   !!queryArgs.tripType &&
  //   !!queryArgs.shiftId &&
  //   !!queryArgs.tripDate;

  // const handleSearch = () => {
  //   if (!canSearch) return;
  //   const params: EscortDashboardRequest = {
  //     LocCode: Number(queryArgs.locCode),
  //     TripDate: dayjs(queryArgs.tripDate).format("YYYY-MM-DD"),
  //     tripType: Number(queryArgs.tripType),
  //     ShiftId: Number(queryArgs.shiftId),
  //   };
  //   setLastParams(params);
  //   fetchEscortDashboardReport(params);
  // };
  useEffect(() => {
    if (
      !queryArgs.locCode ||
      !queryArgs.tripType ||
      !queryArgs.tripDate ||
      !queryArgs.shiftId
    ) {
      return;
    }

    const params: EscortDashboardRequest = {
      LocCode: queryArgs.locCode,
      TripDate: dayjs(queryArgs.tripDate).format("YYYY-MM-DD"),
      tripType: queryArgs.tripType,
      ShiftId: queryArgs.shiftId,
    };

    setLastParams(params);
    fetchEscortDashboardReport(params);
  }, [
    queryArgs.locCode,
    queryArgs.tripType,
    queryArgs.tripDate,
    queryArgs.shiftId,
  ]);

  const handleRefresh = () => {
    if (lastParams) fetchEscortDashboardReport(lastParams);
  };

  return (
    <PageContainer
      title="Assign Escort"
      subtitle="Assign Escort  on a particular trip"
    >
      <DataTableWrapper searchPlaceholder="Search trips" pagination={null}>
        <SearchFilterWrapper>
          <div className="flex items-end gap-2 flex-wrap">
            <SearchSelect
              placeholder="Select Office"
              options={locationOptions}
              handleChange={handleLocCodeChange}
              labelHide={true}
              value={queryArgs.locCode}
              width={200}
            />

            <SearchSelect
              placeholder="Select Trip Type"
              options={TRIP_TYPE_OPTIONS}
              value={queryArgs.tripType}
              handleChange={handleTripTypeChange}
              labelHide={true}
              width={140}
            />

            <SearchDatePicker
              placeholder="Trip Date"
              handleChange={handleTripDateChange}
              labelHide={true}
              defaultValue={
                queryArgs?.tripDate
                  ? dayjs(String(queryArgs.tripDate))
                  : undefined
              }
            />

            <SearchSelect
              placeholder="Select Shift"
              value={queryArgs.shiftId}
              options={
                shiftDropdownOptions as { label: string; value: number }[]
              }
              handleChange={handleShiftIdChange}
              labelHide={true}
              width={140}
            />
            {/*         <Button type="primary" onClick={handleSearch} disabled={!canSearch}>
              Search
            </Button> */}
          </div>
        </SearchFilterWrapper>
        {safety && (
          <div style={{ marginBottom: "10px", paddingInline: "20px" }}>
            <Space size="middle">
              <Tag
                icon={<UserOutlined />}
                color="blue"
                style={{
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "14px",
                }}
              >
                Female Travelled: <strong>{safety.FemaleTravelled ?? 0}</strong>
              </Tag>

              <Tag
                icon={<UserOutlined />}
                color="blue"
                style={{
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "14px",
                }}
              >
                Single Female Travelled:{" "}
                <strong>{safety.SingleFemaleTravelled ?? 0}</strong>
              </Tag>
            </Space>
          </div>
        )}

        <ApiStateWrapper
          // isLoading={isFetchingEscortDashboard}
          error={escortDashboardError}
          isEmpty={!trips.length}
          onRetry={handleRefresh}
          emptyMessage="Select office, trip type, shift and date to view escort trips."
        >
          <AppTable
            loading={isFetchingEscortDashboard}
            columns={columns as any[]}
            dataSource={trips}
            rowKey="TripId"
            total={trips.length}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>
    </PageContainer>
  );
};

export default EscortDashboard;
