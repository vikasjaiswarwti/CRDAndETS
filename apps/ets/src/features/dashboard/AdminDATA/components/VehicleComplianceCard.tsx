import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { ComplianceData } from '../types/admin.types';

const Gauge: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => (
  <div className="compliance-gauge">
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <PieChart width={80} height={80}>
        <Pie data={[{ v: value }, { v: 100 - value }]} cx={35} cy={35}
          startAngle={90} endAngle={-270} innerRadius={26} outerRadius={36}
          dataKey="v" strokeWidth={0}>
          <Cell fill={color} />
          <Cell fill="#f0f2f5" />
        </Pie>
      </PieChart>
      <span className="gauge-center-txt">{value}%</span>
    </div>
    <span className="compliance-label">{label}</span>
  </div>
);

export const VehicleComplianceCard: React.FC<{ data: ComplianceData }> = ({ data }) => (
  <div className="card">
    <div className="card-title">Vehicle / Compliance</div>
    <div className="compliance-row">
      <Gauge value={data.VehicleCompliance} color="#0ab3a0" label="Vehicle" />
      <Gauge value={data.DriverCompliance} color="#4a6cf7" label="Driver" />
    </div>
  </div>
);