import { useCreateMutation, useUpdateMutation } from '../services/vehicleStatusApi';
import { useApiMutation } from '../../../shared/hooks/useApiMutation';

interface Options {
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
}

export const useVehicleStatusMutations = ({
    onCreateSuccess,
    onUpdateSuccess,
}: Options = {}) => {
    const { mutate: createVS, isLoading: isCreating, error: createError } = useApiMutation(useCreateMutation,
        { successMessage: 'Vehicle status created successfully', onSuccess: onCreateSuccess }
    );

    const { mutate: updateVS, isLoading: isUpdating, error: updateError } = useApiMutation(useUpdateMutation,
        { successMessage: 'Vehicle status updated successfully', onSuccess: onUpdateSuccess }
    );

    return {
        createVS,
        updateVS,
        isCreating,
        isUpdating,
        createError,
        updateError,
    };
};