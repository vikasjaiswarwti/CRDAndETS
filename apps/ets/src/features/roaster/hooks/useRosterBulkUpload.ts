// // src/features/roster/hooks/useRosterBulkUpload.ts
// // Thin hook that wraps the rosterBulkUpload mutation and exposes
// // upload state + error logs in a shape UploadSchedulePage expects.

// import { useState, useCallback } from "react";
// import { useRosterBulkUploadMutation } from "../services/RosterApi";
// import type { BulkUploadErrorLog } from "../types/Roster.types";

// export interface UseRosterBulkUploadReturn {
//   upload: (file: File, locCode: number) => Promise<void>;
//   isUploading: boolean;
//   errorLogs: BulkUploadErrorLog[];
//   successMessage: string;
//   reset: () => void;
// }

// export function useRosterBulkUpload(): UseRosterBulkUploadReturn {
//   const [bulkUpload, { isLoading }] = useRosterBulkUploadMutation();

//   const [errorLogs, setErrorLogs] = useState<BulkUploadErrorLog[]>([]);
//   const [successMessage, setSuccessMessage] = useState("");

//   const upload = useCallback(
//     async (file: File, locCode: number) => {
//       setErrorLogs([]);
//       setSuccessMessage("");

//       try {
//         const result = await bulkUpload({ locCode, file }).unwrap();

//         if (result.errorLogs && result.errorLogs.length > 0) {
//           // Partial / full failure — surface error logs
//           setErrorLogs(result.errorLogs);
//         } else {
//           // Clean success
//           setSuccessMessage(
//             result.dB_Response || "Schedule uploaded successfully",
//           );
//         }
//       } catch (err: unknown) {
//         // Network / server error — surface as a single error log row
//         const msg =
//           (err as any)?.data?.dB_Response ||
//           (err as any)?.data?.message ||
//           (err as any)?.message ||
//           "Upload failed. Please try again.";

//         setErrorLogs([{ batchId: "–", logDetail: msg }]);
//       }
//     },
//     [bulkUpload],
//   );

//   const reset = useCallback(() => {
//     setErrorLogs([]);
//     setSuccessMessage("");
//   }, []);

//   return {
//     upload,
//     isUploading: isLoading,
//     errorLogs,
//     successMessage,
//     reset,
//   };
// }

// features/roster/hooks/useRosterBulkUpload.ts
// ─────────────────────────────────────────────────────────────────────────────
//  Wraps useRosterBulkUploadMutation (RTK Query) so the auth token flows
//  through baseQueryWithReauth automatically — no raw fetch.
//
//  API response shape (single object OR array):
//    { errorCode: number, dB_Response: string, batchId: number, errorLogs: string[] }
//
//  Returns:
//    upload(file, locCode) → Promise<{ ok: boolean }>
//    isUploading, errorLogs, successMessage, reset
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";
import { useRosterBulkUploadMutation } from "../services/RosterApi";
import type { BulkUploadErrorLog } from "../types/Roster.types";

interface RawBatchResult {
  errorCode: number;
  dB_Response: string;
  batchId: number;
  errorLogs: string[];
}

function toArray(raw: unknown): RawBatchResult[] {
  if (Array.isArray(raw)) return raw as RawBatchResult[];
  if (raw && typeof raw === "object") return [raw as RawBatchResult];
  return [];
}

function parseErrorLogs(batches: RawBatchResult[]): BulkUploadErrorLog[] {
  return batches.flatMap((batch) =>
    (batch.errorLogs ?? []).map((logDetail) => ({
      batchId: batch.batchId,
      logDetail,
    })),
  );
}

export function useRosterBulkUpload() {
  const [triggerUpload] = useRosterBulkUploadMutation();

  const [errorLogs, setErrorLogs] = useState<BulkUploadErrorLog[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const reset = useCallback(() => {
    setErrorLogs([]);
    setSuccessMessage(null);
  }, []);

  const upload = useCallback(
    async (file: File, locCode: number): Promise<{ ok: boolean }> => {
      setIsUploading(true);
      setErrorLogs([]);
      setSuccessMessage(null);

      try {
        // Goes through baseQueryWithReauth — auth token attached automatically
        const result = await triggerUpload({ file, locCode }).unwrap();

        const batches = toArray(result);
        const logs = parseErrorLogs(batches);

        if (logs.length > 0) {
          setErrorLogs(logs);
          return { ok: false };
        }

        setSuccessMessage(
          `Schedule uploaded successfully — ${batches.length} batch${batches.length !== 1 ? "es" : ""} processed.`,
        );
        return { ok: true };
      } catch (err: any) {
        // RTK Query throws on non-2xx; err.data may carry backend details
        const message =
          err?.data?.dB_Response ??
          err?.data?.message ??
          (err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.");

        setErrorLogs([{ batchId: 0, logDetail: message }]);
        return { ok: false };
      } finally {
        setIsUploading(false);
      }
    },
    [triggerUpload],
  );

  return { upload, isUploading, errorLogs, successMessage, reset };
}
