// import { useDispatch } from 'react-redux';
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import DataTableWrapper from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetAllVehicleTypesQuery } from "../services/vehicletypeapi";
import { useVehicleTypeModal } from "../hooks/useVehicleTypeModal";
import { useVehicleTypeMutations } from "../hooks/useVehicleTypeMutations";
import { useVehicleTypeTable } from "../hooks/useVehicleTypeTable";
// import { toggleFilterPanel } from '../slice/vhicleTypeSlice';
import VehicleTypeFormModal from "../component/Vehicletypeformmodal";
import type {
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
} from "../types/vehicType.types";
import { useLookups } from "../../lookups";

import { VEHICLE_TYPE_CONFIG } from "../config";

const VehicleTypeListPage = () => {
  // const dispatch = useDispatch();

  // 4. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useVehicleTypeModal();

  // 5. Mutations
  const {
    createVehicleType,
    updateVehicleType,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useVehicleTypeMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 2. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useVehicleTypeTable({ onEdit: openEdit });

  // 3. Real API call
  const { data, isLoading, error, refetch } =
    useGetAllVehicleTypesQuery(queryArgs);

  console.log("data from vehicletype", data);

  // ← Lift lookups here so handleSubmit can use them
  const { locationOptions, isLoading: isLookupsLoading } = useLookups({
    only: ["locationOptions"],
  });

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler — id always from editingRecord, never from form values
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      const payload: UpdateVehicleTypeDto = {
        vehicleType_Id: editingRecord.vehicleType_Id,
        vehicleTypeDesc: String(values.vehicleTypeDesc ?? ""),
        locCode: values.locCode != null ? Number(values.locCode) : null,
        capacity: values.capacity != null ? Number(values.capacity) : null,
        isActive: values.isActive != null ? Boolean(values.isActive) : true,
      };
      await updateVehicleType(payload);
    } else {
      const payload: CreateVehicleTypeDto = {
        vehicleTypeDesc: String(values.vehicleTypeDesc ?? ""),
        locCode: values.locCode != null ? Number(values.locCode) : null,
        capacity: values.capacity != null ? Number(values.capacity) : null,
        isActive: true,
      };
      await createVehicleType(payload);
    }
  };

  return (
    <PageContainer
      title="Vehicle Type Management"
      subtitle="Configure vehicle type categories and capacity settings"
      createButtonLabel="Create Vehicle Type"
      onCreateClick={VEHICLE_TYPE_CONFIG?.canCreate ? openCreate : undefined}
      canCreate={VEHICLE_TYPE_CONFIG.canCreate}
      // filterButtonLabel="Filter Types"
      // onFilterClick={() => dispatch(toggleFilterPanel())}
      pagination={
        data?.totalCount
          ? {
              total: data.totalCount,
              current: tableState.page,
              pageSize: tableState.pageSize,
              onChange: (page, pageSize) =>
                setTableState({ ...tableState, page, pageSize }),
            }
          : undefined
      }
    >
      <DataTableWrapper
        searchPlaceholder="Search by vehicle type"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No vehicle types found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="vehicleType_Id"
            total={data?.totalCount ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <VehicleTypeFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
        locationOptions={locationOptions}
        isLookupsLoading={isLookupsLoading}
      />
    </PageContainer>
  );
};

export default VehicleTypeListPage;
