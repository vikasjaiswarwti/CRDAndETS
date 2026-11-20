import React, { useMemo, useState } from "react";
import { InputNumber, Modal, Tooltip } from "antd";
import {
  formatHour,
  getSpeedColor,
  SPEED_LEGEND_ITEMS,
} from "../constants/speedColor";
import { useUpdateSpeedProfileMutation } from "../services/speedServiceGridApi";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import type {
  CitySpeedCell,
  CitySpeedRow,
} from "../types/speedServiceGrid.types";

interface SpeedHeatmapProps {
  rows: CitySpeedRow[];
}

const SpeedHeatmap: React.FC<SpeedHeatmapProps> = ({ rows }) => {
  const [editingCell, setEditingCell] = useState<CitySpeedCell | null>(null);
  const [editValue, setEditValue] = useState<number | null>(null);

  const { mutate: updateSpeed, isLoading: isUpdating } = useApiMutation(
    useUpdateSpeedProfileMutation,
    { successMessage: "Avg speed updated" },
  );

  const closeEditor = () => {
    setEditingCell(null);
    setEditValue(null);
  };

  const handleSaveClick = () => {
    if (!editingCell || editValue === null) return;
    const { dayName, hourOfDay, avgSpeedKmh, speedID } = editingCell;

    Modal.confirm({
      title: "Confirm Update",
      content: `Update avg speed for ${dayName}, ${formatHour(hourOfDay)} from ${avgSpeedKmh} km/h to ${editValue} km/h?`,
      okText: "Update",
      cancelText: "Cancel",
      onOk: async () => {
        await updateSpeed({ speedID, avgSpeedKmh: editValue });
        closeEditor();
      },
    });
  };

  // Pivot API rows into hour × weekday.
  const { days, hours } = useMemo(() => {
    const dayMap = new Map<number, string>();

    const hourRows = rows
      .map((row) => {
        const byDay = new Map<number, CitySpeedCell>();
        row.data.forEach((cell) => {
          byDay.set(cell.dayOfWeek, cell);
          dayMap.set(cell.dayOfWeek, cell.dayName);
        });
        const hour = row.data[0]?.hourOfDay ?? parseInt(row.label, 10);
        return { hour, label: row.label, byDay };
      })
      .sort((a, b) => a.hour - b.hour);

    return {
      days: [...dayMap.entries()].sort(([a], [b]) => a - b),
      hours: hourRows,
    };
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-180 text-xs"
        style={{ borderCollapse: "separate", borderSpacing: 1 }}
      >
        <thead>
          <tr>
            <th className="w-18" />
            {days.map(([dayOfWeek, dayName]) => (
              <th
                key={dayOfWeek}
                className="py-2 text-center font-semibold text-gray-800 uppercase"
              >
                {dayName.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Hour rows — time label on every other hour, as in the design */}
          {hours.map(({ hour, label, byDay }) => (
            <tr key={label}>
              <td
                className="text-right font-semibold text-gray-800 uppercase"
                style={{ paddingRight: 4 }}
              >
                {hour % 2 === 0 ? formatHour(hour) : ""}
              </td>
              {days.map(([dayOfWeek, dayName]) => {
                const cell = byDay.get(dayOfWeek);
                if (!cell) {
                  return (
                    <td
                      key={dayOfWeek}
                      className="h-6 w-34 bg-gray-100 text-center text-gray-400"
                    >
                      —
                    </td>
                  );
                }
                return (
                  <Tooltip
                    key={dayOfWeek}
                    title={`${dayName}, ${formatHour(hour)} — ${cell.avgSpeedKmh} km/h`}
                  >
                    <td
                      className="h-6 w-34 text-center cursor-pointer"
                      style={getSpeedColor(cell.avgSpeedKmh)}
                      onClick={() => {
                        setEditingCell(cell);
                        setEditValue(cell.avgSpeedKmh);
                      }}
                    >
                      {Math.round(cell.avgSpeedKmh)} km/h
                    </td>
                  </Tooltip>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      {days.length > 0 && (
        <div
          className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600"
          style={{ margin: "12px 0" }}
        >
          {SPEED_LEGEND_ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: color }}
              />
              <span>{label} km/h</span>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal — opened on cell click; actual update runs behind a confirm step */}
      <Modal
        title={
          editingCell
            ? `Edit Avg Speed — ${editingCell.dayName}, ${formatHour(editingCell.hourOfDay)}`
            : "Edit Avg Speed"
        }
        open={!!editingCell}
        onCancel={closeEditor}
        onOk={handleSaveClick}
        okText="Save"
        confirmLoading={isUpdating}
      >
        <InputNumber
          className="w-full"
          min={0}
          value={editValue}
          onChange={(value) => setEditValue(value)}
          addonAfter="km/h"
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default SpeedHeatmap;
