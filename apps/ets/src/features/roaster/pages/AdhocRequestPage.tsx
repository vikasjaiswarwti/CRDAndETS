import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useSubmitAdhocRequestMutation } from "../services/RosterApi";
import {
  useGetUserDetailsForRosterQuery,
  useGetUserFilterDataQuery,
} from "../services/IndividualRosterApi";
import { COLORS } from "../constants/Rosterconstants";
import { ADHOC_REQUEST_CONFIG } from "../config";
import { message } from "antd";

// Local palette for the pill/card treatment used on this screen.
// Kept separate from COLORS so the rest of the app's theme is untouched.
const THEME = {
  pageBg: "#EFF7F2",
  cardBorder: "#D9EADF",
  panelBg: "#FFFFFF",
  green900: "#173B2C",
  green700: "#245C41",
  green200: "#DCEFE2",
  green100: "#EEF7F1",
  muted: COLORS?.textMuted ?? "#7C8A82",
  body: COLORS?.textBody ?? "#1F2A24",
  danger: "#C0392B",
};
export interface AdhocRequestResult {
  errorCode: number;
  dB_Response: string;
}

export interface AdhocRequestResponse {
  result: AdhocRequestResult[];
  isSuccess: boolean;
  message: string;
}

const AdhocRequestPage = () => {
  const { Button, DatePicker, Input, Select } = useUILibrary();
  const { data: userDetails, isLoading: userLoading } =
    useGetUserDetailsForRosterQuery();

  const [locCode, setLocCode] = useState<string | number | null>("1");
  const [tripDate, setTripDate] = useState(dayjs());
  const [tripType, setTripType] = useState<number | string>("1");
  const [shiftId, setShiftId] = useState<number | undefined>();
  const [reqFor, setReqFor] = useState<number[]>([]);
  const [remarks, setRemarks] = useState("");

  const { data: filterData, isLoading: shiftsLoading } =
    useGetUserFilterDataQuery(
      { LocCode: Number(locCode) ?? null, EmpId: userDetails?.EmpId ?? 0 },
      {
        skip: !locCode || !userDetails?.EmpId,
        refetchOnMountOrArgChange: true,
      },
    );
  const [submitRequest, { isLoading }] = useSubmitAdhocRequestMutation();

  const locationOptions = useMemo(
    () =>
      (userDetails?.locations ?? []).map((location) => ({
        value: String(location.loccode),
        label: location.locname,
      })),
    [userDetails],
  );

  const shiftOptions = useMemo(() => {
    const shifts =
      tripType === "1" ? filterData?.PickShifts : filterData?.DropShifts;
    return (shifts ?? []).map((shift) => ({
      value: shift.SHIFTID,
      label: shift.SHIFTTIME,
    }));
  }, [filterData, tripType]);

  const employeeOptions = useMemo(
    () =>
      (userDetails?.DrList ?? []).map((employee) => ({
        value: employee.EMPID,
        label: employee.EmpName,
      })),
    [userDetails],
  );

  const handleSubmit = async () => {
    if (!locCode || !tripDate || !userDetails?.EmpId || !shiftId) {
      message?.error?.("Location, date, requester, and shift are required");
      return;
    }

    try {
      const response: AdhocRequestResponse | any = await submitRequest({
        locCode,
        tripDate: tripDate.format("YYYY-MM-DD"),
        tripType,
        shiftId,
        reqBy: userDetails.EmpId,
        reqFor: reqFor.join(","),
        remarks: remarks.trim(),
      }).unwrap();

      const result: any = response?.result?.[0];

      if (result?.errorCode === 0) {
        // Success
        message?.success?.(
          result?.dB_Response ||
            response?.message ||
            "Adhoc created successfully",
        );

        setShiftId(undefined);
        setReqFor([]);
        setRemarks("");
      } else {
        // API returned an error
        message?.error?.(
          result?.dB_Response ||
            response?.message ||
            "Failed to submit adhoc request",
        );
      }
    } catch (error) {
      console.error(error);
      message?.error?.("Failed to submit adhoc request");
    }
  };
  const DatePickerComponent = DatePicker as typeof import("antd").DatePicker;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 14,
        background: "#fff",
        color: THEME.body,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Adhoc Request</div>
        <div style={{ fontSize: 11, color: THEME.muted, marginTop: 3 }}>
          Request an additional pickup or drop trip for an employee.
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${THEME.cardBorder}`,
          borderRadius: 16,
          padding: 12,
          background: THEME.pageBg,
        }}
      >
        {/* Trip type as a segmented pill toggle */}
        <div
          style={{
            display: "flex",
            // justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: THEME.panelBg,
              borderRadius: 999,
              padding: 4,
              gap: 4,
            }}
          >
            {[
              { value: "1", label: "Log In" },
              { value: "2", label: "Log Out" },
            ].map((option) => {
              const active = tripType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTripType(option.value);
                    setShiftId(undefined);
                  }}
                  style={{
                    border: active
                      ? `1px solid ${THEME.green900}`
                      : "1px solid transparent",
                    borderRadius: 999,
                    padding: "8px 22px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.body,
                    background: active ? THEME.green100 : THEME.panelBg,
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location / date / shift as bordered input-style cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <PillField label="Office" required>
            <Select
              value={locCode ?? undefined}
              onChange={(value: string | number | undefined) => {
                setLocCode(value == null ? null : String(value));
                setShiftId(undefined);
                setReqFor([]);
              }}
              options={locationOptions}
              loading={userLoading}
              placeholder={
                userLoading ? "Loading locations" : "Select location"
              }
              autoSelectFirst={false}
              showSearch
              // bordered={false}
              style={{ width: "100%" }}
            />
          </PillField>

          <PillField label="Trip date" required>
            <DatePickerComponent
              value={tripDate}
              format="YYYY-MM-DD"
              disabledDate={(current: Dayjs) =>
                current.isBefore(dayjs().startOf("day"))
              }
              onChange={(value: Dayjs | null) => {
                setTripDate(value ?? dayjs());
                setShiftId(undefined);
              }}
              style={{
                width: "100%",
                height: 36,
                padding: "4px",
                border: `1px solid ${THEME.cardBorder}`,
                background: THEME.green100,
              }}
            />
          </PillField>

          <PillField label="Shift" required>
            <Select
              value={shiftId}
              onChange={(value: number) => setShiftId(value)}
              options={shiftOptions}
              loading={shiftsLoading}
              placeholder="Select shift"
              disabled={!locCode || shiftsLoading}
              // bordered={false}
              style={{ width: "100%" }}
            />
          </PillField>
        </div>
        {/* Requested-for pills, styled like the "creating schedule for" row */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: THEME.muted }}>
              Requested for
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: THEME.green700,
                background: THEME.green200,
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              {reqFor.length} selected
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {userLoading && (
              <span style={{ fontSize: 12, color: THEME.muted }}>
                Loading employees...
              </span>
            )}
            {!userLoading && !employeeOptions.length && (
              <span style={{ fontSize: 12, color: THEME.muted }}>
                Select a location first
              </span>
            )}
            {/* {employeeOptions.map((option) => {
              const employeeId = option.value;
              const selected = reqFor.includes(employeeId);
              const initial = option.label?.trim()?.[0]?.toUpperCase() ?? "?";
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setReqFor((current) => {
                      if (ADHOC_REQUEST_CONFIG.allowMultipleEmployees) {
                        return selected
                          ? current.filter((id) => id !== employeeId)
                          : [...current, employeeId];
                      }

                      return selected ? current : [employeeId];
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 36,
                    padding: "0 8px 0 6px",
                    borderRadius: 999,
                    border: `1px solid ${selected ? THEME.green900 : THEME.cardBorder}`,
                    background: THEME.panelBg,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: THEME.body,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: selected ? "#fff" : THEME.muted,
                      background: selected ? THEME.green900 : THEME.green100,
                    }}
                  >
                    {initial}
                  </span>
                  {option.label}
                  {selected && (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: THEME.green900,
                        color: "#fff",
                        fontSize: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })} */}
            {employeeOptions.map((option) => {
              const employeeId = option.value;
              const selected = reqFor.includes(employeeId);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setReqFor((current) => {
                      if (ADHOC_REQUEST_CONFIG.allowMultipleEmployees) {
                        return selected
                          ? current.filter((id) => id !== employeeId)
                          : [...current, employeeId];
                      }

                      return selected ? current : [employeeId];
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 36,
                    padding: "0 8px 0 6px",
                    borderRadius: 6,
                    border: `1px solid ${selected ? THEME.green900 : THEME.cardBorder}`,
                    background: THEME.panelBg,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: THEME.body,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      border: `1.5px solid ${selected ? THEME.green900 : THEME.cardBorder}`,
                      background: selected ? THEME.green900 : THEME.panelBg,
                      color: "#fff",
                      fontSize: 11,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selected && "✓"}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remarks, styled like the "Weekly Off" utility row */}
        <div
          style={{
            border: `1px solid ${THEME.cardBorder}`,
            borderRadius: 12,
            background: THEME.panelBg,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: THEME.muted,
              marginBottom: 8,
            }}
          >
            Remarks
          </div>
          <Input.TextArea
            value={remarks}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setRemarks(event.target.value)
            }
            rows={2}
            maxLength={500}
            showCount
            placeholder="Add a reason or note"
            // bordered={false}
            style={{ padding: 0, border: `1px solid ${THEME.cardBorder}` }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Button
            type="default"
            onClick={() => {
              setShiftId(undefined);
              setReqFor([]);
              setRemarks("");
            }}
            style={{
              height: 46,
              borderRadius: 999,
              padding: "0 24px",
              fontWeight: 700,
              border: `1px solid ${THEME.cardBorder}`,
              background: THEME.panelBg,
            }}
          >
            Clear
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
            style={{
              height: 46,
              borderRadius: 999,
              padding: "0 32px",
              fontWeight: 700,
              fontSize: 14,
              background: THEME.green900,
              borderColor: THEME.green900,
            }}
          >
            Submit request
          </Button>
        </div>
      </div>
    </div>
  );
};

const PillField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      border: `1px solid ${THEME.cardBorder}`,
      borderRadius: 12,
      background: THEME.panelBg,
      padding: "10px 14px",
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: THEME.muted,
        marginBottom: 4,
      }}
    >
      {label}
      {required && <span style={{ color: THEME.danger }}> *</span>}
    </div>
    {children}
  </div>
);

export default AdhocRequestPage;
