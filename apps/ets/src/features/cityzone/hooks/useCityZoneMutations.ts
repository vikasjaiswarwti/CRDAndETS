// FILE 7 — hooks/useCityZoneMutations.ts

import {
  useCreateCityZoneMutation,
  useUpdateCityZoneMutation,
} from "../services/cityZoneApi";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseCityZoneMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useCityZoneMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: UseCityZoneMutationsOptions = {}) => {
  const createCityZone = useApiMutation(useCreateCityZoneMutation, {
    successMessage: "City Zone created successfully.",
    onSuccess: onCreateSuccess,
  });

  const updateCityZone = useApiMutation(useUpdateCityZoneMutation, {
    successMessage: "City Zone updated successfully.",
    onSuccess: onUpdateSuccess,
  });

  return {
    createCityZone: createCityZone.mutate,
    updateCityZone: updateCityZone.mutate,
    isCreating: createCityZone.isLoading,
    isUpdating: updateCityZone.isLoading,
    createError: createCityZone.error,
    updateError: updateCityZone.error,
  };
};
