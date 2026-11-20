import React from "react";
import type { UniqueVehicleDriverData } from "../types/admin.types";
import { CarOutlined, UserOutlined } from "@ant-design/icons";

export const UniqueVehicleDriverCard: React.FC<{
  data: UniqueVehicleDriverData;
}> = ({ data }) => (
  <div className="card">
    <div className="card-title">Total Vehicle / Driver</div>
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
        marginTop: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "6px solid #4a6cf7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <CarOutlined style={{ fontSize: 16, color: "#4a6cf7" }} size={28} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {data.VehicleTotal.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          Vehicles
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "6px solid #1a9e6b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <UserOutlined style={{ fontSize: 16, color: "#1a9e6b" }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {data.DriverTotal.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Drivers</div>
      </div>
    </div>
  </div>
);
