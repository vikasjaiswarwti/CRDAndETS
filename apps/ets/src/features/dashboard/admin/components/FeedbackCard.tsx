import React from "react";
import {
  Tooltip,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Cell,
} from "recharts";
import type { FeedbackData } from "../types/admin.types";

const BAR_COLORS = ["#4a6cf7", "#0ab3a0", "#f7934a"];

export const FeedbackCard: React.FC<{ data: FeedbackData }> = ({ data }) => {
  const chartData = [
    { name: "Users", value: data.TotalUsers },
    { name: "Trips", value: data.TotalTrips },
    { name: "Feedbacks", value: data.TotalFeedbacks },
  ];

  return (
    <div className="card">
      <div className="card-title">Feedback Summary</div>

      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              formatter={(v: any) => [v.toLocaleString(), ""]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
        {chartData.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: BAR_COLORS[i] }} />
            <span style={{ fontSize: 12, color: "#888" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};