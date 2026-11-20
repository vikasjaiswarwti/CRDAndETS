import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { EmployeeRegisterForm } from './Employeeregisterform';
import type { UserStage, EmployeeFormDto } from '../types/Employee.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface EmployeeRegisterModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: UserStage | null;
    onSubmit: (values: EmployeeFormDto) => Promise<void>;
    isSubmitting: boolean;
    isInternal?: boolean;
    serverErrors?: FieldError[] | null;
    officeOptions?: { label: string; value: string }[];
    departmentOptions?: { label: string; value: string }[];
    lobOptions?: { label: string; value: string }[];
    projectOptions?: { label: string; value: string }[];
    geocodeOptions?: { label: string; value: string }[];
    areaOptions?: { label: string; value: string }[];
    zoneOptions?: { label: string; value: string }[];
    showArea?: boolean;
    showZone?: boolean;
    approveEmployee?: (id: string) => void;
    rejectEmployee?: (id: string) => void;
}

export const EmployeeRegisterModal: React.FC<EmployeeRegisterModalProps> = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    isInternal = true,
    serverErrors,
    officeOptions,
    departmentOptions,
    lobOptions,
    projectOptions,
    geocodeOptions,
    areaOptions,
    zoneOptions,
    showArea,
    showZone,
    approveEmployee,
    rejectEmployee,
}) => {
    const { Modal } = useUILibrary();

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1B4332' }}>
                    {editingRecord ? 'Edit Employee' : 'Register New Employee'}
                </span>
            }
            width={1024}
            destroyOnClose
            footer={null}
            style={{ borderRadius: 16, overflow: 'hidden', top: 10 }}
        >
            <EmployeeRegisterForm
                key={editingRecord?.id ?? 'create'}
                editingRecord={editingRecord}
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
                isInternal={isInternal}
                serverErrors={serverErrors}
                officeOptions={officeOptions}
                departmentOptions={departmentOptions}
                lobOptions={lobOptions}
                projectOptions={projectOptions}
                geocodeOptions={geocodeOptions}
                areaOptions={areaOptions}
                zoneOptions={zoneOptions}
                showArea={showArea}
                showZone={showZone}
                approveEmployee={approveEmployee}
                rejectEmployee={rejectEmployee}
                isListPage={false}
            />
        </Modal>
    );
};

export default EmployeeRegisterModal;