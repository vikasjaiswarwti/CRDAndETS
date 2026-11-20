import React from 'react';
import type { SafetySecurityData } from '../types/admin.types';

export const SafetySecurityCard: React.FC<{ data: SafetySecurityData }> = ({ data }) => (
  <div className="card">
    <div className="card-title">Safety &amp; Security</div>
    <table className="info-table">
      <tbody>
        <tr><td>Single Female Travelled</td><td className="val">{data.FemaleTravelled}</td></tr>
        <tr><td>Female Travelled</td><td className="val green">{data.FemaleTravelled}</td></tr>
        <tr><td>Female travelled in odd hours</td><td className="val">{data.FemaletravelledinOddHours}</td></tr>
        <tr><td>Escorts on Route</td><td className="val">{data.EscourtOnRoute}</td></tr>
        <tr><td>Reached Confirmations</td><td className="val">{data.ReachedConfirmations}</td></tr>
      </tbody>
    </table>
  </div>
);