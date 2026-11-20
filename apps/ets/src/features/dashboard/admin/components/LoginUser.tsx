import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useGetLoginUserReportQuery } from "../services/adminDashboardApi";
import type { LoginUserReport } from "../services/adminDashboardApi";

const toChartData = (data: LoginUserReport | undefined) => {
  if (!data) return [];

  const appUsers = data.data.filter(
    (user) => user.modelName !== null && user.appVersion != null,
  ).length;

  return [
    { label: "App Users", value: appUsers },
    { label: "Others", value: Math.max(data.count - appUsers, 0) },
  ];
};
const COLORS = ["#4a6cf7", "#0ab3a0", "#f59e0b", "#ef4444", "#8b5cf6"];

const LoginUser: React.FC = () => {
  const { data, isLoading, isError } = useGetLoginUserReportQuery();
  const chartData = toChartData(data);
  const totalUsers = data?.count ?? 0;

  return (
    <div className="card login-user-chart">
      <div className="card-title">Login Users</div>
      {isLoading ? (
        <div className="login-user-chart__state">Loading...</div>
      ) : isError || totalUsers === 0 ? (
        <div className="login-user-chart__state">
          {isError ? "Unable to load users" : "No users found"}
        </div>
      ) : (
        <>
          <div className="login-user-chart__graph">
            <div className="vtype-body">
              <div
                style={{
                  position: "relative",
                  width: 100,
                  height: 100,
                  flexShrink: 0,
                }}
              >
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={44}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="vtype-center">
                  {totalUsers}
                  <br />
                  <small>Total</small>
                </span>
              </div>
              <ul className="vtype-legend">
                {chartData.map((d, i) => (
                  <li key={d.label}>
                    <span
                      className="dot"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    {d.label} <strong>{d.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginUser;
