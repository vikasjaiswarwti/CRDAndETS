import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { Menu } from '../types/menu.types';
import type { CreateMenuDto, UpdateMenuDto } from '../types/menu.types';
import { getMenuFormFields } from '../constants/menuFormFields';

// // ── Save icon SVG (inline so no external dep) ───────────────────────────────
// const SaveIcon = () => (
//     <svg
//         width="14"
//         height="14"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2.5"
//         style={{ verticalAlign: 'middle' }}
//     >
//         <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
//         <polyline points="17 21 17 13 7 13 7 21" />
//         <polyline points="7 3 7 8 15 8" />
//     </svg>
// );

// // ── Plus icon ────────────────────────────────────────────────────────────────
// const PlusIcon = () => (
//     <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
// );

interface MenuFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: Menu | null;
    onSubmit: (values: CreateMenuDto | UpdateMenuDto) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
    parentMenuOptions: { label: string; value: string }[];
}

export const MenuFormModal = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
    parentMenuOptions,
}: MenuFormModalProps) => {

    const { Modal } = useUILibrary();

    const fields = getMenuFormFields({ parentMenuOptions });


    const initialValues = editingRecord
        ? {
            ...editingRecord,
            menuName: editingRecord.menuName,
            id: editingRecord.id,
            parentMenuId: editingRecord.parentMenuId ?? '',
            orderNo: editingRecord.orderNo,
            isActive: editingRecord.isActive,
        }
        : {
            menuName: '',
            parentMenuId: '',
            routeUrl: '',
            orderNo: 1,
            icon: '',
            isActive: true,
        };

    console.log('editingRecord', editingRecord);


    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1B4332' }}>
                    {editingRecord ? 'Configuration Details' : 'Add New Menu'}
                </span>
            }
            width={580}
            destroyOnClose
            footer={null}
        // ── Greenish overlay — NOT the default grey ──────────────────────────
        >
            {/*
        AppForm renders the two-column grid of fields.
        The switch field ("isActive") has label "Availability Status"
        + description "Toggle whether this menu is visible in the frontend"
        — this is configured in menuFormFields via the `extra` prop.
      */}
            <AppForm
                fields={fields}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Add Menu'}
                showCancel={false}
                columns={2}
                resetOnSuccess
            />
        </Modal>
    );
};

export default MenuFormModal;