import React from 'react';
import type { SafetyAndSecurity } from '../types/admin.types';

export const SafetySecurityCard: React.FC<{ data: SafetyAndSecurity }> = ({ data }) => (
  <div className="card">
    <div className="card-title">Safety &amp; Security</div>
    <table className="info-table">
      <tbody>
        <tr><td>Single Female Travelled</td><td className="val">{data.SingleFemaleTravelled}</td></tr>
        <tr><td>Female Travelled</td><td className="val green">{data.FemaleTravelled}</td></tr>
        {/* SingleFemaleTravelled":33,"FemaleTravelled":549 */}
        {/* <tr><td>Female travelled in odd hours</td><td className="val">{data.FemaletravelledinOddHours}</td></tr>
        <tr><td>Escorts on Route</td><td className="val">{data.EscourtOnRoute}</td></tr>
        <tr><td>Reached Confirmations</td><td className="val">{data.ReachedConfirmations}</td></tr> */}
      </tbody>
    </table>
  </div>
);