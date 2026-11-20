import React from "react";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { useGetBusinessesQuery } from "../services/businessApi";
import { useBusinessModal } from "../hooks/useBusinesModal";
import { useBusinessMutations } from "../hooks/useBusinessMutations";
import { useBusinessTable } from "../hooks/useBusinesTable";
import { BusinessFormModal } from "../components/Businessformmodal";

import type {
  CreateBusinessDto,
  UpdateBusinessDto,
} from "../types/Business.types";

import { BUSINESS_CONFIG } from "../config";

const BusinessListPage: React.FC = () => {
  const corporateRegisterUrl = window.location.origin;
  // 4. Modal (hoisted so openEdit can be passed to table hook)
  const { isOpen, editingRecord, openCreate, openEdit, close } =
    useBusinessModal();

  // 2. Table
  const { columns, tableState, setTableState, handleSearch, queryArgs } =
    useBusinessTable({ onEdit: openEdit });

  // 3. Data fetch
  const { data, isLoading, error, refetch } = useGetBusinessesQuery(queryArgs);

  console.log("data", data);

  // 5. Mutations
  const {
    createBusiness,
    updateBusiness,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useBusinessMutations({ onCreateSuccess: close, onUpdateSuccess: close });

  // 6. Derived
  const isSubmitting = isCreating || isUpdating;
  const serverErrors = editingRecord
    ? updateError?.fieldErrors
    : createError?.fieldErrors;

  // 6. Submit handler (Fixed & Safe)
  const handleSubmit = async (values: Record<string, unknown>) => {
    // Build the common payload from form values
    const sharedPayload = {
      // Add all your business fields here with proper type conversion
      // Example:
      businessFullName: (values.businessFullName as string).trim() || "",
      businessShortName: (values.businessShortName as string).trim() || "",
      // businessId: (values.businessId as number) || 1,
      // serviceID: (values.serviceID as number) || 1,
      businessUrl: corporateRegisterUrl || "",
      // updation_Lmit: (values.updation_Lmit as number) || 1,
      // scheduleUpdateVersion: (values.scheduleUpdateVersion as string) || '',
      // scheduleUpdateVersion: values.scheduleUpdateVersion ? "APP" : "WEB",
      // isAreaZone: (values.isAreaZone as boolean) || false,
    };

    console.log("values from handlesubmit", values);

    if (editingRecord) {
      // Update case - always take ID from editingRecord (safer)
      const payload: UpdateBusinessDto = {
        businessId: editingRecord.businessId, // Never rely on form values for ID
        ...sharedPayload,
      };
      await updateBusiness(payload);
    } else {
      // Create case
      const payload: CreateBusinessDto = { ...sharedPayload };
      await createBusiness(payload);
    }
  };

  return (
    <PageContainer
      title="Corporate Management"
      subtitle="Configure and manage business entities"
      createButtonLabel="Register Corporate"
      onCreateClick={
        BUSINESS_CONFIG?.canCreate && !data?.items?.length
          ? openCreate
          : undefined
      }
    >
      <DataTableWrapper
        searchPlaceholder="Search by business name"
        onSearch={handleSearch}
        showSearch={false}
        pagination={null}
      >
        <ApiStateWrapper
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.items?.length}
          onRetry={refetch}
          emptyMessage="No businesses found. Create your first one."
        >
          <AppTable
            loading={isLoading}
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="businessId"
            total={data?.total ?? 0}
            tableState={tableState}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      <BusinessFormModal
        open={isOpen}
        onClose={close}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
};

export default BusinessListPage;
