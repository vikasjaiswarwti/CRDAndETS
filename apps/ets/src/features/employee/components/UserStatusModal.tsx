import { Button } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { ApprovedUser } from "../types/Employee.types";

interface UserStatusModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (userId?: string, status?: boolean) => Promise<any> | void;
  loading?: boolean;
  editingRecord?: ApprovedUser | null | undefined;
  actionType?: "activate" | "deactivate";
  status?: boolean;
}

const UserStatusModal: React.FC<UserStatusModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  editingRecord,
  status = false,
  actionType,
}) => {
  const { Modal } = useUILibrary();

  const isDeactivate: boolean = actionType === "deactivate";
  // console.log("Editing Record in Modal:", editingRecord);
  let FullName = editingRecord
    ? editingRecord.firstName + " " + editingRecord.lastName
    : "this user";

  const handleActivateDeactivate = async () => {
    const response = await onConfirm(editingRecord?.user_Id, !status);
    console.log("Response from onConfirm:", response);
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={360}
      destroyOnClose
      title={isDeactivate ? "Deactivate User" : "Activate User"}
    >
      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 14, color: "#555" }}>
          Are you sure you want to{" "}
          <b>{isDeactivate ? "deactivate " : "activate "}</b>
          {FullName}?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Button onClick={onClose}>Cancel</Button>

          <Button
            type="primary"
            danger={isDeactivate}
            loading={loading}
            onClick={handleActivateDeactivate}
            style={{
              borderRadius: 20,
              background: isDeactivate ? "#cf1322" : "#1B4332",
              borderColor: isDeactivate ? "#cf1322" : "#1B4332",
            }}
          >
            {isDeactivate ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default UserStatusModal;
