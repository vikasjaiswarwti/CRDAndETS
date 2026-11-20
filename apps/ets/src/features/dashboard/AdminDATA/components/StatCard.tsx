import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: string | number;
  badge?: { text: string; positive?: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconBg, label, value, badge }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>
      <Icon size={18} color="#fff" />
    </div>
    <div className="stat-body">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
    {badge && (
      <span className={`stat-badge ${badge.positive === false ? 'neg' : 'pos'}`}>
        {badge.text}
      </span>
    )}
  </div>
);