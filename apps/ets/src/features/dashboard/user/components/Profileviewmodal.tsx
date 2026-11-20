// src/features/dashboard/employee/components/ProfileViewModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Opens EmployeeReviewCard inside an Ant Design Modal.
// Pattern is identical to UpdateMobileModal — uses useUILibrary().
// No extra API call — profile data is passed in from EmployeeDashboard
// where useGetGlobalUserQuery already fetched and cached it.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useUILibrary } from '../../../../shared/lib/ui-lib/ui-library-context';
import type { GlobalUserProfile } from '../types/employeeProfile.types';
import EmployeeReviewCard from './Employeereviewcard';

interface Props {
    open: boolean;
    onClose: () => void;
    profile: GlobalUserProfile;
}

export const ProfileViewModal: React.FC<Props> = ({ open, onClose, profile }) => {
    const { Modal } = useUILibrary();

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Employee Profile"
            width={1020}
            style={{ top: 10 }}
            destroyOnClose
            footer={null}
            styles={{
                header: { borderBottom: 'none' },
                mask: { background: 'rgba(0, 60, 30, 0.35)' },
                content: { borderRadius: 16, padding: 0 },
                body: { padding: 0 },
            }}
        >
            <EmployeeReviewCard data={profile} />
        </Modal>
    );
};