// import React from 'react';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import type { VehicleUtilizationItem } from '../types/admin.types';

// export const VehicleUtilizationCard: React.FC<{ data: VehicleUtilizationItem[] }> = ({ data }) => {
//   console.log(data, "vehicle Utilization")
//   const overallPct = data.find(d => d.ReportType === 'VUI %')?.Total ?? 0;
//   return (
//     <div className="card">
//       <div className="card-header-row">
//         <div className="card-title">Vehicle Utilization</div>
//         <span className="badge-pct">{overallPct}%</span>
//       </div>
//       <ResponsiveContainer width="100%" height={100}>
//         <AreaChart data={data.map(d => ({ name: d.ReportType, value: d.Total }))}>
//           <defs>
//             <linearGradient id="vuGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#0ab3a0" stopOpacity={0.3} />
//               <stop offset="95%" stopColor="#0ab3a0" stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
//           <YAxis hide domain={[0, 100]} />
//           <Tooltip formatter={(v) => v != null ? `${v}%` : ''} />
//           <Area type="monotone" dataKey="value" stroke="#0ab3a0" strokeWidth={2}
//             fill="url(#vuGrad)" />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
// import type {
//   ValueType,
//   NameType,
// } from "recharts/types/component/DefaultTooltipContent";
import type { VehicleUtilizationItem } from "../types/admin.types";

export const VehicleUtilizationCard: React.FC<{
  data: VehicleUtilizationItem[];
}> = ({ data }) => {
  const overallPct = data.find((d) => d.ReportType === "VUI %")?.Total ?? 0;

  const chartData = data.map((item) => ({
    name: item.ReportType,
    value: item.Total,
  }));

  const colors = ["#0ab3a0", "#4a6cf7", "#f59e0b"];

  return (
    <div className="card">
      <div className="card-header-row">
        <div className="card-title">Vehicle Utilization</div>
        <span className="badge-pct">{overallPct}%</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={50}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(value) => [`${Number(value)}%`, "Percentage"]} />

          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
