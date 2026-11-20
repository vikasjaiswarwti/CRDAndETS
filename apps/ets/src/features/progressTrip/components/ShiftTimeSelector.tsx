import { useState, useEffect } from "react";
import type { SelectOptions } from "../types/progressTrip.types";
import { Checkbox, Select, Skeleton } from "antd";

interface ShiftTimeSelectorProps {
  pickupTimes: SelectOptions[];
  dropTimes: SelectOptions[];
  tripType: number;
  loading: boolean;
  onChange?: (
    type: "pickup" | "drop",
    values: number[],
    labels: string[],
  ) => void;
}

export default function ShiftTimeSelector({
  pickupTimes = [],
  dropTimes = [],
  loading = false,
  tripType = 0,
  onChange,
}: ShiftTimeSelectorProps) {
  const [selectedPickup, setSelectedPickup] = useState<number[]>([]);
  const [selectedDrop, setSelectedDrop] = useState<number[]>([]);
  useEffect(() => {
    setSelectedPickup(pickupTimes.map((o) => o.value));
    const labels = pickupTimes.map((o) => o.label);
    onChange?.(
      "pickup",
      pickupTimes.map((o) => o.value),
      labels,
    );
  }, [pickupTimes]);

  useEffect(() => {
    setSelectedDrop(dropTimes.map((o) => o.value));
    const labels = dropTimes.map((o) => o.label);
    onChange?.(
      "drop",
      dropTimes.map((o) => o.value),
      labels,
    );
  }, [dropTimes]);

  const handleToggle = (
    type: "pickup" | "drop",
    option: SelectOptions,
    times: SelectOptions[],
    current: number[],
  ) => {
    // toggle: add if not present, remove if already selected
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];

    const labels = next
      .map((v) => times.find((t) => t.value === v)?.label ?? "")
      .filter(Boolean);

    if (type === "pickup") setSelectedPickup(next);
    else setSelectedDrop(next);

    onChange?.(type, next, labels);
  };

  const renderRow = (
    type: "pickup" | "drop",
    times: SelectOptions[],
    selectedValues: number[],
  ) => {
    const activeBg = type == "pickup" ? "#ECFDF5" : "#fff3e6";
    const activeBorder = type == "pickup" ? "#10B981" : "#fa8c16";
    const activeColor = type == "pickup" ? "#059669" : "#c05c00";
    const visibleTimes = times.slice(0, 7);
    const dropdownTimes = times.slice(7);
    const visibleValues = visibleTimes.map((option) => option.value);
    const dropdownValues = selectedValues.filter((value) =>
      dropdownTimes.some((option) => option.value === value),
    );
    const handleDropdownChange = (values: number[]) => {
      const next = [
        ...visibleValues.filter((value) => selectedValues.includes(value)),
        ...values,
      ];
      const labels = next
        .map(
          (value) =>
            times.find((option) => option.value === value)?.label ?? "",
        )
        .filter(Boolean);

      if (type === "pickup") setSelectedPickup(next);
      else setSelectedDrop(next);
      onChange?.(type, next, labels);
    };
    const handleClear = () => {
      if (type === "pickup") setSelectedPickup([]);
      else setSelectedDrop([]);
      onChange?.(type, [], []);
    };

    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 28 }}
      >
        {/* Label + clear button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 44,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {type === "pickup" ? "Login" : "Logout"}
          </span>
        </div>

        {/* Scrollable pills */}
        <div
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 2,
            flex: 1,
            display: "flex",
            gap: 4,
          }}
        >
          {times.length === 0 ? (
            <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>
          ) : (
            visibleTimes.map((option) => {
              const active = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleToggle(type, option, times, selectedValues)
                  }
                  style={{
                    flexShrink: 0,
                    borderRadius: 12,
                    // border: `1px solid ${active ? "#10B981" : "#CBD5E1"}`,
                    // backgroundColor: active ? "#ECFDF5" : "#FFFFFF",
                    // color: active ? "#059669" : "#475569",
                    border: `1px solid ${active ? activeBorder : "#CBD5E1"}`,
                    backgroundColor: active ? activeBg : "#FFFFFF",
                    color: active ? activeColor : "#475569",
                    fontSize: 12,
                    fontWeight: active ? 500 : 400,
                    padding: "0 10px",
                    height: 24,
                    lineHeight: "22px",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              );
            })
          )}
          {times.length > 7 && (
            <Select
              mode="multiple"
              size="small"
              popupClassName="no-check-icon-select"
              dropdownClassName="no-check-icon-select"
              menuItemSelectedIcon={null}
              value={dropdownValues}
              options={dropdownTimes.map((option) => ({
                value: option.value,
                label: (
                  <Checkbox
                    checked={dropdownValues.includes(option.value)}
                    style={{ pointerEvents: "none" }}
                  >
                    {option.label}
                  </Checkbox>
                ),
              }))}
              onChange={handleDropdownChange}
              placeholder="More shifts"
              maxTagCount={0}
              maxTagPlaceholder={(selected) => `+${selected.length} shifts`}
              style={{ minWidth: 105, flexShrink: 0 }}
              optionFilterProp="label"
            />
          )}
        </div>

        {/* Clear button — pinned to the right, only visible when something is selected */}
        <button
          onClick={handleClear}
          style={{
            flexShrink: 0,
            border: "none",
            background: "none",
            padding: "0 4px",
            cursor: "pointer",
            fontSize: 11,
            color: selectedValues.length > 0 ? "#f87171" : "transparent",
            pointerEvents: selectedValues.length > 0 ? "auto" : "none",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          title="Clear selection"
        >
          ✕
        </button>
      </div>
    );
  };
  const renderCombinedRow = () => {
    const allTimes: CombinedShiftOption[] = [
      ...pickupTimes.map((option) => ({ ...option, type: "pickup" as const })),
      ...dropTimes.map((option) => ({ ...option, type: "drop" as const })),
    ];
    const visibleTimes = allTimes.slice(0, 7);
    const dropdownTimes = allTimes.slice(7);
    const getKey = (option: CombinedShiftOption) =>
      `${option.type}-${option.value}`;
    const selectedKeys = allTimes
      .filter((option) =>
        option.type === "pickup"
          ? selectedPickup.includes(option.value)
          : selectedDrop.includes(option.value),
      )
      .map(getKey);
    const updateSelections = (keys: string[]) => {
      const nextPickup = allTimes
        .filter(
          (option) => option.type === "pickup" && keys.includes(getKey(option)),
        )
        .map((option) => option.value);
      const nextDrop = allTimes
        .filter(
          (option) => option.type === "drop" && keys.includes(getKey(option)),
        )
        .map((option) => option.value);
      setSelectedPickup(nextPickup);
      setSelectedDrop(nextDrop);
      onChange?.(
        "pickup",
        nextPickup,
        pickupTimes
          .filter((option) => nextPickup.includes(option.value))
          .map((option) => option.label),
      );
      onChange?.(
        "drop",
        nextDrop,
        dropTimes
          .filter((option) => nextDrop.includes(option.value))
          .map((option) => option.label),
      );
    };

    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 28 }}
      >
        <span
          style={{
            minWidth: 44,
            flexShrink: 0,
            fontSize: 10,
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          Shifts
        </span>
        <div
          style={{
            overflowX: "auto",
            flex: 1,
            display: "flex",
            gap: 4,
            paddingBottom: 2,
          }}
        >
          {visibleTimes.map((option) => {
            const active = selectedKeys.includes(getKey(option));
            const isPickup = option.type === "pickup";
            return (
              <button
                key={getKey(option)}
                onClick={() =>
                  updateSelections(
                    active
                      ? selectedKeys.filter((key) => key !== getKey(option))
                      : [...selectedKeys, getKey(option)],
                  )
                }
                style={{
                  flexShrink: 0,
                  borderRadius: 12,
                  border: `1px solid ${active ? (isPickup ? "#10B981" : "#fa8c16") : "#CBD5E1"}`,
                  backgroundColor: active
                    ? isPickup
                      ? "#ECFDF5"
                      : "#fff3e6"
                    : "#FFFFFF",
                  color: active
                    ? isPickup
                      ? "#059669"
                      : "#c05c00"
                    : "#475569",
                  fontSize: 11,
                  fontWeight: active ? 500 : 400,
                  padding: "0 10px",
                  height: 24,
                  lineHeight: "22px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            );
          })}{" "}
          <style>{`
          .no-check-icon-select .ant-select-item-option-state,
          .no-check-icon-select .ant-select-item-option-selected .ant-select-item-option-state {
            display: none !important;
          }
        `}</style>
          {allTimes.length > 7 && (
            <Select
              mode="multiple"
              size="small"
              popupClassName="no-check-icon-select"
              dropdownClassName="no-check-icon-select" // for antd v4
              menuItemSelectedIcon={null}
              value={selectedKeys.filter((key) =>
                dropdownTimes.some((option) => getKey(option) === key),
              )}
              options={dropdownTimes.map((option) => {
                const isPickup = option.type === "pickup";
                return {
                  value: getKey(option),
                  label: (
                    <Checkbox
                      checked={selectedKeys.includes(getKey(option))}
                      style={{
                        color: selectedKeys.includes(getKey(option))
                          ? isPickup
                            ? "#059669"
                            : "#c05c00"
                          : "#475569",
                        pointerEvents: "none",
                      }}
                    >
                      {option.label}
                    </Checkbox>
                  ),
                };
              })}
              onChange={updateSelections}
              placeholder="Shifts"
              maxTagCount={0}
              maxTagPlaceholder={(selected) => `+${selected.length} shifts`}
              style={{ minWidth: 105, flexShrink: 0 }}
              optionFilterProp="label"
            />
          )}
        </div>
        <button
          onClick={() => updateSelections([])}
          style={{
            border: "none",
            background: "none",
            padding: "0 4px",
            cursor: "pointer",
            fontSize: 11,
            color: selectedKeys.length > 0 ? "#f87171" : "transparent",
            pointerEvents: selectedKeys.length > 0 ? "auto" : "none",
          }}
          title="Clear selection"
        >
          ✕
        </button>
      </div>
    );
  };

  const showPickup = tripType === 0 || tripType === 1;
  const showDrop = tripType === 0 || tripType === 2;
  // Show skeletons while loading
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingBottom: 4,
        }}
      >
        {showPickup && renderSkeletonRow("Login")}
        {showDrop && renderSkeletonRow("Logout")}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingBottom: 4,
      }}
    >
      {tripType === 0 ? (
        renderCombinedRow()
      ) : (
        <>
          {showPickup && renderRow("pickup", pickupTimes, selectedPickup)}
          {showDrop && renderRow("drop", dropTimes, selectedDrop)}
        </>
      )}
    </div>
  );
}

type CombinedShiftOption = SelectOptions & { type: "pickup" | "drop" };
const renderSkeletonRow = (label: string) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 28 }}>
    <span
      style={{
        fontSize: 10,
        color: "#94a3b8",
        minWidth: 44,
        flexShrink: 0,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton.Button
          key={i}
          active
          size="small"
          style={{
            width: 64,
            height: 24,
            borderRadius: 12,
          }}
        />
      ))}
    </div>
  </div>
);
