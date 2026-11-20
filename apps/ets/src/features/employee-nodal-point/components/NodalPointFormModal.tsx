import MapPanel from "../../employee/components/MapPanel";

import React, { useEffect, useCallback } from "react";
import { Form } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { T } from "../../../styles/tokens";
import { TRIP_TYPE_OPTIONS } from "../constants/nodalPointConstants";
import type { NodalPoint } from "../types/nodalPoint.types";
import type { FieldError } from "../../../shared/types/api-error.types";
import { useGetRoutesQuery } from "../services/routeTableApi";
import {
  useGoogleMap,
  type AddressComponents,
} from "../../../shared/hooks/useGoogleMap";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NodalPointFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: NodalPoint | null;
  locationCode?: number;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FIELD_STYLE: React.CSSProperties = {
  border: `1px solid ${T.formcss.greyBorder}`,
  width: "100%",
  background: T.formcss.inputBg,
};

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 600,
  color: "#1B4332",
  fontSize: 12,
};

// Two-column layout replacing antd's Row/Col at the outer (map | form) level
const SPLIT_STYLE: React.CSSProperties = {
  display: "flex",
  flexWrap: "nowrap",
  gap: 24,
};

const SPLIT_PANE_STYLE: React.CSSProperties = {
  flex: "1 1 460px",
  minWidth: 0,
};

// Field grid replacing antd's inner Row/Col (two fields per row)
const FIELD_GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: 16,
};

// A field that should span both grid columns (Name, Address, Description)
const FULL_ROW_STYLE: React.CSSProperties = {
  gridColumn: "1 / -1",
};

// Wrapper class + scoped override: antd's vertical Form.Item label ships with
// a default padding (via --ant-form-vertical-label-padding). Scoping the
// override to this class avoids touching antd's own hashed utility class.
const FORM_SCOPE_CLASS = "npf-form";

// ─── Component ────────────────────────────────────────────────────────────────

export const NodalPointFormModal: React.FC<NodalPointFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  locationCode,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal, Input, Select, Switch, Button, Typography, Spin } =
    useUILibrary();

  const [form] = Form.useForm();

  // ── Route options ───────────────────────────────────────────────────────
  const { data: routes } = useGetRoutesQuery(
    locationCode ? { locCode: locationCode } : undefined,
  );
  const routeOptions = React.useMemo(
    () =>
      (routes ?? []).map((r) => ({
        label: r.routeName,
        value: r.routeId,
      })),
    [routes],
  );

  // ── Map picker ──────────────────────────────────────────────────────────
  // Pushes picked/searched location straight into the form fields.
  const handleAddressChange = useCallback(
    (components: AddressComponents) => {
      form.setFieldsValue({
        latitude: Number(components.lat.toFixed(6)),
        longitude: Number(components.lng.toFixed(6)),
        address: components.fullAddress,
      });
    },
    [form],
  );

  // NOTE: destroyOnClose only unmounts the Modal's *internal content* (the
  // Form, the map <div>, ...) on close — this component itself, and this
  // useGoogleMap() hook instance, stay mounted across opens (only `open`
  // toggles). So the map-init effect below (keyed on defaultLat/defaultLng)
  // will NOT re-run on reopen if the coordinates happen to match the
  // previous open, leaving the brand-new map <div> uninitialised while
  // `isLoaded` is stuck true from before. The effect further down forces a
  // fresh init on every reopen after the first to guard against that.
  const {
    mapRef,
    searchInputRef,
    isLoaded,
    isGeocoding,
    moveMarker,
    geocodeLatLng,
    refreshMap,
  } = useGoogleMap({
    onAddressChange: handleAddressChange,
    defaultLat: editingRecord?.latitude,
    defaultLng: editingRecord?.longitude,
  });

  const isLoadedRef = React.useRef(isLoaded);
  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  const hasOpenedRef = React.useRef(false);
  useEffect(() => {
    if (!open) return;

    // Reopen (not the very first open): the map <div> is a fresh DOM node,
    // but this hook instance's isLoaded state carries over — force a
    // re-init rather than relying on lat/lng having changed.
    if (hasOpenedRef.current) refreshMap();
    hasOpenedRef.current = true;

    // Safety net: the modal's zoom-in entrance animation can also race the
    // map's one-shot size check on init — retry once more if still stuck.
    const retry = setTimeout(() => {
      if (!isLoadedRef.current) refreshMap();
    }, 400);
    return () => clearTimeout(retry);
  }, [open, refreshMap]);

  // ── Manual lat/lng entry → move the marker on the map ──────────────────
  // Debounced so it doesn't fire the map update (and a geocode call) on
  // every keystroke — only once the person pauses typing a valid pair.
  const latLngDebounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  const handleLatLngInputChange = useCallback(() => {
    if (latLngDebounceRef.current) clearTimeout(latLngDebounceRef.current);

    latLngDebounceRef.current = setTimeout(() => {
      const lat = Number(form.getFieldValue("latitude"));
      const lng = Number(form.getFieldValue("longitude"));

      if (
        !isLoaded ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return;
      }

      moveMarker(lat, lng);
      // Also refresh the Address field to match the pinned point.
      void geocodeLatLng(lat, lng);
    }, 500);
  }, [form, isLoaded, moveMarker, geocodeLatLng]);

  useEffect(() => {
    return () => {
      if (latLngDebounceRef.current) clearTimeout(latLngDebounceRef.current);
    };
  }, []);

  // ── Seed the form when the modal opens or the record changes ──────────────
  useEffect(() => {
    if (!open) return;

    if (editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        locationCode: locationCode,
        // TRIP_TYPE_OPTIONS carry string values — normalise for the Select
        tripType: String(editingRecord.tripType),
        boardingOrder: editingRecord.boardingOrder,
        latitude: editingRecord.latitude,
        longitude: editingRecord.longitude,
        address: editingRecord.address ?? "",
        description: editingRecord.description ?? "",
        isActive: editingRecord.isActive,
        routeId: editingRecord.routeId ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tripType: "1",
        boardingOrder: 1,
        isActive: true,
      });
    }
  }, [open, editingRecord, form]);

  // ── Reflect server-side field errors into the form ────────────────────────
  useEffect(() => {
    if (!serverErrors?.length) return;
    form.setFields(
      serverErrors.map((e) => ({ name: e.field, errors: [e.message] })),
    );
  }, [serverErrors, form]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleFinish = useCallback(
    async (values: Record<string, unknown>) => {
      if (!locationCode) {
        return;
      }
      await onSubmit({
        name: String(values.name ?? "").trim(),
        locationCode: Number(locationCode),
        tripType: Number(values.tripType),
        boardingOrder: Number(values.boardingOrder),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        address: String(values.address ?? "").trim() || null,
        description: String(values.description ?? "").trim() || null,
        isActive: Boolean(values.isActive),
        routeId:
          values.routeId !== undefined && values.routeId !== null
            ? Number(values.routeId)
            : null,
      });
    },
    [onSubmit],
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Typography.Text
          style={{ fontSize: 20, fontWeight: 700, color: "#1B4332" }}
        >
          {editingRecord ? "Edit Nodal Point" : "Add Nodal Point"}
        </Typography.Text>
      }
      width={1040}
      destroyOnClose
      footer={null}
      style={{ top: 5 }}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        content: { borderRadius: 16 },
      }}
    >
      <style>{`
        .${FORM_SCOPE_CLASS} .ant-form-item-label {
          padding: 0 !important;
        }
      `}</style>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className={FORM_SCOPE_CLASS}
      >
        <div style={SPLIT_STYLE}>
          {/* ── Left: map picker (search + click/drag to set lat/lng) ─ */}
          <div style={SPLIT_PANE_STYLE}>
            <MapPanel
              searchInputRef={searchInputRef}
              mapRef={mapRef}
              isLoaded={isLoaded}
              isGeocoding={isGeocoding}
              Spin={Spin}
              showLabel={false}
            />
          </div>

          {/* ── Right: form fields ────────────────────────────────────── */}
          <div style={SPLIT_PANE_STYLE}>
            <div style={FIELD_GRID_STYLE}>
              {/* ── Name ──────────────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="routeId"
                  label={<span style={LABEL_STYLE}>Route</span>}
                >
                  <Select
                    options={routeOptions}
                    placeholder="Select route"
                    allowClear
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  name="name"
                  label={<span style={LABEL_STYLE}>Nodal Point Name</span>}
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input
                    placeholder="Enter nodal point name"
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              {/* ── Trip Type ─────────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="tripType"
                  label={<span style={LABEL_STYLE}>Trip Type</span>}
                  rules={[{ required: true, message: "Trip type is required" }]}
                >
                  <Select
                    options={TRIP_TYPE_OPTIONS}
                    placeholder="Login / Logout"
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              {/* ── Boarding Order ────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="boardingOrder"
                  label={<span style={LABEL_STYLE}>Stop Order</span>}
                  rules={[
                    { required: true, message: "Stop order is required" },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Enter boarding order"
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              {/* ── Latitude ──────────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="latitude"
                  label={<span style={LABEL_STYLE}>Latitude</span>}
                  rules={[{ required: true, message: "Latitude is required" }]}
                >
                  <Input
                    type="number"
                    placeholder="Pick on map or search"
                    style={FIELD_STYLE}
                    onChange={handleLatLngInputChange}
                  />
                </Form.Item>
              </div>

              {/* ── Longitude ─────────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="longitude"
                  label={<span style={LABEL_STYLE}>Longitude</span>}
                  rules={[{ required: true, message: "Longitude is required" }]}
                >
                  <Input
                    type="number"
                    placeholder="Pick on map or search"
                    style={FIELD_STYLE}
                    onChange={handleLatLngInputChange}
                  />
                </Form.Item>
              </div>

              {/* ── Address ───────────────────────────────────────────── */}
              <div style={FULL_ROW_STYLE}>
                <Form.Item
                  name="address"
                  label={<span style={LABEL_STYLE}>Address</span>}
                >
                  <Input
                    placeholder="Auto-filled from map, editable"
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              {/* ── Description ───────────────────────────────────────── */}
              <div style={FULL_ROW_STYLE}>
                <Form.Item
                  name="description"
                  label={<span style={LABEL_STYLE}>Description</span>}
                >
                  <Input.TextArea
                    placeholder="Optional — additional notes about this nodal point"
                    rows={2}
                    style={FIELD_STYLE}
                  />
                </Form.Item>
              </div>

              {/* ── Active ────────────────────────────────────────────── */}
              <div>
                <Form.Item
                  name="isActive"
                  label={<span style={LABEL_STYLE}>Active</span>}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

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
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{
              borderRadius: 50,
              background: "#1B4332",
              borderColor: "#1B4332",
            }}
          >
            {editingRecord ? "Save Changes" : "Create Nodal Point"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default NodalPointFormModal;
