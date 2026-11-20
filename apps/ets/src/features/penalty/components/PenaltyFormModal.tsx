import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { Penalty, SelectOption } from "../types/penalty.types";
import {
  useGetPenaltyApplicableQuery,
  useGetPenaltyApplicableOnQuery,
  useGetPenaltyApplicableReasonQuery,
} from "../services/penaltyApi";
import {
  // Checkbox,
  Form,
} from "antd";
import { useGetBillingCycleQuery } from "../../billing/services/billingApi";
import { T } from "../../../styles/tokens";
import { STATUS_OPTIONS } from "../constants/penaltyConstants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PenaltyFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Penalty | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void | null>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  locationOptions: SelectOption[];
}

// ─── Styles (kept here so nothing leaks out) ─────────────────────────────────

const FIELD_STYLE: React.CSSProperties = {
  border: `1px solid ${T.formcss.greyBorder}`,
  // borderRadius: 8,
  width: "100%",
  background: T.formcss.inputBg,
};

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 600,
  color: "#1B4332",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PenaltyFormModal: React.FC<PenaltyFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  locationOptions,
}) => {
  const { Modal, Input, Select, Button, Row, Col, Typography } = useUILibrary();

  const [form] = Form.useForm();

  // ── Cascading state ───────────────────────────────────────────────────────
  // These drive which dependent dropdowns are fetched / enabled
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);
  const [selectedApplicableID, setSelectedApplicableID] = useState<
    number | null
  >(null);
  const { data: billingCycleOptions, isLoading: isBillingCycleLoading } =
    useGetBillingCycleQuery(selectedLocCode ?? 0, {
      skip: selectedLocCode === null,
      refetchOnMountOrArgChange: true,
    });

  const isRecordLocked =
    editingRecord != null ? editingRecord.statusCode === 1 : false;

  // ── Seed form + local state when modal opens or record changes ────────────
  useEffect(() => {
    if (!open) return;

    if (editingRecord) {
      form.setFieldsValue({
        LocCode: editingRecord.locCode,
        BillingID: editingRecord.billingID,
        ApplicableID: editingRecord.applicableId,
        DSID: editingRecord.tripId ? editingRecord.tripId : 0,
        ApplicableOnId: editingRecord.applicableOnId,
        PenaltyType_id: editingRecord.penaltyTypeId,
        Amount: editingRecord.amount,
        Remarks: editingRecord.remarks ?? "",
        Status: isRecordLocked ? "1" : "0",
      });
      setSelectedApplicableID(editingRecord.applicableId);
      setSelectedLocCode(editingRecord.locCode);
    } else {
      form.resetFields();
      form.setFieldsValue({ Status: "0" }); // ← default "Active" for new records
      setSelectedLocCode(null);
      setSelectedApplicableID(null);
    }
  }, [open, editingRecord, form]);

  // ── Reflect server-side field errors into the form ────────────────────────
  useEffect(() => {
    if (!serverErrors?.length) return;
    const antdErrors = serverErrors.map((e) => ({
      name: e.field,
      errors: [e.message],
    }));
    form.setFields(antdErrors);
  }, [serverErrors, form]);

  // ── Lookups ───────────────────────────────────────────────────────────────

  const { data: applicableOptions, isLoading: isLoadingApplicable } =
    useGetPenaltyApplicableQuery(undefined, { skip: !open });
  const { data: applicableOnOptions, isLoading: isLoadingApplicableOn } =
    useGetPenaltyApplicableOnQuery(
      {
        locCode: selectedLocCode ?? 0,
        applicableID: selectedApplicableID ?? 0,
      },
      {
        skip:
          !open || selectedLocCode === null || selectedApplicableID === null,
      },
    );

  const { data: reasonOptions, isLoading: isLoadingReasons } =
    useGetPenaltyApplicableReasonQuery(
      { applicableID: selectedApplicableID ?? 0 },
      { skip: !open || selectedApplicableID === null },
    );

  // ── Cascade handlers ──────────────────────────────────────────────────────

  const handleLocCodeChange = useCallback(
    (value: number) => {
      setSelectedLocCode(value);
      // Clear downstream fields when location changes
      form.setFieldsValue({
        ApplicableID: undefined,
        ApplicableOnId: undefined,
        PenaltyType_id: undefined,
      });
      setSelectedApplicableID(null);
    },
    [form],
  );

  const handleApplicableChange = useCallback(
    (value: number) => {
      setSelectedApplicableID(value);
      // Clear downstream fields when applicable type changes
      form.setFieldsValue({
        ApplicableOnId: undefined,
        PenaltyType_id: undefined,
      });
    },
    [form],
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleFinish = useCallback(
    async (values: Record<string, unknown>) => {
      console.log(values, "values");
      const payload: Record<string, unknown> = {
        SNO: editingRecord?.sno ?? 0,
        LocCode: Number(values.LocCode),
        BillingID: Number(values.BillingID),
        DSID: values.DSID ? values.DSID : 0,
        ApplicableOnId: Number(values.ApplicableOnId),
        PenaltyType_id: Number(values.PenaltyType_id),
        Amount: Number(values.Amount),
        Remarks: String(values.Remarks ?? ""),
        Status: values.Status ?? 0,
      };
      await onSubmit(payload);
    },
    [editingRecord, onSubmit],
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  // ── Shared Select style helper ────────────────────────────────────────────
  const selectStyle = { ...FIELD_STYLE };
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Typography.Text
          style={{ fontSize: 20, fontWeight: 700, color: "#1B4332" }}
        >
          {editingRecord ? "Edit Penalty" : "Add Penalty"}
        </Typography.Text>
      }
      width={640}
      destroyOnClose
      footer={null}
      style={{ top: 10 }}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        header: { borderBottom: "none", paddingBottom: 0 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        style={{}}
      >
        <Row gutter={16}>
          {/* ── Location ──────────────────────────────────────────── */}
          <Col span={12}>
            <Form.Item
              required
              name="LocCode"
              label={<span style={LABEL_STYLE}>Office</span>}
              rules={[{ required: true, message: "Office is required" }]}
            >
              <Select
                options={locationOptions}
                placeholder="Select office"
                onChange={handleLocCodeChange}
                style={FIELD_STYLE}
                showSearch
                filterOption={(input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          {/* ── Billing Cycle ─────────────────────────────────────── */}
          <Col span={12}>
            <Form.Item
              name="BillingID"
              label={<span style={LABEL_STYLE}>Billing Cycle</span>}
              rules={[{ required: true, message: "Billing cycle is required" }]}
            >
              <Select
                options={billingCycleOptions}
                placeholder="Select billing cycle"
                style={selectStyle}
                showSearch
                loading={isBillingCycleLoading}
                filterOption={(input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          {/* ── Applicable Type (Driver / Vehicle / Vendor) ───────── */}
          <Col span={12}>
            <Form.Item
              name="ApplicableID"
              label={<span style={LABEL_STYLE}>Applicable On Type</span>}
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <Select
                options={applicableOptions}
                placeholder="Driver / Vehicle / Vendor"
                loading={isLoadingApplicable}
                disabled={!selectedLocCode}
                onChange={handleApplicableChange}
                style={selectStyle}
              />
            </Form.Item>
          </Col>

          {/* ── Apply To (entity within the type) ────────────────── */}
          <Col span={12}>
            <Form.Item
              name="ApplicableOnId"
              label={<span style={LABEL_STYLE}>Apply To</span>}
              rules={[
                { required: true, message: "Please select who to apply to" },
              ]}
            >
              <Select
                options={applicableOnOptions}
                placeholder={
                  selectedApplicableID
                    ? "Select driver / vehicle / vendor"
                    : "Select type first"
                }
                loading={isLoadingApplicableOn}
                disabled={!selectedApplicableID}
                style={selectStyle}
                showSearch
                filterOption={(input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          {/* ── Penalty Reason ────────────────────────────────────── */}
          <Col span={12}>
            <Form.Item
              name="PenaltyType_id"
              label={<span style={LABEL_STYLE}>Penalty Reason</span>}
              rules={[{ required: true, message: "Please select a reason" }]}
            >
              <Select
                options={reasonOptions}
                placeholder={
                  selectedApplicableID
                    ? "Select penalty reason"
                    : "Select type first"
                }
                loading={isLoadingReasons}
                disabled={!selectedApplicableID}
                style={FIELD_STYLE}
              />
            </Form.Item>
          </Col>

          {/* ── Trip DS ID ────────────────────────────────────────── */}
          <Col span={12}>
            <Form.Item
              name="DSID"
              label={<span style={LABEL_STYLE}>Trip ID</span>}
            >
              <Input
                // type="number"
                placeholder="Enter trip ID"
                style={FIELD_STYLE}
                onWheel={(e) => e.target.Blur()}
              />
            </Form.Item>
          </Col>

          {/* ── Amount ───────────────────────────────────────────── */}
          <Col span={12}>
            <Form.Item
              name="Amount"
              label={<span style={LABEL_STYLE}>Penalty Amount</span>}
              rules={[{ required: true, message: "Amount is required" }]}
            >
              <Input
                type="number"
                placeholder="Enter Amount"
                prefix="₹"
                style={FIELD_STYLE}
                onWheel={(e) => e.target.Blur()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="Status"
              label={<span style={LABEL_STYLE}>Status</span>}
            >
              <Select
                options={STATUS_OPTIONS}
                placeholder="Select Status"
                style={selectStyle}
              />
            </Form.Item>
          </Col>

          {/* ── Remarks (full width) ──────────────────────────────── */}
          <Col span={24}>
            <Form.Item
              name="Remarks"
              label={<span style={LABEL_STYLE}>Remarks</span>}
            >
              <Input.TextArea
                placeholder="Optional — additional notes about this penalty"
                rows={2}
                style={{ ...FIELD_STYLE }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Status warning — shown only when record is Closed (status = 1) ── */}
        {isRecordLocked && (
          <div
            style={{
              background: "#FFF3CD",
              border: "1px solid #FFCA28",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 8,
              color: "#7B5800",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            ⚠️ This penalty is <strong>Closed</strong> and cannot be edited.
          </div>
        )}

        {/* ── Footer buttons ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid #B7E4C7",
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              borderRadius: 50,
              borderColor: "#1B4332",
              color: "#1B4332",
            }}
          >
            Cancel
          </Button>
          {isRecordLocked == false && (
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting || isRecordLocked}
              style={{
                borderRadius: 50,
                background: isRecordLocked ? "#A9A9A9" : "#1B4332",
                borderColor: isRecordLocked ? "#A9A9A9" : "#1B4332",
              }}
            >
              {editingRecord ? "Save Changes" : "Create Penalty"}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};
