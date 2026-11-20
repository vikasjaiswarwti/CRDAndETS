import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import {
  useCreateEventNotificationMutation,
  useUpdateEventNotificationMutation,
  useDeactivateEventNotificationMutation,
} from "../services/notificationManagementApi";

interface Options {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const useEventNotificationMutations = ({
  onCreateSuccess,
  onUpdateSuccess,
}: Options = {}) => {
  const create = useApiMutation(useCreateEventNotificationMutation, {
    successMessage: "Notification recipient created successfully",
    onSuccess: onCreateSuccess,
  });

  const update = useApiMutation(useUpdateEventNotificationMutation, {
    successMessage: "Notification recipient updated successfully",
    onSuccess: onUpdateSuccess,
  });

  const deactivate = useApiMutation(useDeactivateEventNotificationMutation, {
    successMessage: "Notification recipient deactivated",
  });

  return {
    createEventNotification: create.mutate,
    updateEventNotification: update.mutate,
    deactivateEventNotification: deactivate.mutate,
    isCreating: create.isLoading,
    isUpdating: update.isLoading,
    createError: create.error,
    updateError: update.error,
  };
};
