import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_TRIPS = [
  { date: 'Mar 05', Login: 19, Logout: 25 },
  { date: 'Mar 10', Login: 15, Logout: 16 },
  { date: 'Mar 17', Login: 16, Logout: 15 },
  { date: 'Mar 24', Login: 11, Logout: 16 },
  { date: 'Mar 31', Login: 15, Logout: 12 },
  { date: 'Apr 02', Login: 11, Logout: 12 },
];

interface TripSummaryProps {
  loginTotal: number;
  logoutTotal: number;
}

export const TripSummaryChart: React.FC<TripSummaryProps> = ({ loginTotal, logoutTotal }) => (
  <div className="card trip-summary">
    <div className="card-header-row">
      <div>
        <div className="card-title">Trip Summary</div>
        <div className="card-subtitle">Login and logout sections</div>
      </div>
      <div className="ts-totals">
        <span className="dot teal" /><span>Login: {loginTotal}</span>
        <span className="dot blue" style={{ marginLeft: 12 }} /><span>Logout: {logoutTotal}</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={MOCK_TRIPS} barSize={14} barGap={2}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="Login" fill="#0ab3a0" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Logout" fill="#4a6cf7" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);