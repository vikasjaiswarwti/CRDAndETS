import React from 'react';
import { Truck, User } from 'lucide-react';
import type { UniqueVehicleDriverData } from '../types/admin.types';

export const UniqueVehicleDriverCard: React.FC<{ data: UniqueVehicleDriverData }> = ({ data }) => (
  <div className="card">
    <div className="card-title">Unique Vehicle / Driver</div>
    <div className="uvd-row">
      <div className="uvd-item">
        <div className="uvd-icon"><Truck size={22} color="#0ab3a0" /></div>
        <div className="uvd-val">{data.VehicleTotal}</div>
        <div className="uvd-lbl">Unique Vehicle</div>
      </div>
      <div className="uvd-divider" />
      <div className="uvd-item">
        <div className="uvd-icon"><User size={22} color="#4a6cf7" /></div>
        <div className="uvd-val">{data.DriverTotal}</div>
        <div className="uvd-lbl">Unique Driver</div>
      </div>
    </div>
  </div>
);