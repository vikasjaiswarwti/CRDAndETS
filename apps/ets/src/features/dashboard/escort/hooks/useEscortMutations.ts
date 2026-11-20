import { useApiMutation } from "../../../../shared/hooks/useApiMutation";
import {
  useUpdateEscortInTripMutation,
  useLazyGetEscortDashboardReportQuery,
} from "../services/escortDashboardApi";

interface Options {
  onEscortUpdateSuccess?: () => void;
}

export const useEscortMutations = ({
  onEscortUpdateSuccess,
}: Options = {}) => {
  const updateEscortInTrip = useApiMutation(useUpdateEscortInTripMutation, {
    successMessage: "Escort assigned successfully",
    onSuccess: onEscortUpdateSuccess,
  });

  const [
    fetchEscortDashboardReport,
    {
      data: escortDashboardData,
      isLoading: isFetchingEscortDashboard,
      error: escortDashboardError,
    },
  ] = useLazyGetEscortDashboardReportQuery();

  return {
    updateEscortInTrip: updateEscortInTrip.mutate,
    isUpdatingEscort: updateEscortInTrip.isLoading,
    escortUpdateError: updateEscortInTrip.error,

    // -----------------------------
    fetchEscortDashboardReport,
    escortDashboardData,
    isFetchingEscortDashboard,
    escortDashboardError,
  };
};