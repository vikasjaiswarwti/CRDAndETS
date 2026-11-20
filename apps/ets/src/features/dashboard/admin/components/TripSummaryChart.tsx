import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TripSummaryItem {
  TripDate: string;
  LoginTrips: number;
  LogoutTrips: number;
}

interface TripSummaryProps {
  data: TripSummaryItem[];
}

export const TripSummaryChart: React.FC<TripSummaryProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    date: new Date(item.TripDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    }),
    Login: item.LoginTrips,
    Logout: item.LogoutTrips,
  }));

  const loginTotal = data.reduce((sum, item) => sum + item.LoginTrips, 0);
  const logoutTotal = data.reduce((sum, item) => sum + item.LogoutTrips, 0);

  return (
    <div className="card trip-summary">
      <div className="card-header-row">
        <div>
          <div className="card-title">Trip Summary</div>
          <div className="card-subtitle">Login and logout sections</div>
        </div>
        <div className="ts-totals">
          <span className="dot teal" />
          <span>Login: {loginTotal}</span>
          <span className="dot blue" style={{ marginLeft: 12 }} />
          <span>Logout: {logoutTotal}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={14} barGap={2}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="Login" fill="#0ab3a0" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Logout" fill="#4a6cf7" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};