import React, { useState } from "react";
import type { Trip } from "../types/vendorTrip.types";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { Col, Descriptions, Form, Row } from "antd";
import { T } from "../../../styles/tokens";

interface SelectOption {
  label: string;
  value: string | number;
}

export interface Vehicle {
  vehicleId: number;
  vehicleNo: string;
  vehicleModel: string;
  vehicleRegNo: string;
  capacity: number;
  driverId: number;
  driverName?: string;
}

interface AssignVehicleDriverTripModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Trip | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: any;
  vehicleOptions: Vehicle[];
  driverOptions: SelectOption[];
}

const AssignVehicleDriverTrip: React.FC<AssignVehicleDriverTripModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  vehicleOptions,
  driverOptions,
}) => {
  const { Modal, Select, Button } = useUILibrary();
  const [form] = Form.useForm();

  const [vehicleAssignedDriverId, setVehicleAssignedDriverId] = useState<
    number | null
  >(null);
  const [vehicleAssignedDriverName, setVehicleAssignedDriverName] = useState<
    string | null
  >(null);
  const [showDriverSelect, setShowDriverSelect] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        // If driver select is hidden and vehicle has pre-assigned driver, use that
        driverId:
          showDriverSelect || !vehicleAssignedDriverId
            ? values.driverId
            : vehicleAssignedDriverId,
        dsId: editingRecord?.dsId,
      });
    } catch {
      // Ant Design handles showing validation errors
    }
  };

  const handleClose = () => {
    form.resetFields();
    setVehicleAssignedDriverId(null);
    setVehicleAssignedDriverName(null);
    setShowDriverSelect(false);
    onClose();
  };

  const handleVehicleChange = (vehicleId: number) => {
    const selectedVehicle = vehicleOptions.find(
      (vehicle) => vehicle.vehicleId === vehicleId,
    );

    if (selectedVehicle?.driverId) {
      setVehicleAssignedDriverId(selectedVehicle.driverId);

      const matchedDriver = driverOptions.find(
        (d) => d.value === selectedVehicle.driverId,
      );
      setVehicleAssignedDriverName(
        selectedVehicle.driverName ?? matchedDriver?.label ?? null,
      );

      // Hide driver select and reset it when vehicle changes
      setShowDriverSelect(false);
      form.setFieldsValue({ driverId: selectedVehicle.driverId });
    } else {
      // Vehicle has no assigned driver — show select by default
      setVehicleAssignedDriverId(null);
      setVehicleAssignedDriverName(null);
      setShowDriverSelect(true);
      form.setFieldsValue({ driverId: undefined });
    }
  };

  const handleToggleDriverSelect = () => {
    setShowDriverSelect((prev) => {
      if (prev) {
        // Reverting back — restore pre-assigned driver
        form.setFieldsValue({ driverId: vehicleAssignedDriverId });
      } else {
        // Opening to change — clear the field
        form.setFieldsValue({ driverId: undefined });
      }
      return !prev;
    });
  };

  const vehicleDetails = vehicleOptions.map((vehicle) => ({
    label: `${vehicle.vehicleNo} - ${vehicle.vehicleModel}`,
    value: vehicle.vehicleId,
  }));

  // Has a vehicle been selected?
  const hasVehicleSelected =
    vehicleAssignedDriverId !== null || showDriverSelect;

  // Driver field is required only when the select is visible and no pre-assigned driver
  const isDriverRequired = showDriverSelect && !vehicleAssignedDriverId;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={"Assign Driver & Vehicle"}
      width={580}
      destroyOnClose
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
          }}
        >
          <Button
            onClick={handleClose}
            style={{
              borderRadius: 50,
              border: `1px solid ${T.formcss.green}`,
              color: T.formcss.green,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit}
            style={{
              borderRadius: 50,
              background: T.formcss.green,
              fontWeight: 600,
              paddingInline: 28,
              border: `1px solid ${T.formcss.green}`,
            }}
          >
            Assign
          </Button>
        </div>
      }
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      {editingRecord && (
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            { key: "1", label: "Trip ID", children: editingRecord?.dsId },
            {
              key: "3",
              label: "Passengers",
              children: editingRecord?.totalPax,
            },
            // { key: "4", label: "Distance", children: `${editingRecord?.routeDistanceKm} km` },
            // { key: "5", label: "Duration", children: `editingRecord?.totalDuration min` },
            {
              key: "6",
              label: "Guard",
              children: editingRecord?.isGuard ? "Required" : "No",
            },
            {
              key: "7",
              label: "Vehicle Reg. No.",
              children: editingRecord?.vehicleRegNo ?? "-",
            },
            {
              key: "8",
              label: "Driver Name",
              children: editingRecord?.driverName ?? "-",
            },
            {
              key: "9",
              label: "Driver No.",
              children: editingRecord?.driverMobile ?? "-",
            },
          ]}
        />
      )}

      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Row gutter={24}>
          {/* Vehicle Select */}
          <Col span={12}>
            <Form.Item
              name="vehicleId"
              label="Vehicle"
              rules={[{ required: true, message: "Please select a vehicle" }]}
            >
              <Select
                placeholder="Select Vehicle"
                options={vehicleDetails}
                style={{ width: "100%" }}
                onChange={handleVehicleChange}
              />
            </Form.Item>
          </Col>

          {/* Driver Col — always rendered so layout stays stable */}
          <Col span={12}>
            {hasVehicleSelected ? (
              <>
                {/* Pre-assigned driver info + toggle button */}
                {vehicleAssignedDriverId && !showDriverSelect && (
                  <Form.Item label="Driver">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {/* Driver name badge */}
                      <div
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          background: "#f0faf4",
                          border: `1px solid ${T.formcss.green}`,
                          color: T.formcss.green,
                          fontWeight: 500,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span>👤</span>
                        <span>
                          {vehicleAssignedDriverName ?? "Pre-assigned Driver"}
                        </span>
                      </div>

                      {/* Toggle button */}
                      <button
                        type="button"
                        onClick={handleToggleDriverSelect}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "#faad14",
                          fontSize: 12,
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>⚠️</span>
                        <span
                          style={{
                            textDecoration: "underline",
                            textUnderlineOffset: 2,
                          }}
                        >
                          Do you want to change the driver?
                        </span>
                      </button>
                    </div>
                  </Form.Item>
                )}

                {/* Driver Select — shown when toggled or no pre-assigned driver */}
                {showDriverSelect && (
                  <Form.Item
                    name="driverId"
                    label={
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        Driver
                        {/* Show revert option only if vehicle had a pre-assigned driver */}
                        {vehicleAssignedDriverId && (
                          <button
                            type="button"
                            onClick={handleToggleDriverSelect}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: T.formcss.green,
                              fontSize: 11,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <span>↩</span>
                            <span style={{ textDecoration: "underline" }}>
                              Keep original
                            </span>
                          </button>
                        )}
                      </span>
                    }
                    rules={[
                      {
                        required: isDriverRequired,
                        message: "Please select a driver",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Driver"
                      options={driverOptions}
                      style={{ width: "100%" }}
                      allowClear
                      // autoFocus
                    />
                  </Form.Item>
                )}
              </>
            ) : (
              /* No vehicle selected yet — show disabled placeholder */
              <Form.Item label="Driver">
                <Select
                  placeholder="Select Vehicle first"
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AssignVehicleDriverTrip;
