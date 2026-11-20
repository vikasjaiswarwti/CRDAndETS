import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useCreateStageVehicleMutation,
  useUpdateStageVehicleMutation,
  useApproveVehicleStageMutation,
  useBulkUploadVehicleStageMutation,
  vehicleApi,
} from "../services/vehicleApi";

import { useDispatch } from "react-redux";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseVehicleMutationsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onCreateStageSuccess?: () => void;
  onUpdateStageSuccess?: () => void;
  onBulkUploadSuccess?: () => void;
  onApproveVehicleSuccess?: (...args: any[]) => void;
}

export const useVehicleMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
  onCreateStageSuccess,
  onUpdateStageSuccess,
  // onBulkUploadSuccess,
  onApproveVehicleSuccess,
}: UseVehicleMutationsOptions = {}) => {
  const dispatch = useDispatch();

  const {
    mutate: createVehicle,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(useCreateVehicleMutation, {
    successMessage: "Vehicle created successfully",
    onSuccess: onCreateSuccess,
  });

  const {
    mutate: updateVehicle,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(useUpdateVehicleMutation, {
    successMessage: "Vehicle updated successfully",
    onSuccess: onUpdateSuccess,
  });

  const {
    mutate: createStageVehicle,
    isLoading: isStageCreating,
    error: createStageError,
  } = useApiMutation(useCreateStageVehicleMutation, {
    successMessage: "Vehicle created successfully in Stage",
    onSuccess: onCreateStageSuccess,
  });

  const {
    mutate: updateStageVehicle,
    isLoading: isStageUpdating,
    error: updateStageError,
  } = useApiMutation(useUpdateStageVehicleMutation, {
    successMessage: "Vehicle updated successfully in Stage",
    onSuccess: onUpdateStageSuccess,
  });

  const {
    mutate: bulkVehicleUpload,
    isLoading: isBulkVehicleUpload,
    error: bulkVehicleUploadError,
    reset: resetBulk,
  } = useApiMutation(useBulkUploadVehicleStageMutation, {
    successMessage: "Vehicle uploaded successfully in Stage",
    // onSuccess: onBulkUploadSuccess,
    showToast: false,
    onError: (err) => {
      console.log("❌ Bulk upload error:", err);
    },
  });

  const {
    mutate: approveVehicleUpload,
    isLoading: isApproveVehicleUpload,
    error: approveVehicleUploadError,
  } = useApiMutation(useApproveVehicleStageMutation, {
    successMessage: "Vehicle approved successfully",

    onSuccess: (...args: any[]) => {
      // Parent callback
      onApproveVehicleSuccess?.(...args);

      // Refetch all vehicle queries
      dispatch(vehicleApi.util.invalidateTags(["Vehicle"]));
    },

    onError: (err) => {
      console.log("❌ Approve vehicle error:", err);
    },
  });

  return {
    createVehicle,
    updateVehicle,
    isCreating,
    isUpdating,
    createError,
    updateError,

    // ---- Stage
    createStageVehicle,
    isStageCreating,
    createStageError,

    updateStageVehicle,
    isStageUpdating,
    updateStageError,

    // ---- Bulk Upload
    bulkVehicleUpload,
    isBulkVehicleUpload,
    bulkVehicleUploadError,
    resetBulk,

    // ---- Approve
    approveVehicleUpload,
    isApproveVehicleUpload,
    approveVehicleUploadError,
  };
};