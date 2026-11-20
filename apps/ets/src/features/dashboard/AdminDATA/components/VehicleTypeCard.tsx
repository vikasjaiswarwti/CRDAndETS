import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { VehicleTypeItem } from '../types/admin.types';

const COLORS = ['#4a6cf7', '#0ab3a0', '#f59e0b', '#ef4444', '#8b5cf6'];

export const VehicleTypeCard: React.FC<{ data: VehicleTypeItem[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.Total, 0);
  const chartData = data.map((d) => ({ name: d.VehicleTypeWise, value: d.Total }));

  return (
    <div className="card">
      <div className="card-title">Vehicle Type</div>
      <div className="vtype-body">
        <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={44}
                dataKey="value" strokeWidth={0}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="vtype-center">{total}<br /><small>Total</small></span>
        </div>
        <ul className="vtype-legend">
          {chartData.map((d, i) => (
            <li key={d.name}>
              <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
              {d.name} <strong>{d.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};