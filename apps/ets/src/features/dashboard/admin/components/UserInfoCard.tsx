import React from 'react';
import type { UserStatusSummary } from '../types/admin.types';
import {fmtNum} from "../config/parsers"
// {"RegisteredUsers":275,"ActiveUsers":230,"Inactive":0}
export const UserInfoCard: React.FC<{ data: UserStatusSummary }> = ({ data }) => (
  <div className="card">
    <div className="card-title">User Info</div>
    <table className="info-table">
      <tbody>
        <tr><td>Registered Users</td><td className="val">{fmtNum(data.RegisteredUsers)}</td></tr>
        <tr><td>Active Users</td><td className="val green">{fmtNum(data.ActiveUsers)}</td></tr>
        <tr><td>Inactive Users</td><td className="val">{fmtNum(data.Inactive)}</td></tr>
        {/* <tr><td>Attritions</td><td className="val">{fmtNum(data.Attritions)}</td></tr>
        <tr><td>No Show (Total)</td><td className="val red">{fmtNum(data.NoShowTotal)}</td></tr> */}
      </tbody>
    </table>
  </div>
);