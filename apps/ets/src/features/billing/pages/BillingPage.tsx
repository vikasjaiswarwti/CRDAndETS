import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useGetRateCardsQuery } from "../services/billingApi";
import { useLookups } from "../../lookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useReportTable } from "../hooks/useReportTable";
import FilterField from "../components/FilterField";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import type { DynamicTariffSlab } from "../types/billing.types";
const EXCLUDED_KEYS = new Set(["RateCard", "RateTitle"]);
const BillingPage: React.FC = () => {
  const { locationOptions, isLoading } = useLookups({
    only: ["locationOptions"],
  });

  const { Select } = useUILibrary();
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);

  useEffect(() => {
    if (locationOptions?.length && selectedLocCode === null) {
      setSelectedLocCode(locationOptions[0].value as number);
    }
  }, [locationOptions]);

  // API call — returns a plain DynamicTariffSlab array
  const {
    data,
    isLoading: isApiLoading,
    error,
    refetch,
  } = useGetRateCardsQuery(selectedLocCode as number, {
    skip: selectedLocCode === null,
  });

  // Dynamic columns derived from the actual API response shape
  const { columns, scrollX } = useReportTable(
    data as DynamicTariffSlab[] | undefined,
    EXCLUDED_KEYS,
  );

  const handleOfficeChange = (val: number) => {
    setSelectedLocCode(val);
  };
  const pageTitle = data?.[0]?.RateTitle ?? "Rate Card";
  return (
    <PageContainer title={pageTitle}>
      <div style={{ padding: "0px 32px 32px" }}>
        <FilterField label="Office *">
          <Select
            showSearch
            placeholder="Select office…"
            value={selectedLocCode ?? undefined}
            onChange={handleOfficeChange}
            options={locationOptions}
            filterOption={(input: string, opt: any) =>
              String(opt?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ height: 36, width: 200, background: "#F3F4F6" }}
          />
        </FilterField>
      </div>
      <DataTableWrapper>
        <ApiStateWrapper
          isLoading={isLoading || isApiLoading}
          error={error}
          isEmpty={!data?.length}
          onRetry={refetch}
          emptyMessage="No rate card data available for the selected office."
        >
          <Table
            loading={isLoading || isApiLoading}
            columns={columns}
            dataSource={data ?? []}
            rowKey={(_, index) => String("RateCardRow-" + index)}
            // rowKey="RateCard" // ← use a stable unique key from CommonRateCardMeta
            scroll={{ x: scrollX }} // ← driven by useReportTable
            pagination={false} // ← DataTableWrapper owns pagination externally
            size="middle"
            bordered
          />
        </ApiStateWrapper>
      </DataTableWrapper>
    </PageContainer>
  );
};

export default BillingPage;
