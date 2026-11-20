import React from "react";
import { Slider } from "antd";
import { TOTAL_MINUTES } from "../constants/TripOption";

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

interface TimeRangeSliderProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  value,
  onChange,
}) => (
  <div style={{ minWidth: 300, padding: "4px 8px" }}>
    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
      {formatTime(value[0])} – {formatTime(value[1])}
    </div>
    <Slider
      range
      min={0}
      max={TOTAL_MINUTES}
      step={15}
      value={value}
      onChange={(v) => onChange(v as [number, number])}
      tooltip={{ formatter: (v) => formatTime(v ?? 0) }}
      styles={{
        track: { backgroundColor: "#3e8265" },
        rail: { backgroundColor: "#d9d9d9" },
        handle: {
          backgroundColor: "#fff",
          borderColor: "#3e8265",
          width: 14,
          height: 14,
          boxShadow: "none",
        },
      }}
    />
  </div>
);

export default TimeRangeSlider;
