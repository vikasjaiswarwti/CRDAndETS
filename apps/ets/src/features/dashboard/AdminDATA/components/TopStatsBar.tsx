import React from 'react';
import { Users, Navigation, UserX, Bell, Car } from 'lucide-react';
import { StatCard } from './StatCard';
import type { UsersData } from '../types/admin.types';
import { fmtNum } from '../config/parsers';

export const TopStatsBar: React.FC<{ data: UsersData }> = ({ data }) => (
  <div className="top-stats-bar">
    <StatCard icon={Users} iconBg="#0ab3a0" label="Total Users" value={fmtNum(data.RegisteredUsers)}
      badge={{ text: '+5.2%', positive: true }} />
    <StatCard icon={Navigation} iconBg="#4a6cf7" label="Total Trips" value={fmtNum(data.TotalTrips)}
      badge={{ text: '+3.1%', positive: true }} />
    <StatCard icon={UserX} iconBg="#ef4444" label="No Show" value={fmtNum(data.NoShowTotal)}
      badge={{ text: '-2.3%', positive: false }} />
    <StatCard icon={Bell} iconBg="#f59e0b" label="Adhoc Active" value={fmtNum(data.NewJoiners)}
      badge={{ text: '+4.5%', positive: true }} />
    <StatCard icon={Car} iconBg="#8b5cf6" label="Active Drivers" value={fmtNum(data.UniqueUserTravelled)}
      badge={{ text: '+5.5%', positive: true }} />
  </div>
);