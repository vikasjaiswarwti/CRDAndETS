import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import type { Role } from "../types/SystemRolePermission.types";
import type { FieldError } from "../../../shared/types/api-error.types";
import { ROLE_FORM_FIELDS } from "../constants/Rolepermissionformfields";

interface RoleFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: Role | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
}) => {
    const { Modal } = useUILibrary();

    const initialValues = editingRecord
        ? { ...editingRecord }
        : { roleName: "", isActive: true };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? "Edit Role" : "Add Role"}
            width={480}
            destroyOnClose
            footer={null}
            styles={{
                header: { borderBottom: "none", paddingBottom: 0 },
                mask: { background: "rgba(0, 60, 30, 0.35)" },
            }}
            style={{ borderRadius: 16 }}
        >
            <AppForm
                fields={ROLE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? "Save Changes" : "Create Role"}
                showCancel
                resetOnSuccess
            />
        </Modal>
    );
};

export default RoleFormModal;