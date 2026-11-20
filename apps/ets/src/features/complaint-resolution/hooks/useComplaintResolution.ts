import { useCallback, useEffect, useState } from "react";
import { useLazyGetComplaintReplyQuery } from "../services/ComplaintApi";

import type { ComplaintReply } from "../types/complaint.types";

export function useComplaintResolution() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0 = Unresolved, 1 = Resolved
  // No hardcoded office — starts unset until the Office filter (rendered in
  // ComplaintResolutionPage) picks a real one.
  const [officeCode, setOfficeCode] = useState<number | undefined>(undefined);
  const [empId, setEmpId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReference, setSelectedReference] = useState<number | null>(
    null,
  );
  const [triggerComplaintQuery, { data, isLoading, isFetching, error }] =
    useLazyGetComplaintReplyQuery();

  const runComplaintQuery = useCallback(() => {
    if (officeCode == null) {
      return;
    }

    void triggerComplaintQuery({
      locCode: officeCode,
      compStatus: activeTab,
      empId,
      page,
      pageSize,
    });
  }, [activeTab, empId, officeCode, page, pageSize, triggerComplaintQuery]);

  useEffect(() => {
    runComplaintQuery();
  }, [runComplaintQuery]);

  const items = data?.items ?? [];
  const selectedComplaint: ComplaintReply | undefined = items.find(
    (c: ComplaintReply) => c.referenceNo === selectedReference,
  );

  const changeTab = useCallback(
    (tab: 0 | 1) => {
      setActiveTab(tab);
      setPage(1);
      setSelectedReference(null);
    },
    [],
  );

  const changeOffice = useCallback(
    (code: number | undefined) => {
      setOfficeCode(code);
      setEmpId(undefined); // employee list is office-scoped — drop the stale pick
      setPage(1);
      setSelectedReference(null);
    },
    [],
  );

  const changeEmployee = useCallback(
    (id: number | undefined) => {
      setEmpId(id);
      setPage(1);
      setSelectedReference(null);
    },
    [],
  );

  const openReview = useCallback((referenceNo: number) => {
    setSelectedReference(referenceNo);
  }, []);

  const closeReview = useCallback(() => setSelectedReference(null), []);

  const changePage = useCallback(
    (nextPage: number, nextPageSize: number) => {
      setPage(nextPage);
      setPageSize(nextPageSize);
    },
    [],
  );

  return {
    officeCode,
    changeOffice,
    activeTab,
    changeTab,
    empId,
    changeEmployee,
    page,
    pageSize,
    changePage,
    items,
    total: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    error,
    refetch: runComplaintQuery,
    selectedComplaint,
    openReview,
    closeReview,
  };
}
