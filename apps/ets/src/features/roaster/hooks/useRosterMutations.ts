// src/features/roster/hooks/useRosterMutations.ts
import { useCallback } from "react";
import {
  useUpdateSchedulesMutation,
  useCancelScheduleMutation,
} from "../services/RosterApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

interface UseRosterMutationsOptions {
  onCreateSuccess?: () => void;
  onCancelSuccess?: () => void;
  onCancelProgress?: (done: number, total: number) => void; // ← NEW
}

// Checks the response for errorCode: 1 (API-level error despite HTTP 200)
function hasApiError(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  // Shape: { result: [{ errorCode, dB_Response }], isSuccess, message }
  const results = Array.isArray(d.result) ? d.result : [];
  for (const r of results) {
    if (r && typeof r === "object") {
      const row = r as Record<string, unknown>;
      if (Number(row.errorCode) === 1) {
        return typeof row.dB_Response === "string"
          ? row.dB_Response
          : "Operation failed.";
      }
    }
  }
  return null;
}

export const useRosterMutations = ({
  onCreateSuccess,
  onCancelSuccess,
  onCancelProgress,
}: UseRosterMutationsOptions = {}) => {
  const { message } = useUILibrary();

  const [
    updateSchedulesMutation,
    { isLoading: isCreating, error: createError },
  ] = useUpdateSchedulesMutation();

  const [
    cancelScheduleMutation,
    { isLoading: isCancelling, error: cancelError },
  ] = useCancelScheduleMutation();

  const updateSchedules = useCallback(
    async (payload: Parameters<typeof updateSchedulesMutation>[0]) => {
      try {
        const result = await updateSchedulesMutation(payload).unwrap();
        const apiErr = hasApiError(result);
        if (apiErr) {
          message.error(apiErr);
        } else {
          message.success("Roster schedule saved successfully");
          onCreateSuccess?.();
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "data" in err
            ? ((err as { data?: { message?: string } }).data?.message ??
              "Failed to save roster.")
            : "Failed to save roster.";
        message.error(msg);
      }
    },
    [updateSchedulesMutation, message, onCreateSuccess],
  );

  const cancelSchedule = useCallback(
    async (payload: Parameters<typeof cancelScheduleMutation>[0]) => {
      try {
        const result = await cancelScheduleMutation(payload).unwrap();
        const apiErr = hasApiError(result);
        if (apiErr) {
          message.error(apiErr);
        } else {
          message.success("Schedule cancelled successfully");
          onCancelSuccess?.();
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "data" in err
            ? ((err as { data?: { message?: string } }).data?.message ??
              "Failed to cancel schedule.")
            : "Failed to cancel schedule.";
        message.error(msg);
      }
    },
    [cancelScheduleMutation, message, onCancelSuccess],
  );

  // NEW: bulk cancel — loops silently, fires progress callback, single toast
  const cancelScheduleBulk = useCallback(
    async (payloads: Parameters<typeof cancelScheduleMutation>[0][]) => {
      let successCount = 0;
      let failCount = 0;
      const total = payloads.length;

      for (let i = 0; i < payloads.length; i++) {
        try {
          const result = await cancelScheduleMutation(payloads[i]).unwrap();
          const apiErr = hasApiError(result);
          if (apiErr) failCount++;
          else successCount++;
        } catch {
          failCount++;
        }
        onCancelProgress?.(i + 1, total); // report progress after each
      }

      // Single final message
      if (failCount === 0) {
        message.success(
          `${successCount} roster${successCount > 1 ? "s" : ""} cancelled successfully.`,
        );
      } else {
        message.warning(
          `${successCount} cancelled, ${failCount} failed. Please retry failed items.`,
        );
      }

      onCancelSuccess?.();
    },
    [cancelScheduleMutation, message, onCancelProgress, onCancelSuccess],
  );

  return {
    updateSchedules,
    isCreating,
    createError,
    cancelSchedule,
    cancelScheduleBulk,
    isCancelling,
    cancelError,
  };
};
