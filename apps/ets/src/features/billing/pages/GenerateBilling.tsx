import React, { useState } from "react";
import FilterField from "../components/FilterField";
import { useLookups } from "../../lookups/index";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGetBillingCycleQuery } from "../services/billingApi";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useBillingReportMutations } from "../hooks/useBillingReportMutations";
import { message } from "antd";

const GenerateBilling: React.FC = () => {
  const isMobile = useIsMobile();
  const { Select, Button, Empty } = useUILibrary();
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<
    number | null
  >(null);

  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  const { data: billingCycleData, isLoading: isBillingCycleLoading } =
    useGetBillingCycleQuery(selectedLocCode ?? 0, {
      skip: selectedLocCode === null,
      refetchOnMountOrArgChange: true,
    });
  const {
    generateBillingSix,
    isGeneratingBillingSix,
    // generateBillingSixError,
    // resetBillingDetails,
  } = useBillingReportMutations();
  // console.log(billingCycleData, "data from billing cycle query");
  const handleOfficeChange = (val: number) => {
    setSelectedLocCode(val);
    // setHasFetched(false); // Reset view when filters change
  };
  const handleGenerateBilling = async () => {
    if (selectedLocCode !== null) {
      const resp = await generateBillingSix({
        LocCode: selectedLocCode,
        VendorId: 0,
        BillingId: selectedBillingCycle ?? 0,
      });
      // console.log(resp, "response from generate billing six");
      if (resp?.errorCode) {
        message.error(resp?.dB_Response ?? "Error generating billing six");
      } else {
        message.success(
          resp?.dB_Response ?? "Billing six generated successfully",
        );
      }
    }
  };
  const buttonDisabled =
    selectedLocCode === null ||
    selectedBillingCycle === null ||
    isGeneratingBillingSix;
  return (
    <PageContainer
      title="Generate Billing"
      subtitle="Generate billing for the selected office and billing cycle"
    >
      <div
        style={{
          width: "100%",
          background: "#fff",
          minHeight: "60vh",
          padding: isMobile ? "14px 16px" : "10px 32px",
        }}
      >
        <div className="flex gap-2 flex-wrap items-end">
          <FilterField label={`Office *`}>
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
          <FilterField label={`Billing Cycle *`}>
            <Select
              showSearch
              placeholder="Select billing cycle…"
              value={selectedBillingCycle ?? undefined}
              onChange={(value) => setSelectedBillingCycle(value)}
              loading={isBillingCycleLoading}
              options={billingCycleData ?? []}
              filterOption={(input: string, opt: any) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ height: 36, width: 200, background: "#F3F4F6" }}
            />
          </FilterField>
          <Button
            // type="primary"
            style={{
              border: "1px solid #d9d9d9",
              background: `${buttonDisabled ? "#f5f5f5" : "#005c3d"}`,
              color: `${buttonDisabled ? "#d9d9d9" : "#fff"}`,
              height: 36,
            }}
            onClick={handleGenerateBilling}
            loading={isGeneratingBillingSix}
            disabled={buttonDisabled}
          >
            Generate Billing
          </Button>
        </div>
        {selectedLocCode === null && (
          <Empty
            description="Please select an office and billing cycle to generate billing."
            style={{ marginTop: 32 }}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default GenerateBilling;
