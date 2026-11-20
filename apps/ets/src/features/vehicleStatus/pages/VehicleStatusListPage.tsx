import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";

import { useGetAllQuery } from "../services/vehicleStatusApi";
import { useVehicleStatusModal } from "../hooks/useVehicleStatusModal";
import { useVehicleStatusMutations } from "../hooks/useVehicleStatusMutations";
import { useVehicleStatusTable } from "../hooks/useVehicleStatusTable";
import { VehicleStatusFormModal } from "../components/VehicleStatusFormModal";
import type {
  CreateVehicleStatusDto,
  UpdateVehicleStatusDto,
} from "../types/vehicleStatus.types";
import { VEHICLE_STATUS_CONFIG } from "../config";

const VehicleStatusListPage = () => {
  // 1. UI library
  const {} = useUILibrary();

  // 2. Modal state
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useVehicleStatusModal();

  // 3. Mutations
  const {
    createVS,
    updateVS,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useVehicleStatusMutations({
    onCreateSuccess: close,
    onUpdateSuccess: close,
  });

  // 4. Table columns (pass openEdit as callback)
  const { columns } = useVehicleStatusTable({ onEdit: openEdit });

  // 5. Data fetch — no params needed (plain list endpoint)
  const { data, isLoading, error, refetch } = useGetAllQuery();

  // 6. Derived values
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 7. Submit handler
  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingRecord) {
      await updateVS({
        ...(values as unknown as UpdateVehicleStatusDto),
        vehicleStatus_Id: editingRecord.vehicleStatus_Id,
      });
    } else {
      await createVS(values as unknown as CreateVehicleStatusDto);
    }
  };

  return (
    <PageContainer
      title="Vehicle Status Management"
      subtitle="Manage the status labels assigned to vehicles"
      createButtonLabel="Add Vehicle Status"
      canCreate={VEHICLE_STATUS_CONFIG.canCreate}
      onCreateClick={openCreate}
    >
      <DataTableWrapper showSearch={false} pagination={null}>
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No vehicle statuses found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="vehicleStatus_Id"
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <VehicleStatusFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
};

export default VehicleStatusListPage;
