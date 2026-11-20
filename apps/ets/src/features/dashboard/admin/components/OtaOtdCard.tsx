import type { OTAOTDData } from "../types/admin.types";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";


const Gauge: React.FC<{ value: number; color: string; label: string }> = ({
  value,
  color,
  label,
}) => (
  <div className="compliance-gauge">
    <div style={{ position: "relative", width: 80, height: 80 }}>
      <PieChart width={80} height={80}>
        <Pie
          data={[{ v: value }, { v: 100 - value }]}
          cx={35}
          cy={35}
          startAngle={90}
          endAngle={-270}
          innerRadius={26}
          outerRadius={36}
          dataKey="v"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#f0f2f5" />
        </Pie>
      </PieChart>
      <span className="gauge-center-txt">{value}%</span>
    </div>
    <span className="compliance-label">{label}</span>
  </div>
);
export const OtaOtdCard = ({ data }: { data: OTAOTDData }) => {
  return (
    <div className="card">
      <div className="card-title">OTA / OTD</div>
      <div className="compliance-row">
        <Gauge value={data.Perc_OTA} color="#0ab3a0" label="OTA" />
        <Gauge value={data.Perc_OTD} color="#4a6cf7" label="OTD" />
      </div>
    </div>
  );
};
