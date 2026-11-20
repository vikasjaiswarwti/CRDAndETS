// src/features/role-menu-mapping/hooks/useRoleMenuMappingMutations.ts

import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
    useCreateRoleMenuMappingMutation,
    useUpdateRoleMenuMappingMutation,
} from '../services/roleMenuMappingApi';

interface UseRoleMenuMappingMutationsOptions {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
}

export const useRoleMenuMappingMutations = ({
    onCreateSuccess,
    onUpdateSuccess,
}: UseRoleMenuMappingMutationsOptions = {}) => {
    const {
        mutate: createX,
        isLoading: isCreating,
        error: createError,
    } = useApiMutation(useCreateRoleMenuMappingMutation, {
        successMessage: 'Role-Menu mapping created successfully',
        onSuccess: onCreateSuccess,
    });

    const {
        mutate: updateX,
        isLoading: isUpdating,
        error: updateError,
    } = useApiMutation(useUpdateRoleMenuMappingMutation, {
        successMessage: 'Role-Menu mapping updated successfully',
        onSuccess: onUpdateSuccess,
    });

    return { createX, updateX, isCreating, isUpdating, createError, updateError };
};