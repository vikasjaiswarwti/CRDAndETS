import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";
import type { FieldError } from "../../../shared/types/api-error.types";
import { ADDRESS_CHANGES_FORM_FIELDS } from "../constants/addressChangesFormFields";
import type { AddressChange } from "../types/addressChanges.types";
// import { EmployeeRegisterForm } from "../../employee";

interface AddressChangesFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: AddressChange | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const AddressChangesFormModal = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}: AddressChangesFormModalProps) => {
  const { Modal } = useUILibrary();

  const initialValues = editingRecord
    ? {
        ...editingRecord,
        address: editingRecord.address ?? "",
        state: editingRecord.state ?? "",
        mobileNo: editingRecord.mobileNo ?? "",
        emerContactNo: editingRecord.emerContactNo ?? "",
        remarks: editingRecord.remarks ?? "",
        nodal_Pick: editingRecord.nodal_Pick ?? "",
        nodal_Drop: editingRecord.nodal_Drop ?? "",
        effectivedate: editingRecord.effectivedate ?? "",
        rejection_Remark: editingRecord.rejection_Remark ?? "",
      }
    : {
        empID: "",
        city: "",
        address: "",
        pin: "",
        state: "",
        stateCode: "",
        mobileNo: "",
        emerContactNo: "",
        nodal_Pick: "",
        nodal_Drop: "",
        effectivedate: "",
        remarks: "",
      };

  const fields: FormFieldDef[] = ADDRESS_CHANGES_FORM_FIELDS;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? "Edit Address Change" : "Add Address Change"}
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
    {/* <EmployeeRegisterForm /> */}
      <AppForm
        fields={fields}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? "Save Changes" : "Create Address Change"}
        showCancel
        columns={2}
        resetOnSuccess
      />
    </Modal>
  );
};

export default AddressChangesFormModal;

// {
//           "profileUpdate_Id": "d18d3eff-ec68-48c6-9402-3913996134c7",
//           "id": 1,
//           "empID": 271,
//           "locCode": 183,
//           "locationName": "Western Union Services India Pvt Limited",
//           "city": "Gurugram",
//           "pin": "122001",
//           "state": "Banglore",
//           "stateCode": 2,
//           "mobileNo": null,
//           "emerContactNo": "8888888888",
//           "geocodeID": 1,
//           "emp_Lat": 18.44,
//           "emp_Lng": 73.89,
//           "remarks": "change request",
//           "address": "159, part A, sector 10, gurugram",
//           "actionType": "CREATE",
//           "nodal_Pick": 45858,
//           "nodal_Drop": 45858,
//           "updatE_DATE": null,
//           "effectivedate": "2026-04-05T00:00:00",
//           "rejection_Remark": null,
//           "createdBy": "guarav",
//           "createdOn": "2026-05-01T04:51:20.1507215",
//           "modBy": "",
//           "modOn": null
//       }
