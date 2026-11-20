import React, { useEffect, useMemo, useRef, useState } from "react";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";

import {
  useGetAvailableVehicleQuery,
  useGetAvailableDriverQuery,
  useGetMstShiftQuery,
  useLazyGetVendorTripQuery,
} from "../services/vendorTripApi";
import { useVendorTripTable } from "../hooks/useVendorTripTable";
import { useVendorTripModal } from "../hooks/useVendorTripModal";
import { TRIP_TYPE_OPTIONS } from "../constants/vendorTripConstants";

import { useLookups } from "../../lookups";
import SearchSelect from "../../../shared/components/Search/SearchSelect";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";
// import SearchDatePicker from "../../../shared/components/Search/SearchDatePicker";
import dayjs from "dayjs";
import AssignVehicleDriverTrip from "../components/AssignVehicleDriverTrip";
import type { VendorTripListParams } from "../types/vendorTrip.types";
import { useVendorTripMutations } from "../hooks/useVendorTripMutations";
import TripStatsDashboard from "../components/TripStatsDashboard";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import SearchRangePicker from "../../../shared/components/Search/SearchRangePicker";

const VendorTripListPage: React.FC = () => {
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  // const { DatePicker } = useUILibrary();
  const { isOpen, openEdit, editingRecord, close } = useVendorTripModal();
  const [lastParams, setLastParams] = useState<VendorTripListParams | null>(
    null,
  );

  const {
    columns,
    tableState,
    setTableState,
    // handleFromDateChange,
    handleLocCodeChange,
    handleShiftIdChange,
    // handleToDateChange,
    handleDateRangeChange,
    handleTripTypeChange,
    handleShiftOptionsReady,
    queryArgs,
  } = useVendorTripTable({ onEdit: openEdit, locationOptions });

  // Fetch shifts based on selected location
  const { data: shiftOptions } = useGetMstShiftQuery(
    { locCode: queryArgs?.locCode as number },
    { skip: !queryArgs?.locCode },
  );

  const [getVendorTrip, result] = useLazyGetVendorTripQuery();
  const { data, isLoading, error } = result;

  // Shift dropdown options (filtered by Trip Type)
  const shiftDropdownOptions = useMemo(() => {
    const shiftsData = shiftOptions?.[0]; // ✅ correct after transformResponse
    if (!shiftsData || !queryArgs?.tripType) return [];

    const pickShifts = JSON.parse(shiftsData.pickShifts || "[]");
    const dropShifts = JSON.parse(shiftsData.dropShifts || "[]");

    const shifts =
      Number(queryArgs.tripType) === 1
        ? pickShifts
        : Number(queryArgs.tripType) === 2
          ? dropShifts
          : [];

    return shifts
      .filter((shift: any) => shift.ShiftTime !== "NA" && shift.Shiftid !== 0) // ✅ exclude NA
      .map((shift: any) => ({
        label: shift.ShiftTime,
        value: shift.Shiftid,
      }));
  }, [shiftOptions, queryArgs?.tripType]);

  // ✅ Auto-select first shift whenever shift options change (new loc or trip type)
  const prevShiftKey = useRef<string>("");
  useEffect(() => {
    const key = shiftDropdownOptions?.map((o: any) => o.value).join(",");
    if (key && key !== prevShiftKey.current) {
      prevShiftKey.current = key;
      handleShiftOptionsReady(shiftDropdownOptions);
    }
  }, [shiftDropdownOptions, handleShiftOptionsReady]);

  // ✅ Auto-fire query once locCode + shiftId + tripType are all set
  // ✅ Replace the auto-fire useEffect with this
  const queryKey = JSON.stringify({
    locCode: queryArgs?.locCode,
    shiftId: queryArgs?.shiftId,
    tripType: queryArgs?.tripType,
    fromDate: queryArgs?.fromDate,
    toDate: queryArgs?.toDate,
    page: queryArgs?.page,
    pageSize: queryArgs?.pageSize,
  });
  useEffect(() => {
    if (!queryArgs?.locCode || !queryArgs?.shiftId || !queryArgs?.tripType)
      return;

    const params: VendorTripListParams = {
      fromDate: (queryArgs.fromDate as string) ?? "",
      toDate: (queryArgs.toDate as string) ?? "",
      shiftId: queryArgs.shiftId as number,
      tripType: queryArgs.tripType as number,
      locCode: queryArgs.locCode as number,
      page: queryArgs.page,
      pageSize: queryArgs.pageSize,
    };

    getVendorTrip(params);
    setLastParams(params);
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableVehicleDsId = editingRecord?.dsId ?? 0;

  const { data: vehicleDetails } = useGetAvailableVehicleQuery(
    { dsId: availableVehicleDsId },
    { skip: !editingRecord?.dsId },
  );
  const { data: driverDetails } = useGetAvailableDriverQuery(
    { dsId: availableVehicleDsId },
    { skip: !editingRecord?.dsId },
  );

  const { updateVendorTrip, isUpdating, updateError } = useVendorTripMutations({
    onUpdateSuccess: () => close(),
  });

  const handleSubmit = async (values: Record<string, unknown>) => {
    updateVendorTrip({
      dsId: editingRecord?.dsId ?? 0,
      driverId: values.driverId as number,
      vehicleId: values.vehicleId as number,
    });
  };

  const handleRefresh = () => {
    if (lastParams) {
      getVendorTrip(lastParams);
    }
  };

  return (
    <>
      {isOpen && (
        <AssignVehicleDriverTrip
          open={isOpen}
          onClose={close}
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          serverErrors={updateError}
          vehicleOptions={vehicleDetails ?? []}
          driverOptions={driverDetails ?? []}
        />
      )}
      <PageContainer
        title="Vendor Trip Management"
        createButtonLabel="Create Trip"
        pagination={
          data?.totalTrips
            ? {
                total: data.totalTrips,
                current: tableState.page,
                pageSize: tableState.pageSize,
                onChange: (page: number, pageSize: number) =>
                  setTableState((prev) => ({ ...prev, page, pageSize })),
              }
            : undefined
        }
      >
        <DataTableWrapper
          searchPlaceholder="Search by driver or vehicle"
          pagination={null}
        >
          <SearchFilterWrapper>
            <div className="flex items-end gap-2 flex-wrap">
              <SearchSelect
                placeholder="Select Office"
                options={locationOptions}
                handleChange={handleLocCodeChange}
                value={queryArgs?.locCode as number}
                labelHide={true}
                width={200}
              />
              <SearchSelect
                placeholder="Select Trip Type"
                options={TRIP_TYPE_OPTIONS}
                handleChange={handleTripTypeChange}
                value={queryArgs?.tripType as number}
                labelHide={true}
                width={140}
              />
              <SearchSelect
                placeholder="Select Shift"
                options={shiftDropdownOptions}
                handleChange={handleShiftIdChange}
                value={queryArgs?.shiftId as number}
                labelHide={true}
                width={140}
              />
              <SearchRangePicker
                placeholder={["From Date", "To Date"]}
                value={[
                  queryArgs?.fromDate
                    ? dayjs(String(queryArgs.fromDate))
                    : null,
                  queryArgs?.toDate ? dayjs(String(queryArgs.toDate)) : null,
                ]}
                handleChange={handleDateRangeChange}
                labelHide={true}
                disabledDate={(current) =>
                  current && current.isBefore(dayjs().startOf("day"))
                }
              />

              {/* <RangePicker
                value={[
                  queryArgs?.fromDate
                    ? dayjs(String(queryArgs.fromDate))
                    : null,
                  queryArgs?.toDate ? dayjs(String(queryArgs.toDate)) : null,
                ]}
                onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
                  handleDateRangeChange(
                    dates?.[0]?.format("YYYY-MM-DD") ?? "",
                    dates?.[1]?.format("YYYY-MM-DD") ?? "",
                  );
                }}
                format="DD-MM-YYYY"
                allowClear
                style={{
                  borderRadius: 12,
                  fontSize: 13,
                  backgroundColor: "#f8f9fa",
                  border: "1.2px solid #777",
                }}
              /> */}
              {/* <SearchDatePicker
                placeholder="From Date"
                handleChange={handleFromDateChange}
                labelHide={true}
                defaultValue={
                  queryArgs?.fromDate
                    ? dayjs(String(queryArgs.fromDate))
                    : undefined
                }
              />
              <SearchDatePicker
                placeholder="To Date"
                handleChange={handleToDateChange}
                labelHide={true}
                defaultValue={
                  queryArgs?.toDate
                    ? dayjs(String(queryArgs.toDate))
                    : undefined
                }
              /> */}
            </div>
          </SearchFilterWrapper>
          <TripStatsDashboard data={data} />
          <ApiStateWrapper
            isLoading={isLoading}
            error={error}
            isEmpty={!data?.trips.length}
            onRetry={handleRefresh}
            emptyMessage="Please select the correct filters to view vendor trips."
          >
            <AppTable
              loading={isLoading}
              columns={columns}
              dataSource={data?.trips ?? []}
              rowKey="dsId"
              total={data?.totalTrips ?? 0}
              tableState={tableState}
              onTableChange={setTableState}
            />
          </ApiStateWrapper>
        </DataTableWrapper>
      </PageContainer>
    </>
  );
};

export default VendorTripListPage;
