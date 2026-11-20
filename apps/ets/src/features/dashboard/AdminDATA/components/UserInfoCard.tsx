import React from 'react';
import type { UsersData } from '../types/admin.types';
import {fmtNum} from "../config/parsers"

export const UserInfoCard: React.FC<{ data: UsersData }> = ({ data }) => (
  <div className="card">
    <div className="card-title">User Info</div>
    <table className="info-table">
      <tbody>
        <tr><td>Registered Users</td><td className="val">{fmtNum(data.RegisteredUsers)}</td></tr>
        <tr><td>Active Users</td><td className="val green">{fmtNum(data.UniqueUserTravelled)}</td></tr>
        <tr><td>New Joiners</td><td className="val">{fmtNum(data.NewJoiners)}</td></tr>
        <tr><td>Attritions</td><td className="val">{fmtNum(data.Attritions)}</td></tr>
        <tr><td>No Show (Total)</td><td className="val red">{fmtNum(data.NoShowTotal)}</td></tr>
      </tbody>
    </table>
  </div>
);