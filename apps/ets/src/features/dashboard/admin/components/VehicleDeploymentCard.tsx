import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { VehicleDeployment } from '../types/admin.types';

const COLORS = ['#0ab3a0', '#4a6cf7', '#f59e0b', '#8b5cf6'];

export const VehicleDeploymentCard: React.FC<{ data: VehicleDeployment[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.map(d => ({ name: d.VehicleDeployment, value: d.Total }));
  return (
    <div className="card">
      <div className="card-title">Vehicle Deployment</div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} barSize={24}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};