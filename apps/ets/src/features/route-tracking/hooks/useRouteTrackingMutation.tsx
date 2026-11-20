import {
  useStartTripMutation,
  useEndTripMutation,
  useMarkNoShowMutation,
  useSignInMutation,
  useSignOutMutation,
  useCabReachedStopMutation,
} from "../services/routeTrackingApi";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

interface UseRouteTrackingMutationOptions {
  onEndSuccess?: () => void;
  onStartSuccess?: () => void;
  onMarkNoShowSuccess?: () => void;
  onSignInSuccess?: () => void;
  onSignOutSuccess?: () => void;
  onCabReachedStopSuccess?: () => void;
}

export const useRouteTrackingMutation = ({
  onEndSuccess,
  onStartSuccess,
  onMarkNoShowSuccess,
  onSignInSuccess,
  onSignOutSuccess,
  onCabReachedStopSuccess,
}: UseRouteTrackingMutationOptions = {}) => {
  const {
    mutate: endTrip,
    isLoading: isEndTripLoading,
    error: endTripError,
  } = useApiMutation(useEndTripMutation, {
    successMessage: "Trip close successfully",
    onSuccess: onEndSuccess,
  });
  const {
    mutate: startTrip,
    isLoading: isStartTripLoading,
    error: startTripError,
  } = useApiMutation(useStartTripMutation, {
    successMessage: "Trip Started successfully",
    onSuccess: onStartSuccess,
  });
  const {
    mutate: markNoShowEmployee,
    isLoading: isMarkNoShowLoading,
    error: markNoShowError,
  } = useApiMutation(useMarkNoShowMutation, {
    successMessage: "Employee mark no show successfully",
    onSuccess: onMarkNoShowSuccess,
  });
  const {
    mutate: signOutEmployee,
    isLoading: isSignOutEmployeeLoading,
    error: signOutEmployeeError,
  } = useApiMutation(useSignOutMutation, {
    successMessage: "Employee mark Deboarded successfully",
    onSuccess: onSignOutSuccess,
  });
  const {
    mutate: signInEmployee,
    isLoading: isSignInEmployeeLoading,
    error: signInEmployeeError,
  } = useApiMutation(useSignInMutation, {
    successMessage: "Employee mark Boarded successfully",
    onSuccess: onSignInSuccess,
  });
  const {
    mutate: cabReachedStop,
    isLoading: isCabReachedStopLoading,
    error: cabReachedStopError,
  } = useApiMutation(useCabReachedStopMutation, {
    successMessage: "Stop reach marked successfully",
    onSuccess: onCabReachedStopSuccess,
  });

  return {
    endTrip,
    isEndTripLoading,
    endTripError,
    markNoShowEmployee,
    isMarkNoShowLoading,
    markNoShowError,
    // ---------
    signOutEmployee,
    isSignOutEmployeeLoading,
    signOutEmployeeError,
    signInEmployee,
    isSignInEmployeeLoading,
    signInEmployeeError,
    cabReachedStop,
    isCabReachedStopLoading,
    cabReachedStopError,
    startTrip,
    isStartTripLoading,
    startTripError,
  };
};
