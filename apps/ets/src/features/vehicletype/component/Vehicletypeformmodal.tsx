import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import type { FieldError } from "../../../shared/types/api-error.types";
import { getVehicleTypesFormFields } from "../constants/Vehicletypeformfields";
import type { VehicleType } from "../types/vehicType.types";

interface VehicleTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: VehicleType | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  locationOptions: { label: string; value: string | number }[];
  isLookupsLoading: boolean;
}

// PURELY PRESENTATIONAL — no mutations, no API calls, no useEffect, no useForm()
const VehicleTypeFormModal = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  locationOptions,
  isLookupsLoading,
}: VehicleTypeFormModalProps) => {
  const { Modal } = useUILibrary();

  const fields = getVehicleTypesFormFields({ locationOptions });
//   console.log(editingRecord, "editingRecord");
  const initialValues = editingRecord
    ? {
        ...editingRecord,
        vehicleTypeDesc: editingRecord.vehicleTypeDesc ?? "",
        locCode: editingRecord.locCode ?? null,
        capacity: editingRecord.capacity ?? null,
        isActive: editingRecord.isActive ?? true,
      }
    : { vehicleTypeDesc: "", locCode: null, capacity: null, isActive: true };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? "Edit Vehicle Type" : "Create Vehicle Type"}
      width={580}
      destroyOnClose
      footer={null}
      style={{ top: 80 }}
    >
      <AppForm
        fields={fields}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting || isLookupsLoading}
        submitLabel={editingRecord ? "Save Changes" : "Create Vehicle Type"}
        showCancel
        columns={2}
        resetOnSuccess
      />
    </Modal>
  );
};

export default VehicleTypeFormModal;
