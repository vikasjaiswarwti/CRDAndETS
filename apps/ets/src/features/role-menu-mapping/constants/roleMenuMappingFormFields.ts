// src/features/role-menu-mapping/constants/roleMenuMappingFormFields.ts
//
// Dynamic options — roleId and menuId selects depend on fetched data.
// Export a function, NOT a static array.

import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

interface RoleMenuMappingFormFieldOptions {
    roleOptions: { label: string; value: string }[];
    menuOptions: { label: string; value: string }[];
}

export const getRoleMenuMappingFormFields = ({
    roleOptions,
    menuOptions,
}: RoleMenuMappingFormFieldOptions): FormFieldDef[] => [
    {
        name: 'roleId',
        label: 'Role',
        type: 'select',
        required: true,
        placeholder: 'Select a role',
        options: roleOptions,
        span: 12,
    },
    {
        name: 'menuId',
        label: 'Menu',
        type: 'select',
        required: true,
        placeholder: 'Select a menu',
        options: menuOptions,
        span: 12,
    },
    {
        name: 'isActive',
        label: 'Availability Status',
        type: 'switch',
        required: false,
        fieldProps: {
            checkedChildren: 'Active',
            unCheckedChildren: 'Inactive',
        },
        span: 12,
    },
];