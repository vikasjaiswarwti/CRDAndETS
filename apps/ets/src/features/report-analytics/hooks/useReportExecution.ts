import { useCallback } from "react";
import { useFetchReportMutation } from "../services/ReportApi";
import type { ReportConfig } from "../constants/Reportconfig";
import type { FetchReportRequest, ReportRow } from "../types/Report.types";

export interface ReportFilterInputs {
  locCode: number | null;
  fromDate: string; // "YYYY-MM-DD"
  toDate: string;   // "YYYY-MM-DD"
}

/** Pure builder — exported separately so it's unit-testable */
export function buildFetchReportRequest(
  config: ReportConfig,
  { locCode, fromDate, toDate }: ReportFilterInputs,
): FetchReportRequest {
  switch (config.paramType) {
    case "none":
      return { endpoint: config.endpoint, method: "GET" };

    case "locCodeOnly":
      if (locCode === null) {
        throw new Error(`${config.displayName}: office is required`);
      }
      return {
        endpoint: config.endpoint,
        method: "GET",
        queryParams: { [config.locCodeKey]: locCode },
      };

    case "locCodeWithDates":
      if (locCode === null || !fromDate || !toDate) {
        throw new Error(
          `${config.displayName}: office and date range are required`,
        );
      }
      return {
        endpoint: config.endpoint,
        method: "POST",
        body: { [config.locCodeKey]: locCode, fromDate, toDate },
      };
  }
}

/** Validation used by the UI to enable/disable the Generate button */
export function canGenerateReport(
  config: ReportConfig | null,
  { locCode, fromDate, toDate }: ReportFilterInputs,
): boolean {
  if (!config) return false;
  if (config.paramType === "none") return true;
  if (config.paramType === "locCodeOnly") return locCode !== null;
  return locCode !== null && !!fromDate && !!toDate;
}

export function useReportExecution() {
  const [fetchReport, { data, isLoading, error, reset }] =
    useFetchReportMutation();

  const run = useCallback(
    (config: ReportConfig, inputs: ReportFilterInputs): Promise<ReportRow[]> =>
      fetchReport(buildFetchReportRequest(config, inputs)).unwrap(),
    [fetchReport],
  );

  return { run, data, isLoading, error, reset };
}

export default useReportExecution;