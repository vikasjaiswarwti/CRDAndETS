import { useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { TripPassenger, TripResponse } from "../types/tracking.types";
import { T } from "../../../styles/tokens";
import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";
// import { Button } from "antd";

interface NoShowModalProps {
  open: boolean;
  onClose: () => void;
  passengers: TripPassenger[];
  leftData: TripResponse;
}

const NoShowComponent = ({
  open,
  onClose,
  passengers,
  leftData,
}: NoShowModalProps) => {
  const { Modal, Select, Button } = useUILibrary();
  const { markNoShowEmployee, isMarkNoShowLoading, markNoShowError } =
    useRouteTrackingMutation({ onMarkNoShowSuccess: () => onClose() });
  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();

  const employeeOptions = useMemo(
    () =>
      passengers
        .filter(
          (passenger) =>
            passenger.empSigninTime == null &&
            passenger.empSigninLat == null &&
            passenger.empSigninLng == null &&
            !passenger.noShow,
        )
        .map((passenger) => ({
          label: `${passenger.firstname} ${passenger.lastName}`,
          value: passenger.empId,
        })),
    [passengers],
  );
  const handleSubmit = async () => {
    if (!selectedEmpId) return;

    const employee = passengers.find((p) => p.empId === selectedEmpId);

    if (!employee) return;

    try {
      await markNoShowEmployee({
        dsId: leftData.dsId, // adjust field name if different
        empID: employee.empId,
        tripType: leftData.tripType,
        mobileNo: leftData.driverMobileNo as string,
      });

      // onClose();
    } catch (error) {
      console.error(error);
    }
  };
  const fieldErrors = markNoShowError?.fieldErrors ?? [];
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Mark No Show Employee"
      width={480}
      destroyOnClose
      footer={
        <Button
          disabled={!selectedEmpId || isMarkNoShowLoading}
          loading={isMarkNoShowLoading}
          onClick={handleSubmit}
          style={{
            border: "1px solid",
            background: "#3E9B73",
            color: "#fff",
          }}
        >
          Submit
        </Button>
      }
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 400,
          }}
        >
          Select Employee
        </label>

        <Select
          placeholder="Select Employee"
          options={employeeOptions}
          value={selectedEmpId}
          onChange={(value) => setSelectedEmpId(value)}
          showSearch
          allowClear
          style={{ width: "100%", background: T.formcss.inputBg }}
        />
      </div>
      <>
        {fieldErrors?.length > 0 && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#FFF2F0",
              border: "1px solid #FFCCC7",
              color: "#CF1322",
              fontSize: 14,
            }}
          >
            {fieldErrors.map((err) => (
              <div key={err.field}>{err.message}</div>
            ))}
          </div>
        )}
      </>
    </Modal>
  );
};

export default NoShowComponent;
