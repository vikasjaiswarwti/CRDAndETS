import { useApiMutation } from '../../../shared/hooks/useApiMutation';
import {
    // useCreateMutation,
    // useUpdateMutation,
    useApproveRejectMutation,
    useBulkApproveRejectMutation,
} from '../services/addressChangesApi';

interface UseAddressChangesMutationsOptions {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onApproveRejectSuccess?: () => void;
    onBulkApproveRejectSuccess?: () => void;
}

export const useAddressChangesMutations = (options: UseAddressChangesMutationsOptions = {}) => {
    const { onApproveRejectSuccess, onBulkApproveRejectSuccess } = options;

    // const { mutate: createAddressChange, isLoading: isCreating, error: createError } =
    //     useApiMutation(useCreateMutation, {
    //         successMessage: 'Address change created successfully',
    //         onSuccess: onCreateSuccess,
    //     });

    // const { mutate: updateAddressChange, isLoading: isUpdating, error: updateError } =
    //     useApiMutation(useUpdateMutation, {
    //         successMessage: 'Address change updated successfully',
    //         onSuccess: onUpdateSuccess,
    //     });

    const { mutate: approveReject, isLoading: isApprovingRejecting, error: approveRejectError } =
        useApiMutation(useApproveRejectMutation, {
            successMessage: 'Action completed successfully',
            onSuccess: onApproveRejectSuccess,
        });
    const { mutate: bulkApproveReject, isLoading: isBulkApprovingRejecting, error: bulkApproveRejectError } =
        useApiMutation(useBulkApproveRejectMutation, {
            successMessage: 'All employees requests approved successfully',
            onSuccess: onBulkApproveRejectSuccess,
        });


    return {
        // createAddressChange,
        // updateAddressChange,
        approveReject,
        // isCreating,
        // isUpdating,
        isApprovingRejecting,
        // createError,
        // updateError,
        approveRejectError,
        bulkApproveReject,
        isBulkApprovingRejecting,
        bulkApproveRejectError,
    };
};